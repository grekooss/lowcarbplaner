# ⚡ Quick Fix - E2E Tests

## 🔴 Co Jest Nie Tak?

**2 problemy:**

1. ✅ **Port 3000 conflict** - NAPRAWIONE w `playwright.config.ts`
2. ⚠️ **Permission denied** - WYMAGA TWOJEJ AKCJI (5 minut)

---

## 🚀 3-Step Fix

### 1️⃣ Otwórz Supabase Dashboard SQL Editor

https://supabase.com/dashboard → **Test Project** → **SQL Editor**

### 2️⃣ Skopiuj i Uruchom Ten SQL

```sql
-- Grant full permissions
GRANT ALL ON public.profiles TO authenticated, service_role;
GRANT ALL ON public.planned_meals TO authenticated, service_role;
GRANT ALL ON public.shopping_list TO authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- Add RLS policies (jeśli RLS jest ON)
CREATE POLICY "service_role_all_profiles" ON public.profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "users_own_profile" ON public.profiles
  FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
```

### 3️⃣ Uruchom Testy

```bash
npm run test:e2e:chromium
```

---

## ✅ Sukces = Zobaczysz To

```
✅ Created test user: test-xxx@lowcarbplaner.test
✅ Created test profile for: test-xxx@lowcarbplaner.test  <-- TO!
✅ Profile verified in database
  ✓ 60+ tests passed
```

**Nie zobaczysz:**

```
❌ Failed to create profile: permission denied  <-- ZNIKNIE
```

---

## 🆘 Nadal Nie Działa?

**Sprawdź `.env.e2e` - musi mieć SERVICE_ROLE_KEY:**

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # Ten klucz ma admin rights!
```

**Gdzie znaleźć:** Supabase Dashboard → Settings → API → "service_role secret" → Reveal

---

## 📚 Pełna Dokumentacja

- [FIX_GUIDE.md](./FIX_GUIDE.md) - Szczegółowy przewodnik z debug tips
- [TEST_ISSUES_REPORT.md](./TEST_ISSUES_REPORT.md) - Analiza problemu
- [README.md](./README.md) - Complete E2E guide

---

**Time to fix**: ~5 minut 🚀
