# PowerShell helper functions for test database operations (Windows)
# Usage: .\scripts\test-db-functions.ps1 <command>
# Commands: verify | reset | stats

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("verify", "reset", "stats")]
    [string]$Command
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

    Get-Content ".env.e2e" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            $value = $value -replace '^["'']|["'']$', ''
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
        Write-Info "Install PostgreSQL client tools from: https://www.postgresql.org/download/windows/"
        return $false
    }
}

# Verify connection to test database
function Test-Connection {
    try {
        $result = & psql $env:TARGET_DATABASE_URL --tuples-only --command "SELECT 1;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Connection to test database successful"
            return $true
        } else {
            Write-Err "Connection failed"
            return $false
        }
    } catch {
        Write-Err "Connection failed: $_"
        return $false
    }
}

# Verify test data exists
function Test-TestData {
    Write-Host ""
    Write-Info "Verifying test data..."

    try {
        $ingredientCount = (& psql $env:TARGET_DATABASE_URL --tuples-only --command "SELECT COUNT(*) FROM public.ingredients;" 2>&1 | Select-Object -First 1).Trim()
        $recipeCount = (& psql $env:TARGET_DATABASE_URL --tuples-only --command "SELECT COUNT(*) FROM public.recipes;" 2>&1 | Select-Object -First 1).Trim()
        $userCount = (& psql $env:TARGET_DATABASE_URL --tuples-only --command "SELECT COUNT(*) FROM auth.users;" 2>&1 | Select-Object -First 1).Trim()

        Write-Host "  [DATA] Ingredients: $ingredientCount" -ForegroundColor Cyan
        Write-Host "  [DATA] Recipes: $recipeCount" -ForegroundColor Cyan
        Write-Host "  [DATA] Users: $userCount" -ForegroundColor Cyan

        $ingredientNum = [int]::Parse($ingredientCount)
        $recipeNum = [int]::Parse($recipeCount)

        if ($ingredientNum -ge 5 -and $recipeNum -ge 3) {
            Write-Success "Test data verification passed"
            return $true
        } else {
            Write-Warn "Insufficient test data!"
            Write-Info "Expected: >=5 ingredients, >=3 recipes"
            Write-Info "Run: npm run db:clone"
            return $false
        }
    } catch {
        Write-Err "Verification failed: $_"
        return $false
    }
}

# Reset test database (drop all data)
function Reset-TestDatabase {
    Write-Host ""
    Write-Warn "This will DELETE ALL DATA in the test database!"
    $confirmation = Read-Host "Type 'yes' to confirm"

    if ($confirmation -ne "yes") {
        Write-Info "Reset cancelled"
        exit 0
    }

    Write-Info "Resetting test database..."

    try {
        $resetSQL = @"
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
"@

        $resetSQL | & psql $env:TARGET_DATABASE_URL

        if ($LASTEXITCODE -eq 0) {
            Write-Success "Test database reset complete"
            Write-Info "Run 'npm run db:clone' to restore schema and data"
        } else {
            Write-Err "Reset failed"
            exit 1
        }
    } catch {
        Write-Err "Reset failed: $_"
        exit 1
    }
}

# Show test database statistics
function Show-DatabaseStats {
    Write-Host ""
    Write-Info "Test Database Statistics"
    Write-Host "========================" -ForegroundColor Cyan

    try {
        # Public schema stats
        Write-Host "`n[SCHEMA] Public Schema:" -ForegroundColor Yellow
        $ingredientCount = (& psql $env:TARGET_DATABASE_URL --tuples-only --command "SELECT COUNT(*) FROM public.ingredients;" 2>&1 | Select-Object -First 1).Trim()
        $recipeCount = (& psql $env:TARGET_DATABASE_URL --tuples-only --command "SELECT COUNT(*) FROM public.recipes;" 2>&1 | Select-Object -First 1).Trim()

        Write-Host "  - Ingredients: $ingredientCount"
        Write-Host "  - Recipes: $recipeCount"

        # Recipe breakdown by meal type
        $breakfastCount = (& psql $env:TARGET_DATABASE_URL --tuples-only --command "SELECT COUNT(*) FROM public.recipes WHERE 'breakfast' = ANY(meal_types);" 2>&1 | Select-Object -First 1).Trim()
        $lunchCount = (& psql $env:TARGET_DATABASE_URL --tuples-only --command "SELECT COUNT(*) FROM public.recipes WHERE 'lunch' = ANY(meal_types);" 2>&1 | Select-Object -First 1).Trim()
        $dinnerCount = (& psql $env:TARGET_DATABASE_URL --tuples-only --command "SELECT COUNT(*) FROM public.recipes WHERE 'dinner' = ANY(meal_types);" 2>&1 | Select-Object -First 1).Trim()

        Write-Host "    * Breakfasts: $breakfastCount"
        Write-Host "    * Lunches: $lunchCount"
        Write-Host "    * Dinners: $dinnerCount"

        # User schema stats
        Write-Host "`n[SCHEMA] User Schema:" -ForegroundColor Yellow
        $userCount = (& psql $env:TARGET_DATABASE_URL --tuples-only --command "SELECT COUNT(*) FROM auth.users;" 2>&1 | Select-Object -First 1).Trim()
        $profileCount = (& psql $env:TARGET_DATABASE_URL --tuples-only --command "SELECT COUNT(*) FROM public.user_profiles;" 2>&1 | Select-Object -First 1).Trim()
        $mealPlanCount = (& psql $env:TARGET_DATABASE_URL --tuples-only --command "SELECT COUNT(*) FROM public.user_meal_plans;" 2>&1 | Select-Object -First 1).Trim()

        Write-Host "  - Users: $userCount"
        Write-Host "  - Profiles: $profileCount"
        Write-Host "  - Meal Plans: $mealPlanCount"

        # Database size
        Write-Host "`n[STORAGE] Database Size:" -ForegroundColor Yellow
        $dbSize = (& psql $env:TARGET_DATABASE_URL --tuples-only --command "SELECT pg_size_pretty(pg_database_size(current_database()));" 2>&1 | Select-Object -First 1).Trim()
        Write-Host "  - Size: $dbSize"

        Write-Host ""
    } catch {
        Write-Err "Failed to gather statistics: $_"
        exit 1
    }
}

# Main execution
Write-Host ""
Write-Host "[TOOL] Test Database Helper (Windows)" -ForegroundColor Magenta
Write-Host "======================================" -ForegroundColor Magenta

# Load configuration
Load-EnvFile

# Check required tools
if (-not (Test-PostgresqlClient)) {
    exit 1
}

$TARGET_DATABASE_URL = [Environment]::GetEnvironmentVariable("TARGET_DATABASE_URL")

if (-not $TARGET_DATABASE_URL) {
    Write-Err "Missing TARGET_DATABASE_URL in .env.e2e"
    exit 1
}

# Test connection
if (-not (Test-Connection)) {
    exit 1
}

# Execute command
switch ($Command) {
    "verify" {
        if (Test-TestData) {
            exit 0
        } else {
            exit 1
        }
    }
    "reset" {
        Reset-TestDatabase
    }
    "stats" {
        Show-DatabaseStats
    }
}

Write-Host ""
