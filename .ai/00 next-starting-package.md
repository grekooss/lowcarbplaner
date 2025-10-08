# Next.js 15: Kompletny Pakiet Startowy (Best Practices)

Ten przewodnik pomoże Ci skonfigurować nowy projekt Next.js 15 z najlepszymi praktykami deweloperskimi, zapewniając spójność, jakość kodu, doskonałe doświadczenie deweloperskie (DX) i gotowość do pracy zespołowej.

### TL;DR (Pigułka dla niecierpliwych)

1.  **Inicjalizacja projektu:** `npx create-next-app@latest` (wybierz TypeScript, ESLint, Tailwind CSS, `src/`, App Router).
2.  **Formatter (Prettier):** `npm install --save-dev prettier prettier-plugin-tailwindcss`
3.  **Integracja ESLint + Prettier:** `npm install --save-dev eslint-config-prettier` + konfiguracja `.eslintrc.json`.
4.  **Automatyzacja (hooki gita - Husky):** `npm install --save-dev husky lint-staged`
5.  **Uruchomienie Husky:** `npx husky init`
6.  **Konfiguracja hooków:** Dodaj `pre-commit` (lint-staged) i `pre-push` (build).
7.  **Standard commitów (Commitlint):** `npm install --save-dev @commitlint/cli @commitlint/config-conventional` + hook `commit-msg`.
8.  **EditorConfig:** Plik `.editorconfig` dla spójności wcięć/stylów.
9.  **TypeScript:** Zaostrzenie ustawień (`tsconfig.json`) i rozszerzenie konfiguracji ESLint dla TS.
10. **VS Code:** Zespołowe ustawienia edytora (`.vscode/settings.json`).
11. **`.gitignore`:** Rozszerzenie o typowe pliki do ignorowania.
12. **Skrypty `package.json`:** Dodatkowe skrypty do walidacji kodu.
13. **CVA (Class Variance Authority):** `npm install class-variance-authority clsx tailwind-merge` dla wariantów komponentów.
14. **Prettier + Tailwind CSS:** Konfiguracja pluginu dla `cn`/`cva`.

---

### Krok po Kroku: Szczegółowe Wyjaśnienie

#### 1. Inicjalizacja Projektu Next.js 15

Zaczynamy od stworzenia projektu Next.js, korzystając z oficjalnego instalatora, który automatycznie konfiguruje wiele podstawowych narzędzi.

```bash
npx create-next-app@latest my-next15-app
```

Podczas instalacji **koniecznie wybierz**:

- **Would you like to use TypeScript?** ✅ **Yes**
- **Would you like to use ESLint?** ✅ **Yes**
- **Would you like to use Tailwind CSS?** ✅ **Yes**
- **Would you like to use `src/` directory?** ✅ **No**
- **Would you like to use App Router?** ✅ **Yes**
- **Customize the default import alias?** (Możesz zostawić domyślny `@/*`)

Po tym kroku masz już projekt z TypeScriptem, ESLintem i Tailwindem. Czas go ulepszyć.

#### 2. Prettier - Automatyczne Formatowanie Kodu

Prettier dba o estetykę kodu, zapewniając spójne formatowanie.

1.  **Instalacja:**
    - `prettier`: główna biblioteka.
    - `prettier-plugin-tailwindcss`: specjalny plugin, który automatycznie sortuje klasy Tailwind CSS.

    ```bash
    npm install --save-dev prettier prettier-plugin-tailwindcss
    ```

2.  **Konfiguracja Prettiera (`.prettierrc.json`):**
    Stwórz w głównym folderze projektu plik `.prettierrc.json` z konfiguracją:

    ```json:.prettierrc.json
    {
      "semi": false,
      "singleQuote": true,
      "jsxSingleQuote": true,
      "trailingComma": "es5",
      "tabWidth": 2,
      "printWidth": 80,
      "plugins": ["prettier-plugin-tailwindcss"],
      "tailwindFunctions": ["cn", "cva"]
    }
    ```

    > `tailwindFunctions` jest istotne dla poprawnego sortowania klas w funkcjach pomocniczych CVA.

3.  **Integracja z ESLint (`eslint-config-prettier`):**
    Biblioteka `eslint-config-prettier` wyłącza reguły ESLinta, które kolidują z Prettierem, zapobiegając konfliktom.

    ```bash
    npm install --save-dev eslint-config-prettier
    ```

    Teraz otwórz plik `.eslintrc.json` i dodaj `"prettier"` na końcu tablicy `extends`:

    ```json:.eslintrc.json
    {
      "extends": ["next/core-web-vitals", "prettier"]
    }
    ```

#### 3. ESLint - Ulepszona Konfiguracja dla TypeScript

Rozszerzamy ESLint o reguły specyficzne dla TypeScript, aby jeszcze lepiej dbać o jakość kodu.

1.  **Instalacja:**

    ```bash
    npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
    ```

2.  **Aktualizacja `.eslintrc.json`:**
    Dodaj `plugin:@typescript-eslint/recommended` i dostosuj reguły:

    ```json:.eslintrc.json
    {
      "extends": [
        "next/core-web-vitals",
        "plugin:@typescript-eslint/recommended",
        "prettier"
      ],
      "rules": {
        "@typescript-eslint/no-unused-vars": "error", // Wymaga użycia wszystkich zadeklarowanych zmiennych
        "@typescript-eslint/no-explicit-any": "warn", // Ostrzega przed użyciem 'any'
        "react/self-closing-comp": "warn" // Ostrzega przed niesamozamykającymi się komponentami JSX
      }
    }
    ```

#### 4. Husky + lint-staged - Automatyzacja przed Commitem

Te narzędzia automatycznie uruchamiają ESLinta i Prettiera na zmienionych plikach przed każdym commitem, zapewniając czyste repozytorium.

1.  **Instalacja:**

    ```bash
    npm install --save-dev husky lint-staged
    ```

2.  **Inicjalizacja Husky:**

    ```bash
    npx husky init
    ```

    To tworzy folder `.husky/`.

3.  **Konfiguracja `lint-staged` (`package.json`):**
    Dodaj nową sekcję w `package.json`, która określa, jakie komendy mają być uruchomione dla jakich plików:

    ```json:package.json
    {
      "name": "my-next15-app",
      // ...inne pola
      "lint-staged": {
        "*.{js,jsx,ts,tsx}": "eslint --fix",
        "*.{js,jsx,ts,tsx,md,json,css}": "prettier --write"
      }
    }
    ```

    - `eslint --fix` naprawia błędy w plikach JS/TS.
    - `prettier --write` formatuje wszystkie zmienione pliki.

4.  **Stworzenie hooka `pre-commit`:**
    ```bash
    npx husky add .husky/pre-commit "npx lint-staged"
    ```
    Od teraz `git commit` uruchomi `lint-staged`.

#### 5. Commitlint - Standard Nazewnictwa Commitów (Conventional Commits)

Utrzymanie czytelnej historii Git dzięki standaryzacji komunikatów commitów.

1.  **Instalacja:**

    ```bash
    npm install --save-dev @commitlint/cli @commitlint/config-conventional
    ```

2.  **Konfiguracja (`commitlint.config.js`):**
    Stwórz plik `commitlint.config.js` w głównym folderze:

    ```javascript:commitlint.config.js
    module.exports = {
      extends: ['@commitlint/config-conventional'],
    }
    ```

3.  **Dodanie hooka `commit-msg` do Husky:**
    ```bash
    npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
    ```
    Teraz commit zostanie odrzucony, jeśli jego wiadomość nie będzie zgodna ze standardem (np. `feat: add new feature` zamiast `zmiany`).

#### 6. Weryfikacja Absolutnych Importów i Aliasów Ścieżek (`tsconfig.json`)

`create-next-app` domyślnie to ustawia, ale warto sprawdzić. Aliasy upraszczają ścieżki importu (np. `import Button from '@/components/Button'`).

**Akcja:** Sprawdź, czy w pliku `tsconfig.json` znajduje się poniższy wpis.

```json:tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 7. EditorConfig - Spójność między Edytorami

`.editorconfig` zapewnia, że styl kodowania (wcięcia, końce linii) jest spójny, niezależnie od używanego edytora.

**Akcja:** Stwórz plik `.editorconfig` w głównym katalogu projektu:

```ini:.editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

#### 8. Zaostrzenie Ustawień TypeScript (`tsconfig.json`)

Bardziej rygorystyczne ustawienia TypeScript pomagają wyłapać więcej potencjalnych błędów już na etapie pisania kodu.

**Akcja:** W pliku `tsconfig.json`, w sekcji `compilerOptions`, włącz poniższe opcje:

```json:tsconfig.json
{
  "compilerOptions": {
    // ...istniejące opcje
    "strict": true, // Włącza wszystkie rygorystyczne sprawdzenia typów
    "noUncheckedIndexedAccess": true, // Wymusza sprawdzanie dostępu do elementów tablic/obiektów
    "noUnusedLocals": true, // Ostrzega przed nieużywanymi lokalnymi zmiennymi
    "noUnusedParameters": true, // Ostrzega przed nieużywanymi parametrami funkcji
    "noFallthroughCasesInSwitch": true // Wymaga `break` w switchach
  }
}
```

#### 9. Ustawienia VS Code dla Zespołu

Wspólne ustawienia edytora w repozytorium zapewniają spójne środowisko deweloperskie dla całego zespołu.

**Akcja:** Stwórz folder `.vscode`, a w nim plik `settings.json`:

```json:.vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

> **Uwaga:** Wymaga to zainstalowania w VS Code rozszerzeń: [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) i [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

#### 10. Rozszerzenie Pliku `.gitignore`

Upewnij się, że do repozytorium nie trafiają pliki generowane przez IDE, raporty z testów czy lokalne zmienne środowiskowe.

**Akcja:** Dodaj poniższe wpisy do pliku `.gitignore`:

```plaintext:.gitignore
# IDE specific
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
.idea/

# Next.js build outputs
.next/
out/
.env*.local

# Node modules
node_modules/

# Testing
coverage/

# Misc
.DS_Store
*.log
```

#### 11. Dodatkowy Hook Husky: `pre-push` - Walidacja Przed Wysłaniem

Dodatkowa warstwa bezpieczeństwa: uruchomienie `build` przed wysłaniem kodu do zdalnego repozytorium, aby upewnić się, że nie ma błędów kompilacji.

**Akcja:** Dodaj hook `pre-push`:

```bash
npx husky add .husky/pre-push "npm run build"
```

#### 12. Rozbudowa Skryptów w `package.json`

Dobre skrypty automatyzują powtarzalne zadania i ułatwiają walidację w CI/CD.

**Akcja:** Zaktualizuj sekcję `scripts` w `package.json`:

```json:package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,md,json,css}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,md,json,css}\"",
    "type-check": "tsc --noEmit",
    "validate": "npm run type-check && npm run lint && npm run format:check"
  }
}
```

> `npm run validate` jest świetny do uruchomienia wszystkich sprawdzeń naraz, np. w pipeline'ach CI/CD.

#### 13. CVA (Class Variance Authority) - Warianty Komponentów z Tailwind CSS

Jeśli planujesz budować system komponentów, `class-variance-authority` jest fantastycznym narzędziem do zarządzania wariantami stylów w Tailwind CSS.

**Akcja:**

1.  Zainstaluj biblioteki:
    ```bash
    npm install class-variance-authority clsx tailwind-merge
    ```
2.  Stwórz plik `src/lib/utils.ts`, który zawiera pomocniczą funkcję `cn` do łączenia klas:

    ```typescript:src/lib/utils.ts
    import { type ClassValue, clsx } from 'clsx'
    import { twMerge } from 'tailwind-merge'

    export function cn(...inputs: ClassValue[]) {
      return twMerge(clsx(inputs))
    }
    ```

    Funkcja `cn` inteligentnie łączy klasy CSS, usuwając duplikaty i rozwiązując konflikty (np. `p-4` i `p-5` zostanie `p-5`).

#### 14. Konfiguracja `prettier-plugin-tailwindcss` (Uzupełnienie)

Ta konfiguracja została już częściowo dodana w **Kroku 2**, ale upewnij się, że opcja `tailwindFunctions` jest obecna, aby plugin Prettiera do Tailwind CSS wiedział, że ma sortować klasy również wewnątrz funkcji `cn` i `cva`.

**Akcja:** Upewnij się, że plik `.prettierrc.json` zawiera:

```json:.prettierrc.json
{
  // ...inne opcje
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindFunctions": ["cn", "cva"]
}
```

---

### Podsumowanie Twojego "Pakietu Startowego"

Po wykonaniu tych kroków, Twój projekt Next.js 15 będzie wyposażony w:

1.  **Next.js 15 z App Routerem**: Nowoczesna i wydajna struktura aplikacji.
2.  **TypeScript**: Maksymalne bezpieczeństwo typów i lepsze refaktoryzacje.
3.  **Tailwind CSS + CVA**: Szybkie, spójne i elastyczne stylowanie komponentów.
4.  **ESLint**: Automatyczne wykrywanie błędów, problemów z jakością kodu i naruszania konwencji.
5.  **Prettier**: Automatyczne, spójne formatowanie kodu dla całego zespołu.
6.  **Husky + lint-staged**: Wymuszanie jakości kodu przed każdym commitem.
7.  **Commitlint**: Czysta i czytelna historia Git zgodna ze standardami.
8.  **EditorConfig**: Spójność formatowania kodu między różnymi edytorami.
9.  **Rygorystyczny TypeScript**: Zaostrzone sprawdzenia typów, minimalizujące błędy runtime.
10. **Zespołowe ustawienia VS Code**: Spójne środowisko deweloperskie dla każdego.
11. **Rozszerzone `.gitignore`**: Czyste repozytorium bez zbędnych plików.
12. **Hook `pre-push`**: Walidacja kompilacji przed wysłaniem kodu, zapobiegając publikowaniu zepsutych wersji.
13. **Bogate skrypty `package.json`**: Automatyzacja walidacji i zadań deweloperskich.

Ten rozszerzony zestaw narzędzi i konfiguracji tworzy niezwykle solidną, profesjonalną i łatwą w utrzymaniu bazę dla każdego projektu Next.js, znacznie podnosząc jakość i efektywność pracy deweloperskiej.
