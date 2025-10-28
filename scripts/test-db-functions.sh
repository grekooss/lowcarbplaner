#!/bin/bash
# ============================================================
# Test Database Helper Functions
# Purpose: Common database operations for E2E testing
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Load environment
load_env() {
    if [ ! -f ".env.e2e" ]; then
        log_error ".env.e2e file not found"
        exit 1
    fi
    source .env.e2e
}

# Verify database connection
verify_connection() {
    local DB_URL=$1
    local DB_NAME=$2

    log_info "Testing connection to $DB_NAME database..."

    if psql "$DB_URL" -c "SELECT 1" > /dev/null 2>&1; then
        log_success "Connected to $DB_NAME database"
        return 0
    else
        log_error "Failed to connect to $DB_NAME database"
        return 1
    fi
}

# Reset test database to clean state
reset_test_db() {
    load_env

    log_info "Resetting test database..."

    # Drop and recreate schemas
    psql "$TARGET_DATABASE_URL" <<EOF 2>&1 | grep -v "NOTICE:" || true
DROP SCHEMA IF EXISTS public CASCADE;
DROP SCHEMA IF EXISTS content CASCADE;
CREATE SCHEMA public;
CREATE SCHEMA content;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA content TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, service_role;
GRANT ALL ON SCHEMA content TO postgres, service_role;
EOF

    log_success "Test database reset"
}

# Verify test data exists
verify_test_data() {
    load_env

    log_info "Verifying test data..."

    local INGREDIENT_COUNT=$(psql "$TARGET_DATABASE_URL" -t -c "SELECT COUNT(*) FROM content.ingredients;" 2>/dev/null || echo "0")
    local RECIPE_COUNT=$(psql "$TARGET_DATABASE_URL" -t -c "SELECT COUNT(*) FROM content.recipes;" 2>/dev/null || echo "0")

    echo "Ingredients: $INGREDIENT_COUNT"
    echo "Recipes: $RECIPE_COUNT"

    if [ "$INGREDIENT_COUNT" -ge 5 ] && [ "$RECIPE_COUNT" -ge 3 ]; then
        log_success "Test data verified"
        return 0
    else
        log_error "Insufficient test data"
        return 1
    fi
}

# Show database stats
show_stats() {
    load_env

    echo "========================================"
    echo "📊 Test Database Statistics"
    echo "========================================"
    echo ""

    # Tables count
    local TABLE_COUNT=$(psql "$TARGET_DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema IN ('public', 'content');")
    echo "Tables: $TABLE_COUNT"

    # Content schema
    echo ""
    echo "Content Schema:"
    local ING_COUNT=$(psql "$TARGET_DATABASE_URL" -t -c "SELECT COUNT(*) FROM content.ingredients;" 2>/dev/null || echo "0")
    local RECIPE_COUNT=$(psql "$TARGET_DATABASE_URL" -t -c "SELECT COUNT(*) FROM content.recipes;" 2>/dev/null || echo "0")
    local RECIPE_ING_COUNT=$(psql "$TARGET_DATABASE_URL" -t -c "SELECT COUNT(*) FROM content.recipe_ingredients;" 2>/dev/null || echo "0")
    echo "  - Ingredients: $ING_COUNT"
    echo "  - Recipes: $RECIPE_COUNT"
    echo "  - Recipe Ingredients: $RECIPE_ING_COUNT"

    # Public schema
    echo ""
    echo "Public Schema:"
    local PROFILE_COUNT=$(psql "$TARGET_DATABASE_URL" -t -c "SELECT COUNT(*) FROM public.profiles;" 2>/dev/null || echo "0")
    local MEAL_COUNT=$(psql "$TARGET_DATABASE_URL" -t -c "SELECT COUNT(*) FROM public.planned_meals;" 2>/dev/null || echo "0")
    echo "  - Profiles: $PROFILE_COUNT"
    echo "  - Planned Meals: $MEAL_COUNT"

    echo ""
    echo "========================================"
}

# Export function for sourcing
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    # Script is being executed, not sourced
    case "${1:-}" in
        verify)
            verify_test_data
            ;;
        reset)
            reset_test_db
            ;;
        stats)
            show_stats
            ;;
        connection)
            load_env
            verify_connection "$TARGET_DATABASE_URL" "test"
            ;;
        *)
            echo "Usage: $0 {verify|reset|stats|connection}"
            exit 1
            ;;
    esac
fi
