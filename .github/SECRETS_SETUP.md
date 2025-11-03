# GitHub Secrets Configuration for E2E Tests

## Required Secrets

To run E2E tests in GitHub Actions, you need to configure the following secrets in your repository:

### 1. TEST_SUPABASE_URL

- **Value**: Your Supabase project URL
- **Example**: `https://xxxxxxxxxxxxx.supabase.co`
- **Where to find**: Supabase Dashboard → Project Settings → API → Project URL

### 2. TEST_SUPABASE_ANON_KEY

- **Value**: Your Supabase anonymous key
- **Where to find**: Supabase Dashboard → Project Settings → API → Project API keys → `anon` `public`

### 3. TEST_SUPABASE_SERVICE_ROLE_KEY

- **Value**: Your Supabase service role key
- **Where to find**: Supabase Dashboard → Project Settings → API → Project API keys → `service_role` (⚠️ Keep this secret!)

## How to Add Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add each secret with the exact name listed above
5. Paste the corresponding value from your Supabase Dashboard
6. Click **"Add secret"**

## Security Notes

⚠️ **IMPORTANT:**

- Never commit these values to your repository
- The `service_role` key has admin privileges - keep it secure
- Use a dedicated test Supabase project (not production)
- Regularly rotate your keys for security

## Testing the Setup

After adding secrets:

1. Push a commit to `master`, `main`, or `develop` branch
2. Go to **Actions** tab in GitHub
3. Watch the "E2E Tests" workflow run
4. Check for the "✅ .env.e2e file exists" message in logs

## Troubleshooting

### Tests fail with "Connection refused"

- Verify that secrets are correctly configured
- Check that secret names match exactly (case-sensitive)

### Tests timeout during startup

- Ensure your Supabase project is running
- Check Supabase project limits and quotas

### Build fails

- Verify that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
- Check that your Supabase project allows connections from GitHub Actions IPs

## Next Steps

Once secrets are configured:

- E2E tests will run automatically on push/PR
- You can also trigger tests manually via workflow_dispatch
- Tests run daily at midnight UTC (optional, can be disabled)
