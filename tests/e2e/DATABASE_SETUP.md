# Database Setup Guide for E2E Tests

Complete guide for setting up a dedicated test database for Playwright E2E tests.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start (5 minutes)](#quick-start-5-minutes)
- [Detailed Setup](#detailed-setup)
- [Database Cloning](#database-cloning)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)
- [CI/CD Setup](#cicd-setup)

---

## Overview

### Why a Separate Test Database?

✅ **Isolation** - Tests don't interfere with development data
✅ **Safety** - No risk of accidentally modifying real data
✅ **Performance** - Smaller dataset = faster tests
✅ **Predictability** - Known data state for reliable tests
✅ **CI/CD Ready** - Easy to replicate in GitHub Actions

### Architecture

```
Development Database (zoboolccvhudurofisos.supabase.co)
    ├── Full dataset (all recipes, ingredients)
    ├── Dev user data
    └── Real-time development

            ↓ Clone (scripts/clone-database.sh)

Test Database (your-test-project.supabase.co)
    ├── Schema only (tables, functions, RLS)
    ├── Test subset (~10 ingredients, ~5 recipes)
    └── Clean slate for E2E tests
```

---

## Prerequisites

- Supabase account (Free Tier is sufficient)
- PostgreSQL client tools (`psql`, `pg_dump`, `pg_restore`)
- Node.js 20+ and npm

### Install PostgreSQL Tools

**Windows:**

```powershell
# Option 1: Install via Chocolatey
choco install postgresql

# Option 2: Download installer from:
# https://www.postgresql.org/download/windows/
# During installation, select "Command Line Tools"
# Add to PATH: C:\Program Files\PostgreSQL\16\bin
```

**macOS:**

```bash
brew install postgresql
```

**Linux:**

```bash
sudo apt-get install postgresql-client  # Ubuntu/Debian
sudo yum install postgresql             # CentOS/RHEL
```

**Verify installation:**

```bash
# Windows PowerShell, macOS, or Linux
psql --version
pg_dump --version

# Expected output: "psql (PostgreSQL) 16.x"
```

> **Windows Note**: Scripts work in both PowerShell and Git Bash. PowerShell versions (`.ps1`) are automatically used when running `npm run db:*` commands on Windows.

---

## Quick Start (5 minutes)

### 1. Create Test Project in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New project"**
3. Fill in details:
   - **Name**: `lowcarbplaner-test`
   - **Database Password**: **Save this!** You'll need it
   - **Region**: Same as dev (EU Central for Poland)
   - **Pricing Plan**: Free
4. Click **"Create new project"**
5. Wait ~2 minutes for provisioning

### 2. Get API Credentials

Once project is ready:

1. Go to **Settings** → **API**
2. Copy these values:

```
Project URL:     https://YOUR_PROJECT_REF.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Get Database Connection String

1. Go to **Settings** → **Database**
2. Scroll to **Connection string**
3. Select **URI** tab
4. Copy the connection string
5. **Replace `[YOUR-PASSWORD]`** with the password from step 1

```
postgresql://postgres.YOUR_PROJECT_REF:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

### 4. Configure Environment

```bash
# Copy template
cp .env.e2e.example .env.e2e

# Edit .env.e2e and fill in:
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# For database cloning:
SOURCE_DATABASE_URL=postgresql://postgres.YOUR_DEV_PROJECT:DEV_PASSWORD@...
TARGET_DATABASE_URL=postgresql://postgres.YOUR_TEST_PROJECT:TEST_PASSWORD@...
```

### 5. Clone Database

```bash
# Test connection first (dry run)
npm run db:clone -- --dry-run

# Clone schema + test data
npm run db:clone

# Expected output:
# ✅ Schema dumped
# ✅ Target database cleaned
# ✅ Schema restored
# ✅ Test data seeded
# ✅ Database cloned successfully!
#
# 📊 Statistics:
#     Ingredients: 10
#     Recipes: 5
#     Recipe Ingredients: ~20
```

### 6. Verify Setup

```bash
# Check database stats
npm run db:test:stats

# Run a test
npm run test:e2e:chromium -- --grep "login"
```

**Done!** Your test database is ready. 🎉

---

## Detailed Setup

### Understanding Connection Strings

Supabase provides two types of connection strings:

#### 1. **Pooler Connection** (Recommended for scripts)

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

- Uses connection pooling
- Better for scripts and CI/CD
- Port: **6543**

#### 2. **Direct Connection**

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

- Direct database access
- Use for heavy operations
- Port: **5432**

**For this project, use Pooler connection strings.**

### Getting Database Password

If you forgot your database password:

1. Go to **Settings** → **Database**
2. Click **"Reset database password"**
3. Enter new password
4. Click **"Update password"**
5. **Update `.env.e2e`** with new password

⚠️ **Warning**: This resets the password for ALL connections!

---

## Database Cloning

### What Gets Cloned?

#### ✅ Included:

- **Schema**: All tables, columns, indexes
- **Functions**: Custom PL/pgSQL functions
- **Triggers**: Auto-update triggers
- **RLS Policies**: Row-level security
- **Enums**: Custom types (meal_type_enum, etc.)
- **Test Data**: Minimal subset (10 ingredients, 5 recipes)

#### ❌ NOT Included:

- **Auth Users**: Test users are created per-test
- **Storage Files**: Recipe images (not needed for tests)
- **Realtime Subscriptions**: Not applicable
- **Full Dataset**: Only minimal test data

### Cloning Options

#### Standard Clone (Test Subset)

```bash
npm run db:clone
```

- Fastest (~30 seconds)
- 10 ingredients, 5 recipes
- Sufficient for all E2E tests

#### Full Clone (All Data)

```bash
npm run db:clone -- --full-seed
```

- Slower (~2 minutes)
- All ingredients (~100+)
- All recipes (~30+)
- Use if testing recipe variety

#### Dry Run (Preview)

```bash
npm run db:clone -- --dry-run
```

- Shows what would be cloned
- No actual changes
- Verifies connection strings

### Manual Cloning Steps

If scripts don't work, you can clone manually:

#### 1. Dump Schema

```bash
pg_dump "postgresql://..." \
  --schema-only \
  --schema=public \
  --schema=content \
  --no-owner \
  --no-acl \
  -f schema.sql
```

#### 2. Clean Target Database

```sql
-- Run in Supabase SQL Editor or psql
DROP SCHEMA IF EXISTS public CASCADE;
DROP SCHEMA IF EXISTS content CASCADE;
CREATE SCHEMA public;
CREATE SCHEMA content;
```

#### 3. Restore Schema

```bash
psql "postgresql://..." -f schema.sql
```

#### 4. Seed Data

```bash
psql "postgresql://..." -f supabase/test-seed.sql
```

---

## Maintenance

### Resetting Test Database

If tests fail or data gets corrupted:

```bash
# Reset to clean state
npm run db:test:reset

# Re-clone schema + data
npm run db:clone
```

### Updating Test Data

After adding new migrations:

```bash
# Re-clone schema
npm run db:clone

# Or manually apply migration
psql $TARGET_DATABASE_URL -f supabase/migrations/NEW_MIGRATION.sql
```

### Checking Database State

```bash
# Show stats
npm run db:test:stats

# Verify test data exists
npm run db:test:verify

# Test connection
bash scripts/test-db-functions.sh connection
```

---

## Troubleshooting

### Common Issues

#### 1. "Connection refused" or "Could not connect"

**Problem**: Can't connect to database

**Solutions**:

```bash
# Check credentials in .env.e2e
cat .env.e2e

# Verify connection string format
# Correct: postgresql://postgres.[REF]:[PASS]@aws-0-...
# Wrong: postgresql://[REF]:[PASS]@aws-0-... (missing "postgres.")

# Test connection manually
psql "$TARGET_DATABASE_URL" -c "SELECT 1"

# Check if password has special characters (needs escaping)
# Replace ! with %21, @ with %40, etc.
```

#### 2. "relation does not exist"

**Problem**: Tables not found after cloning

**Solutions**:

```bash
# Verify schema was cloned
psql "$TARGET_DATABASE_URL" -c "\dt public.*"
psql "$TARGET_DATABASE_URL" -c "\dt content.*"

# Re-clone
npm run db:clone

# Check migration files exist
ls supabase/migrations/
```

#### 3. "permission denied for schema auth"

**Problem**: Trying to access Supabase internal schemas

**Solutions**:

- **Don't clone** `auth` or `storage` schemas
- Use `--schema=public --schema=content` flags in pg_dump
- Cloning script already handles this

#### 4. "pg_dump: command not found"

**Problem**: PostgreSQL tools not installed

**Solutions**:

```bash
# Windows
choco install postgresql

# macOS
brew install postgresql

# Linux
sudo apt-get install postgresql-client

# Verify
pg_dump --version
```

#### 5. Test data not found

**Problem**: Recipes/ingredients missing

**Solutions**:

```bash
# Check if seed file exists
ls -l supabase/test-seed.sql

# Manually seed
psql "$TARGET_DATABASE_URL" -f supabase/test-seed.sql

# Verify
npm run db:test:verify
```

### Debugging Tips

**Enable verbose logging:**

```bash
# Add -v flag to pg_dump/restore
pg_dump ... -v -f backup.sql 2>&1 | tee dump.log
```

**Check Supabase logs:**

1. Dashboard → Logs → Database
2. Look for connection errors
3. Check RLS policy violations

**Test connection components:**

```bash
# Can you reach the host?
ping aws-0-eu-central-1.pooler.supabase.com

# Can you connect to the port?
telnet aws-0-eu-central-1.pooler.supabase.com 6543

# Can you authenticate?
psql "$TARGET_DATABASE_URL" -c "SELECT current_user;"
```

---

## CI/CD Setup

### GitHub Actions

The test database can be used in CI/CD with GitHub Secrets:

#### 1. Add Secrets

Go to **Repository Settings** → **Secrets and variables** → **Actions**

Add these secrets:

```
TEST_SUPABASE_URL=https://your-test-project.supabase.co
TEST_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TEST_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TEST_DATABASE_URL=postgresql://postgres....
```

#### 2. Update Workflow

See [.github/workflows/e2e-tests.yml](../../.github/workflows/e2e-tests.yml)

```yaml
- name: Setup test database
  run: |
    # Option A: Re-clone before each run (slow but clean)
    npm run db:clone

    # Option B: Use existing data (fast but may be stale)
    npm run db:test:verify || npm run db:clone

- name: Run E2E tests
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SERVICE_KEY }}
  run: npm run test:e2e
```

---

## Best Practices

### ✅ Do's

- ✅ Use separate test project (not dev/prod)
- ✅ Clone schema regularly (when migrations change)
- ✅ Use minimal test data subset
- ✅ Reset database between test suite runs
- ✅ Store credentials in `.env.e2e` (gitignored)
- ✅ Document any manual setup steps

### ❌ Don'ts

- ❌ Don't share test DB with development
- ❌ Don't commit `.env.e2e` to Git
- ❌ Don't use production data for tests
- ❌ Don't forget to update test DB after migrations
- ❌ Don't rely on existing data (auto-seed in fixtures)

---

## FAQ

**Q: Do I need to re-clone after every test run?**
A: No. Clone once, then tests create/cleanup their own data. Only re-clone when schema changes.

**Q: Can I use my development database for tests?**
A: **Not recommended**. Tests create/delete data which could corrupt dev data.

**Q: What if I don't have a Supabase paid plan?**
A: Free tier is sufficient. You get 2 projects for free.

**Q: How do I update test database when I add migrations?**
A: Run `npm run db:clone` to re-apply schema from dev.

**Q: Can I use Supabase Local instead?**
A: Yes! See alternative guide: [SUPABASE_LOCAL.md](./SUPABASE_LOCAL.md) _(coming soon)_

---

## Support

- **Issues**: Create issue in GitHub repository
- **E2E Guide**: [README.md](./README.md)
- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)

---

**Setup complete!** Your test database is ready for E2E testing. 🚀
