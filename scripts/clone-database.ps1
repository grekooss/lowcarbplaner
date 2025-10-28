# PowerShell script for cloning database (Windows)
# Usage: .\scripts\clone-database.ps1 [-DryRun] [-FullSeed]

param(
    [switch]$DryRun,
    [switch]$FullSeed
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success { param($Message) Write-Host "[OK] $Message" -ForegroundColor Green }
function Write-Err { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Warn { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }

# Load environment variables from .env.e2e
function Load-EnvFile {
    if (-not (Test-Path ".env.e2e")) {
        Write-Err "Missing .env.e2e file!"
        Write-Info "Copy .env.e2e.example to .env.e2e and configure it"
        exit 1
    }

    Write-Info "Loading .env.e2e configuration..."
    Get-Content ".env.e2e" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            # Remove quotes if present
            $value = $value -replace '^[''"]|[''"]$'
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Check if psql is available
function Test-PostgresqlClient {
    try {
        $null = Get-Command psql -ErrorAction Stop
        return $true
    } catch {
        Write-Err "psql command not found!"
        Write-Info "Install PostgreSQL client tools:"
        Write-Info "  1. Download from: https://www.postgresql.org/download/windows/"
        Write-Info "  2. Or install via Chocolatey: choco install postgresql"
        Write-Info "  3. Add to PATH: C:\Program Files\PostgreSQL\16\bin"
        return $false
    }
}

# Main execution
Write-Host ""
Write-Host "[CLONE] Database Cloning Tool (Windows)" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

if ($DryRun) {
    Write-Warn "DRY RUN MODE - No changes will be made"
}

# Load configuration
Load-EnvFile

# Check required tools
if (-not (Test-PostgresqlClient)) {
    exit 1
}

# Get environment variables
$SOURCE_DATABASE_URL = [Environment]::GetEnvironmentVariable("SOURCE_DATABASE_URL")
$TARGET_DATABASE_URL = [Environment]::GetEnvironmentVariable("TARGET_DATABASE_URL")

if (-not $SOURCE_DATABASE_URL -or -not $TARGET_DATABASE_URL) {
    Write-Err "Missing database URLs in .env.e2e"
    Write-Info "Required variables: SOURCE_DATABASE_URL, TARGET_DATABASE_URL"
    exit 1
}

# Create backup directory
$BACKUP_DIR = "backups"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR\test-db-backup-$TIMESTAMP.sql"

if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

$maskedSource = $SOURCE_DATABASE_URL -replace 'postgresql://([^:]+):([^@]+)@', 'postgresql://$1:***@'
$maskedTarget = $TARGET_DATABASE_URL -replace 'postgresql://([^:]+):([^@]+)@', 'postgresql://$1:***@'
Write-Info "Source: $maskedSource"
Write-Info "Target: $maskedTarget"
Write-Info "Backup: $BACKUP_FILE"
Write-Host ""

if ($DryRun) {
    Write-Success "Dry run validation passed!"
    Write-Info "Run without -DryRun flag to execute cloning"
    exit 0
}

# Step 1: Dump schema from source
Write-Info "Step 1/5: Dumping schema from source database..."
try {
    $pgDumpArgs = @(
        $SOURCE_DATABASE_URL,
        "--schema-only",
        "--schema=public",
        "--schema=content",
        "--no-owner",
        "--no-acl",
        "--file=$BACKUP_FILE"
    )

    & pg_dump @pgDumpArgs

    if ($LASTEXITCODE -ne 0) {
        $errMsg = "pg_dump failed with exit code $LASTEXITCODE"
        throw $errMsg
    }

    Write-Success "Schema dumped successfully"
} catch {
    Write-Err "Failed to dump schema: $_"
    exit 1
}

# Step 2: Clean target database
Write-Info "Step 2/5: Cleaning target database..."
try {
    $cleanSQL = @"
DROP SCHEMA IF EXISTS public CASCADE;
DROP SCHEMA IF EXISTS content CASCADE;
CREATE SCHEMA public;
CREATE SCHEMA content;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA content TO postgres;
"@

    $cleanSQL | & psql $TARGET_DATABASE_URL

    if ($LASTEXITCODE -ne 0) {
        $errMsg = "Database cleanup failed with exit code $LASTEXITCODE"
        throw $errMsg
    }

    Write-Success "Target database cleaned"
} catch {
    Write-Err "Failed to clean database: $_"
    exit 1
}

# Step 2.5: Fix schema references in backup file
Write-Info "Step 2.5/5: Fixing schema references (content -> public)..."
try {
    $content = Get-Content $BACKUP_FILE -Raw
    $content = $content -replace 'content\.ingredients', 'public.ingredients'
    $content = $content -replace 'content\.recipes', 'public.recipes'
    $content = $content -replace 'content\.recipe_ingredients', 'public.recipe_ingredients'
    $content | Set-Content $BACKUP_FILE -NoNewline
    Write-Success "Schema references fixed"
} catch {
    Write-Warn "Failed to fix schema references: $_"
}

# Step 3: Restore schema
Write-Info "Step 3/5: Restoring schema to target database..."
try {
    & psql $TARGET_DATABASE_URL --file=$BACKUP_FILE

    if ($LASTEXITCODE -ne 0) {
        $errMsg = "Schema restore failed with exit code $LASTEXITCODE"
        throw $errMsg
    }

    Write-Success "Schema restored successfully"
} catch {
    Write-Err "Failed to restore schema: $_"
    exit 1
}

# Step 4: Seed test data
$SEED_FILE = if ($FullSeed) { "supabase\seed.sql" } else { "supabase\test-seed.sql" }

if (-not (Test-Path $SEED_FILE)) {
    Write-Warn "Seed file not found: $SEED_FILE"
    Write-Info "Skipping data seeding"
} else {
    Write-Info "Step 4/5: Seeding test data from $SEED_FILE..."
    try {
        & psql $TARGET_DATABASE_URL --file=$SEED_FILE

        if ($LASTEXITCODE -ne 0) {
            $errMsg = "Data seeding failed with exit code $LASTEXITCODE"
            throw $errMsg
        }

        Write-Success "Test data seeded successfully"
    } catch {
        Write-Err "Failed to seed data: $_"
        exit 1
    }
}

# Step 5: Verify data
Write-Info "Step 5/5: Verifying test data..."
try {
    $countSQL1 = "SELECT COUNT(*) FROM public.ingredients;"
    $countSQL2 = "SELECT COUNT(*) FROM public.recipes;"

    $ingredientCount = & psql $TARGET_DATABASE_URL --tuples-only --command $countSQL1 | ForEach-Object { $_.Trim() }
    $recipeCount = & psql $TARGET_DATABASE_URL --tuples-only --command $countSQL2 | ForEach-Object { $_.Trim() }

    Write-Success "Verification complete:"
    Write-Host "  [DATA] Ingredients: $ingredientCount" -ForegroundColor Cyan
    Write-Host "  [DATA] Recipes: $recipeCount" -ForegroundColor Cyan

    if ([int]$ingredientCount -lt 5 -or [int]$recipeCount -lt 3) {
        Write-Warn "Low data count detected. Expected at least 5 ingredients and 3 recipes."
    }
} catch {
    Write-Warn "Failed to verify data: $_"
}

Write-Host ""
Write-Success "Database cloning completed!"
Write-Info "You can now run E2E tests with: npm run test:e2e"
Write-Host ""
