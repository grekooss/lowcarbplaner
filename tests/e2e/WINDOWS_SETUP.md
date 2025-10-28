# Windows Setup Guide for E2E Tests

Quick reference guide for setting up E2E tests on Windows.

## Prerequisites

### 1. Install PostgreSQL Client Tools

**Option A: Chocolatey (Recommended)**

```powershell
# Install Chocolatey if not already installed
# https://chocolatey.org/install

# Install PostgreSQL
choco install postgresql
```

**Option B: Official Installer**

1. Download from: https://www.postgresql.org/download/windows/
2. Run installer, select "Command Line Tools"
3. Add to PATH: `C:\Program Files\PostgreSQL\16\bin`
4. Restart PowerShell

**Verify installation:**

```powershell
psql --version
pg_dump --version
# Expected: "psql (PostgreSQL) 16.x"
```

### 2. Configure Execution Policy (First Time Only)

PowerShell may block script execution by default:

```powershell
# Check current policy
Get-ExecutionPolicy

# If it's "Restricted", change it:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Confirm change
Get-ExecutionPolicy
# Should show: RemoteSigned
```

## Quick Setup (5 Minutes)

### Step 1: Create Test Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New project"
3. Fill in:
   - Name: `lowcarbplaner-test`
   - Database Password: **Save this!**
   - Region: EU Central (same as dev)
   - Plan: Free
4. Wait ~2 minutes

### Step 2: Get Credentials

From your test project dashboard:

1. Go to **Settings** → **API**
2. Copy:
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key

3. Go to **Settings** → **Database**
4. Copy connection string (Connection Pooler, port 6543)
5. Click "Show password" and copy it

### Step 3: Configure Environment

Copy the example file:

```powershell
Copy-Item .env.e2e.example .env.e2e
```

Edit `.env.e2e` in your editor and fill in:

```env
# TEST PROJECT CREDENTIALS
NEXT_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_test_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_test_service_role_key_here

# DATABASE CLONING - Source (Dev Database)
SOURCE_DATABASE_URL=postgresql://postgres.zoboolccvhudurofisos:[DEV_PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

# DATABASE CLONING - Target (Test Database)
TARGET_DATABASE_URL=postgresql://postgres.your-test-project:[TEST_PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**Important**: Replace:

- `[DEV_PASSWORD]` with your dev database password
- `[TEST_PASSWORD]` with your test database password
- `your-test-project` with your actual test project ref

### Step 4: Clone Database

Test the connection first (dry run):

```powershell
npm run db:clone:dry-run
```

If successful, clone the database:

```powershell
npm run db:clone
```

Expected output:

```
✅ Schema dumped successfully
✅ Target database cleaned
✅ Schema restored successfully
✅ Test data seeded successfully
✅ Verification complete:
  📊 Ingredients: 10
  📊 Recipes: 5

✅ Database cloning completed!
```

### Step 5: Verify Setup

```powershell
npm run db:test:verify
```

Expected output:

```
✅ Connection to test database successful
ℹ️  Verifying test data...
  📊 Ingredients: 10
  📊 Recipes: 5
  👤 Users: 0
✅ Test data verification passed
```

### Step 6: Run E2E Tests

```powershell
# Run all tests
npm run test:e2e

# Or use UI mode (recommended)
npm run test:e2e:ui
```

## Available Commands

All commands work the same on Windows:

```powershell
# Database operations
npm run db:clone              # Clone schema + test data
npm run db:clone:full         # Clone full database
npm run db:clone:dry-run      # Test without changes
npm run db:test:verify        # Verify test data exists
npm run db:test:stats         # Show database statistics
npm run db:test:reset         # Reset test database

# E2E testing
npm run test:e2e              # Run all tests
npm run test:e2e:ui           # Open Playwright UI
npm run test:e2e:debug        # Debug mode
npm run test:e2e:headed       # See browser
npm run test:e2e:chromium     # Chrome only
npm run test:e2e:report       # View last report
```

## Troubleshooting

### "bash: command not found"

✅ **Fixed!** The project now auto-detects Windows and uses PowerShell scripts (`.ps1`) instead of bash scripts (`.sh`).

### "psql: command not found"

❌ **Problem**: PostgreSQL client tools not installed or not in PATH

✅ **Solution**:

1. Install PostgreSQL (see Prerequisites above)
2. Add to PATH: `C:\Program Files\PostgreSQL\16\bin`
3. Restart PowerShell
4. Verify: `psql --version`

### "execution of scripts is disabled"

❌ **Problem**: PowerShell execution policy is Restricted

✅ **Solution**:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "FATAL: password authentication failed"

❌ **Problem**: Incorrect database password in `.env.e2e`

✅ **Solution**:

1. Go to Supabase Dashboard → Settings → Database
2. Copy password (or reset if lost)
3. Update `SOURCE_DATABASE_URL` and `TARGET_DATABASE_URL` in `.env.e2e`
4. Format: `postgresql://postgres.PROJECT:[PASSWORD]@...`

### "connection to server failed"

❌ **Problem**: Incorrect connection string or network issue

✅ **Solution**:

1. Check connection string format (must use port **6543** for pooler)
2. Verify project ref in URL matches your Supabase project
3. Test connection manually:
   ```powershell
   psql "postgresql://postgres.PROJECT:PASSWORD@HOST:6543/postgres" -c "SELECT 1;"
   ```

### "Insufficient test data"

❌ **Problem**: Database is empty or partially seeded

✅ **Solution**:

```powershell
# Re-clone the database
npm run db:clone

# Verify data
npm run db:test:stats
```

### "Tests failing with 'Test data not found'"

❌ **Problem**: Tests are using dev database instead of test database

✅ **Solution**:

1. Verify `.env.e2e` exists (not `.env.e2e.example`)
2. Check `NEXT_PUBLIC_SUPABASE_URL` points to **test project**
3. Restart Playwright test runner

## Direct PowerShell Usage

You can also run scripts directly:

```powershell
# Clone database
.\scripts\clone-database.ps1

# Clone with full seed data
.\scripts\clone-database.ps1 -FullSeed

# Dry run (test only)
.\scripts\clone-database.ps1 -DryRun

# Database helpers
.\scripts\test-db-functions.ps1 verify
.\scripts\test-db-functions.ps1 stats
.\scripts\test-db-functions.ps1 reset
```

## What's Different on Windows?

The project automatically detects Windows and uses PowerShell scripts:

| Command            | Linux/macOS                      | Windows                                 |
| ------------------ | -------------------------------- | --------------------------------------- |
| `npm run db:clone` | `bash scripts/clone-database.sh` | `powershell scripts/clone-database.ps1` |
| Platform detection | Manual                           | Automatic via `process.platform`        |
| Script syntax      | Bash                             | PowerShell                              |
| Execution policy   | N/A                              | May need `RemoteSigned`                 |

Everything else (Playwright tests, fixtures, page objects) works identically across platforms.

## Next Steps

Once setup is complete:

1. Read [E2E Testing Guide](./README.md) for testing best practices
2. Review [Quick Start Guide](./QUICKSTART.md) for common workflows
3. Check [Database Setup Guide](./DATABASE_SETUP.md) for advanced topics
4. Start writing tests or run existing ones!

## Getting Help

If you encounter issues:

1. Check [DATABASE_SETUP.md](./DATABASE_SETUP.md) Troubleshooting section
2. Verify all prerequisites are installed
3. Test database connection manually with `psql`
4. Check `.env.e2e` configuration carefully

Common issues are usually:

- ❌ Missing PostgreSQL client tools
- ❌ PowerShell execution policy
- ❌ Wrong database password
- ❌ Wrong connection string format (use port 6543!)
