# AGENTS — Supabase

## Zasady

- Włącz RLS dla każdej tabeli w `public.*`.
- Dodaj 4 polityki (SELECT/INSERT/UPDATE/DELETE) z `auth.uid()`.
- Dane referencyjne trzymaj w `content.*` (read‑only przez RLS).

## Migracje

- Nazewnictwo: `YYYYMMDDHHmmss_description.sql`.
- Zakazane: DROP/TRUNCATE/CASCADE bez planu rollback.

## Po migracji

- Wygeneruj typy TS → `types/database.types.ts`.
- Uruchom testy i smoke E2E.
