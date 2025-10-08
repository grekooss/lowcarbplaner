# Conventional Commits - Przewodnik

## 📋 Konfiguracja VSCode

### Metoda 1: Interaktywny Commit (Zalecane)

```bash
npm run commit
```

Pojawi się interaktywny kreator, który przeprowadzi Cię przez proces tworzenia commita zgodnego z Conventional Commits.

### Metoda 2: Extension VSCode

Zainstaluj **Conventional Commits** extension:

- `Ctrl+Shift+X` → szukaj "Conventional Commits" (autor: vivaxy)
- Użycie: `Ctrl+Shift+P` → "Conventional Commits"

## 🎯 Format Commit Message

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Type (Wymagane)

| Type       | Opis                | Przykład                                               |
| ---------- | ------------------- | ------------------------------------------------------ |
| `feat`     | Nowa funkcjonalność | `feat(meals): add meal swap functionality`             |
| `fix`      | Naprawa błędu       | `fix(calculator): correct BMR calculation for females` |
| `docs`     | Dokumentacja        | `docs(readme): update setup instructions`              |
| `style`    | Formatowanie kodu   | `style(ui): fix button padding`                        |
| `refactor` | Refaktoryzacja      | `refactor(auth): simplify login logic`                 |
| `perf`     | Optymalizacja       | `perf(meals): optimize meal query`                     |
| `test`     | Testy               | `test(calculator): add BMR edge cases`                 |
| `chore`    | Konserwacja         | `chore(deps): update dependencies`                     |
| `ci`       | CI/CD               | `ci(github): add deploy workflow`                      |
| `build`    | Build system        | `build(next): configure turbopack`                     |
| `revert`   | Cofnięcie           | `revert: revert feat(meals): add swap`                 |

### Scope (Opcjonalny, ale zalecany)

Określa obszar aplikacji:

- `onboarding` - proces onboardingu i kalkulator BMR/TDEE
- `meals` - plan posiłków, przepisy, wymiana posiłków
- `progress` - śledzenie dziennych postępów
- `shopping` - lista zakupów
- `auth` - autentykacja i autoryzacja
- `profile` - profil użytkownika
- `ui` - komponenty UI
- `db` - baza danych, migracje
- `api` - API endpoints, Server Actions
- `config` - konfiguracja projektu

### Subject (Wymagane)

- Pisane małymi literami
- Tryb rozkazujący ("add" zamiast "added" lub "adds")
- Bez kropki na końcu
- Maksymalnie 50 znaków

### Body (Opcjonalny)

- Wyjaśnia **dlaczego** i **co** zostało zmienione
- Oddzielony pustą linią od subject
- Każda linia maksymalnie 72 znaki

### Footer (Opcjonalny)

- Breaking changes: `BREAKING CHANGE: <opis>`
- Issue references: `Closes #123`, `Fixes #456`

## ✅ Dobre Przykłady

```bash
# Feature
feat(meals): add meal swap functionality

# Fix
fix(calculator): correct BMR formula for females
Subject in body clarifies BMR calculation was using wrong multiplier
for females (10 instead of correct value from Mifflin-St Jeor equation)

# Breaking change
feat(auth)!: change authentication flow

BREAKING CHANGE: Users must re-authenticate after this update.
The session storage format has changed.

# Multiple scopes
feat(meals,shopping): sync shopping list with meal plan changes
```

## ❌ Złe Przykłady

```bash
# Zbyt ogólne
fix: fixed bug

# Wielka litera
Fix(meals): Fixed the meal swap

# Kropka na końcu
feat(meals): add meal swap.

# Tryb przeszły
feat(meals): added meal swap

# Za długie
feat(meals): add meal swap functionality that allows users to change their meals in the weekly plan
```

## 🛡️ Automatyczna Walidacja

Git hook (`commit-msg`) automatycznie sprawdza format commita:

```bash
git commit -m "invalid message"
# ❌ Commit zostanie odrzucony
# ✅ Popraw format i spróbuj ponownie
```

## 🚀 Workflow

### Standardowy commit w terminalu

```bash
# Dodaj pliki
git add .

# Interaktywny commit
npm run commit

# Lub bezpośredni commit (zostanie zwalidowany)
git commit -m "feat(meals): add meal swap"
```

### W VSCode Source Control

1. Stage pliki (`+` obok plików)
2. Wpisz commit message w formacie Conventional Commits
3. `Ctrl+Enter` lub kliknij ✓ Commit
4. Hook automatycznie zwaliduje format

## 📝 Template dla VSCode

Możesz dodać szablon commit message do `.vscode/settings.json`:

```json
{
  "git.inputValidation": "always",
  "git.inputValidationLength": 72,
  "git.inputValidationSubjectLength": 50
}
```

## 🔗 Przydatne Linki

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [commitlint Documentation](https://commitlint.js.org/)
- [commitizen Documentation](https://commitizen-tools.github.io/commitizen/)
