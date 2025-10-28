#!/bin/bash
# ============================================================
# Database Cloning Script for LowCarbPlaner
# Purpose: Clone schema + subset data from dev to test project
# Usage: ./scripts/clone-database.sh [--dry-run] [--full-seed]
# ============================================================

set -e  # Exit on error

# Colors for output
RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================
# Configuration
# ============================================================

# Check if .env.e2e exists
if [ ! -f ".env.e2e" ]; then
    echo -e "${RED}❌ Error: .env.e2e file not found${NC}"
    echo -e "${YELLOW}💡 Copy .env.e2e.example to .env.e2e and fill in your credentials${NC}"
    echo "   cp .env.e2e.example .env.e2e"
    exit 1
fi

# Load environment variables
source .env.e2e

# Check required variables
if [ -z "$SOURCE_DATABASE_URL" ] || [ -z "$TARGET_DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: SOURCE_DATABASE_URL or TARGET_DATABASE_URL not set in .env.e2e${NC}"
    exit 1
fi

# Parse arguments
DRY_RUN=false
FULL_SEED=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --full-seed)
            FULL_SEED=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--dry-run] [--full-seed]"
            exit 1
            ;;
    esac
done

# Backup directory
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/schema_backup_$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

# ============================================================
# Functions
# ============================================================

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ============================================================
# Main Script
# ============================================================

echo "========================================"
echo "🔄 Database Cloning Script"
echo "========================================"
echo ""

if [ "$DRY_RUN" = true ]; then
    log_warning "DRY RUN MODE - No changes will be made"
    echo ""
fi

# Step 1: Dump schema from source
log_info "Step 1/5: Dumping schema from source database..."

if [ "$DRY_RUN" = false ]; then
    pg_dump "$SOURCE_DATABASE_URL" \
        --schema-only \
        --schema=public \
        --schema=content \
        --no-owner \
        --no-acl \
        -f "$BACKUP_FILE" 2>&1 | grep -v "NOTICE:" || true

    if [ $? -eq 0 ] && [ -f "$BACKUP_FILE" ]; then
        log_success "Schema dumped to: $BACKUP_FILE"
    else
        log_error "Failed to dump schema"
        exit 1
    fi
else
    log_info "Would dump schema to: $BACKUP_FILE"
fi

# Step 2: Clean target database
log_info "Step 2/5: Cleaning target database schemas..."

if [ "$DRY_RUN" = false ]; then
    psql "$TARGET_DATABASE_URL" <<EOF 2>&1 | grep -v "NOTICE:" || true
-- Drop existing schemas (CASCADE removes dependent objects)
DROP SCHEMA IF EXISTS public CASCADE;
DROP SCHEMA IF EXISTS content CASCADE;

-- Recreate schemas
CREATE SCHEMA public;
CREATE SCHEMA content;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA content TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, service_role;
GRANT ALL ON SCHEMA content TO postgres, service_role;
EOF

    if [ $? -eq 0 ]; then
        log_success "Target database cleaned"
    else
        log_error "Failed to clean target database"
        exit 1
    fi
else
    log_info "Would clean public and content schemas"
fi

# Step 2.5: Fix schema references in backup file
log_info "Step 2.5/5: Fixing schema references (content -> public)..."

if [ "$DRY_RUN" = false ]; then
    sed -i 's/content\.ingredients/public.ingredients/g' "$BACKUP_FILE"
    sed -i 's/content\.recipes/public.recipes/g' "$BACKUP_FILE"
    sed -i 's/content\.recipe_ingredients/public.recipe_ingredients/g' "$BACKUP_FILE"
    log_success "Schema references fixed"
else
    log_info "Would fix schema references in backup file"
fi

# Step 3: Restore schema to target
log_info "Step 3/5: Restoring schema to target database..."

if [ "$DRY_RUN" = false ]; then
    psql "$TARGET_DATABASE_URL" -f "$BACKUP_FILE" 2>&1 | grep -v "NOTICE:" || true

    if [ $? -eq 0 ]; then
        log_success "Schema restored successfully"
    else
        log_error "Failed to restore schema"
        exit 1
    fi
else
    log_info "Would restore schema from: $BACKUP_FILE"
fi

# Step 4: Seed test data
log_info "Step 4/5: Seeding test data..."

if [ "$FULL_SEED" = true ]; then
    log_info "Using FULL seed data (seed_ingredients.sql + seed_recipes.sql)"
    SEED_FILES=("supabase/seed_ingredients.sql" "supabase/seed_recipes.sql")
else
    log_info "Using TEST SUBSET (test-seed.sql)"
    SEED_FILES=("supabase/test-seed.sql")
fi

if [ "$DRY_RUN" = false ]; then
    for SEED_FILE in "${SEED_FILES[@]}"; do
        if [ -f "$SEED_FILE" ]; then
            log_info "Importing: $SEED_FILE"
            psql "$TARGET_DATABASE_URL" -f "$SEED_FILE" 2>&1 | grep -E "NOTICE|✅|📊" || true
        else
            log_warning "Seed file not found: $SEED_FILE (skipping)"
        fi
    done
    log_success "Test data seeded"
else
    for SEED_FILE in "${SEED_FILES[@]}"; do
        log_info "Would import: $SEED_FILE"
    done
fi

# Step 5: Verification
log_info "Step 5/5: Verifying database state..."

if [ "$DRY_RUN" = false ]; then
    echo ""
    echo "📊 Database Statistics:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Count tables
    TABLE_COUNT=$(psql "$TARGET_DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema IN ('public', 'content');")
    echo "Tables: $TABLE_COUNT"

    # Count ingredients
    INGREDIENT_COUNT=$(psql "$TARGET_DATABASE_URL" -t -c "SELECT COUNT(*) FROM public.ingredients;" 2>/dev/null || echo "0")
    echo "Ingredients: $INGREDIENT_COUNT"

    # Count recipes
    RECIPE_COUNT=$(psql "$TARGET_DATABASE_URL" -t -c "SELECT COUNT(*) FROM public.recipes;" 2>/dev/null || echo "0")
    echo "Recipes: $RECIPE_COUNT"

    # Count recipe_ingredients
    RECIPE_ING_COUNT=$(psql "$TARGET_DATABASE_URL" -t -c "SELECT COUNT(*) FROM public.recipe_ingredients;" 2>/dev/null || echo "0")
    echo "Recipe Ingredients: $RECIPE_ING_COUNT"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Verify minimum data
    if [ "$INGREDIENT_COUNT" -lt 5 ]; then
        log_warning "Only $INGREDIENT_COUNT ingredients found (expected ≥5)"
    fi

    if [ "$RECIPE_COUNT" -lt 3 ]; then
        log_warning "Only $RECIPE_COUNT recipes found (expected ≥3)"
    fi
else
    log_info "Would verify: table counts, ingredient counts, recipe counts"
fi

# Success message
echo ""
echo "========================================"
if [ "$DRY_RUN" = false ]; then
    log_success "Database cloned successfully!"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Verify data: npm run db:test:verify"
    echo "   2. Run E2E tests: npm run test:e2e"
    echo ""
    echo "📁 Schema backup saved to: $BACKUP_FILE"
else
    log_success "Dry run completed - no changes made"
    echo ""
    echo "🎯 To execute for real, run without --dry-run:"
    echo "   npm run db:clone"
fi
echo "========================================"
