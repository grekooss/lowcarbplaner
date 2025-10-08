# CI/CD Pipeline

## GitHub Actions Workflow

### Kompletny Workflow

Plik: `.github/workflows/ci.yml`

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Format check
        run: npm run format:check

      - name: Type check
        run: npx tsc --noEmit

      - name: Unit tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: E2E tests
        run: npm run test:e2e
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

---

## Deployment (Cloudflare Pages)

### 1. Automatic Deployment

- **Main Branch**: Automatycznie deploy do produkcji
- **Pull Requests**: Preview deployments

### 2. Environment Variables

Skonfiguruj w Cloudflare Pages Dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Build Configuration

```toml
# wrangler.toml (opcjonalnie)
name = "lowcarbplaner"
compatibility_date = "2025-01-01"

[build]
command = "npm run build"
[build.environment]
NODE_VERSION = "20"
```

---

📚 **Więcej szczegółów:** Zobacz inne pliki w `.claude/docs/`
