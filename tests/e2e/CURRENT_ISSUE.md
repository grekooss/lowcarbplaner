# Current Issue - Schema Permission Denied

## Error

```
Error code: 42501
Message: permission denied for schema public
Location: tests/e2e/fixtures/auth.ts:89
```

## What We've Tried (All ✅ Confirmed Working)

1. **GRANT Permissions**: ✅ service_role has ALL privileges on tables
2. **RLS Policies**: ✅ Created proper RLS policies with USING (true)
3. **Disabled RLS**: ✅ Completely disabled RLS (`rowsecurity = false`)
4. **Verified Credentials**: ✅ `.env.e2e` has correct service_role key

## Current Hypothesis

**Problem**: Schema-level permissions missing

Even with table-level GRANT and disabled RLS, PostgreSQL requires schema-level permissions:

- `GRANT USAGE ON SCHEMA public`
- `GRANT ALL ON SCHEMA public`

## Next Steps

### 1. Verify Schema Permissions (30 seconds)

Run in Supabase SQL Editor:

```sql
SELECT
    has_schema_privilege('service_role', 'public', 'USAGE') as has_usage,
    has_schema_privilege('service_role', 'public', 'CREATE') as has_create;
```

**Expected Results**:

If schema permissions missing:

```
has_usage: false
has_create: false
```

If schema permissions OK:

```
has_usage: true
has_create: true
```

### 2. Fix Schema Permissions (30 seconds)

**If `has_usage = false`**, run in Supabase SQL Editor:

```sql
-- Grant schema permissions
GRANT USAGE ON SCHEMA public TO service_role, authenticated, anon;
GRANT ALL ON SCHEMA public TO service_role, authenticated;

-- Grant all object permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role, authenticated;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO service_role, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO service_role, authenticated;
```

### 3. Run Tests

```bash
npm run test:e2e:chromium
```

Expected: ✅ 68 tests passing

## If Still Failing

If `has_usage = true` but tests still fail, investigate:

1. **Connection Pooler**: Try direct connection instead of pooler
2. **PostgREST Cache**: Pause/Resume Supabase project
3. **SDK Issue**: Use direct PostgreSQL connection (`pg` library)

## Files

- **Polish Guide**: [NAPRAW_SCHEMA_PERMISSIONS.md](./NAPRAW_SCHEMA_PERMISSIONS.md)
- **Verify SQL**: [verify-schema-access.sql](./verify-schema-access.sql)
- **Fix SQL**: [fix-schema-permissions.sql](./fix-schema-permissions.sql)
- **Full History**: [HISTORIA_PROBLEMU.md](./HISTORIA_PROBLEMU.md)

---

**Last Updated**: October 29, 2025
**Status**: 🔍 Investigating schema permissions
