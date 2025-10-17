<ui_architecture_planning>

### Krok 1: Analiza Dokumentów

Dokładnie przeanalizowałem wszystkie trzy dokumenty.

- **PRD:** Definiuje "co" i "dlaczego". Kluczowe koncepcje to: automatyczne generowanie planu jako rozwiązanie problemu zmęczenia decyzyjnego, wizualne paski postępu jako prosta informacja zwrotna, obowiązkowy onboarding, zagregowana lista zakupów, dostęp offline. Granice produktu (co jest wykluczone) są również kluczowe. Historyjki użytkownika (US) dostarczają szczegółowych kryteriów akceptacji dla każdej funkcji.
- **Plan API:** Definiuje "jak" dane będą dostarczane. Każdy zasób (`Profile`, `Planned Meals`, `Recipes`, `Shopping List`, `Feedback`) ma swoje punkty końcowe. To mój kontrakt z backendem. `GET /planned-meals` będzie napędzać widok dzienny i tygodniowy. `PATCH /planned-meals/{id}` obsłuży oznaczanie posiłków jako zjedzonych, ich wymianę i modyfikację gramatury. Złożona logika (generowanie planu, lista zakupów) jest hermetyzowana w dedykowanych endpointach.
- **Notatki z sesji:** Definiują architekturę i UX. Podjęto kluczowe decyzje: nawigacja (lewy pasek/hamburger), zarządzanie stanem (`TanStack Query` + `Zustand`), optymistyczne UI, obsługa błędów (toasty), użycie modali do zadań kontekstowych (wymiana posiłku, szczegóły przepisu), obsługa offline (`localStorage`). To gotowe wytyczne do projektu UI.
- **Stack Technologiczny**: Potwierdza użycie Next.js (App Router), `shadcn/ui` (co implikuje konkretne, dostępne komponenty jak `Slider`, `Modal`), `TanStack Query` i `Zustand`. To daje mi konkretne narzędzia do opisu architektury.

### Krok 2: Ekstrakcja kluczowych wymagań z PRD

- **Uwierzytelnianie:** E-mail/hasło i Google Auth. Pełny cykl życia (rejestracja, logowanie, reset hasła).
- **Onboarding:** Obowiązkowy, sekwencyjny proces zbierania danych (płeć, wiek, waga etc.), obliczania celów i akceptacji disclaimera.
- **Automatyczne Generowanie Planu:** 7-dniowy, kroczący plan oparty na celach użytkownika.
- **Główny Ekran (Widok Dnia):** Wyświetla dzisiejsze posiłki i 4 wizualne paski postępu (Kalorie, B, W, T). Oznaczanie posiłków jako zjedzonych aktualizuje paski.
- **Zarządzanie Posiłkami:** Wymiana posiłku na inny, modyfikacja gramatury składników skalowalnych.
- **Widok Przepisu:** Szczegóły przepisu z listą składników (pogrupowanych), instrukcją i rozkładem makro.
- **Lista Zakupów:** Zagregowana lista na 6 dni naprzód, z możliwością odznaczania.
- **Profil Użytkownika:** Edycja danych (waga, aktywność) skutkująca przeliczeniem planu. Reset planu.
- **Feedback:** Prosty formularz do zgłaszania problemów.
- **Dostęp Offline:** Plan i lista zakupów dostępne bez połączenia z internetem.

### Krok 3: Identyfikacja głównych punktów końcowych API

- **Tworzenie profilu i generowanie planu:** `POST /profile` (po onboardingu), `POST /profile/me/generate-plan` (inicjalne i późniejsze generowanie).
- **Pobieranie danych użytkownika:** `GET /profile/me` (dane profilowe i cele), `GET /planned-meals` (główne źródło danych dla widoku dnia i tygodnia).
- **Modyfikacja planu:** `PATCH /planned-meals/{id}` (do oznaczania posiłku, wymiany na inny, modyfikacji składników).
- **Pobieranie danych o przepisach:** `GET /recipes` (dla przeglądarki przepisów), `GET /recipes/{id}` (dla szczegółów przepisu), `GET /planned-meals/{id}/replacements` (dla wymiany posiłku).
- **Pobieranie listy zakupów:** `GET /shopping-list`.
- **Wysyłanie opinii:** `POST /feedback`.

### Krok 4: Utworzenie listy wszystkich niezbędnych widoków

Na podstawie dokumentów i notatek, niezbędne widoki (lub główne stany interfejsu) to:

1.  **Widok Publiczny / Przeglądarka Przepisów (`/przepisy`)** - Strona startowa dla niezalogowanych.
2.  **Widok Uwierzytelniania (`/auth`)** - Pojedynczy widok z zakładkami Logowanie/Rejestracja.
3.  **Widok Resetowania Hasła (`/reset-hasla`)** - Wielostopniowy proces (podaj e-mail, sprawdź skrzynkę, ustaw nowe hasło).
4.  **Kreator Onboardingu (`/onboarding`)** - Wielostopniowy, modalny lub pełnoekranowy proces po pierwszej rejestracji.
5.  **Panel Dzienny / Dashboard (`/`)** - Główny widok aplikacji dla zalogowanego użytkownika.
6.  **Widok Tygodnia (`/tydzien`)** - Widok całego 7-dniowego planu.
7.  **Lista Zakupów (`/lista-zakupow`)**
8.  **Profil i Ustawienia (`/profil`)**
9.  **Modal Szczegółów Przepisu** - Nie jest to osobna strona, ale kluczowy, reużywalny element interfejsu.
10. **Modal Wymiany Posiłku**
11. **Modal Zgłaszania Problemu**

### Krok 5: Określenie celu i kluczowych informacji dla każdego widoku

- **Przeglądarka Przepisów:**
  - **Cel:** Zaciekawienie potencjalnych użytkowników, pokazanie jakości przepisów, zachęta do rejestracji.
  - **Info:** Losowy przepis "dnia", siatka/lista przepisów z filtrami (typ posiłku), przyciski "Zaloguj się" / "Zarejestruj się".
- **Uwierzytelnianie:**
  - **Cel:** Umożliwienie bezpiecznej rejestracji i logowania.
  - **Info:** Formularze e-mail/hasło, przycisk logowania przez Google, link do resetu hasła.
- **Kreator Onboardingu:**
  - **Cel:** Zebranie niezbędnych danych do personalizacji planu.
  - **Info:** Kolejne kroki formularza (płeć, wiek, waga, etc.), podsumowanie celów, disclaimer.
- **Panel Dzienny:**
  - **Cel:** Prezentacja planu na dziś i śledzenie postępów w czasie rzeczywistym.
  - **Info:** Nawigacja po dniach (kalendarz), 4 paski postępu makro, 3 karty posiłków (śniadanie, obiad, kolacja).
- **Widok Tygodnia:**
  - **Cel:** Umożliwienie użytkownikowi przeglądu całego tygodnia i planowania z wyprzedzeniem.
  - **Info:** Tabela (desktop) lub lista (mobile) posiłków na 7 dni.
- **Lista Zakupów:**
  - **Cel:** Uproszczenie procesu zakupów.
  - **Info:** Pogrupowana, zagregowana lista składników z możliwością odznaczania.
- **Profil i Ustawienia:**
  - **Cel:** Zarządzanie danymi osobowymi, celami i kontem.
  - **Info:** Formularz edycji danych (waga, aktywność), opcje resetu planu, link do formularza opinii.

### Krok 6: Planowanie podróży użytkownika (główny przypadek użycia)

1.  **Lądowanie:** Nowy użytkownik trafia na `Widok Publiczny / Przeglądarkę Przepisów` (`/przepisy`).
2.  **Inicjacja Rejestracji:** Klika przycisk "Zarejestruj się", co przenosi go do `Widoku Uwierzytelniania` (`/auth`) z aktywną zakładką rejestracji.
3.  **Rejestracja:** Wypełnia formularz lub używa Google Auth. Po sukcesie jest automatycznie zalogowany.
4.  **Onboarding:** Zostaje przekierowany do `Kreatora Onboardingu` (`/onboarding`).
5.  **Wprowadzanie Danych:** Przechodzi przez kolejne kroki, wprowadzając swoje dane.
6.  **Akceptacja Celów:** Widzi ekran podsumowujący obliczone cele (kalorie, makro) oraz disclaimer, które musi zaakceptować.
7.  **Generowanie Planu:** Po akceptacji, widzi ekran ładowania z informacją "Generowanie Twojego planu...". W tle wywoływany jest `POST /profile`, a następnie `POST /profile/me/generate-plan`.
8.  **Panel Dzienny:** Po pomyślnym wygenerowaniu planu zostaje przekierowany na `Panel Dzienny` (`/`), który jest domyślnym widokiem aplikacji.
9.  **Interakcja:** W ciągu dnia użytkownik:
    - Klika na posiłek, aby otworzyć `Modal Szczegółów Przepisu`.
    - Oznacza posiłek jako "Zjedzony", co powoduje optymistyczną aktualizację pasków postępu i wysłanie `PATCH /planned-meals/{id}`.
    - Nawiguje do `Listy Zakupów` (`/lista-zakupow`), aby przygotować się do zakupów.
    - Po kilku dniach wchodzi w `Profil` (`/profil`), aktualizuje wagę, co powoduje przeliczenie celów i aktualizację planu na przyszłe dni.

### Krok 7: Projektowanie struktury nawigacji

Zgodnie z notatkami z sesji:

- **Typ:** Stały, pionowy pasek nawigacyjny po lewej stronie (desktop) i ukryte menu "hamburger" (mobile).
- **Elementy nawigacji (dla zalogowanego użytkownika):**
  1.  Panel Dzienny (ikona kalendarza, link do `/`)
  2.  Widok Tygodnia (ikona widoku tygodnia, link do `/tydzien`)
  3.  Lista Zakupów (ikona koszyka, link do `/lista-zakupow`)
  4.  Wszystkie przepisy (ikona książki kucharskiej, link do `/przepisy`)
  5.  Profil (ikona użytkownika, link do `/profil`)
- **Nawigacja dla niezalogowanego użytkownika:** Pasek jest widoczny. Link "Wszystkie przepisy" jest aktywny. Kliknięcie na inne linki (np. "Panel Dzienny") przekierowuje do `Widoku Uwierzytelniania` (`/auth`). W nagłówku znajdują się również jawne przyciski "Zaloguj się" i "Zarejestruj się".
- **Routing:** Aplikacja wykorzystuje App Router z Next.js. Chronione ścieżki (`/`, `/tydzien`, `/lista-zakupow`, `/profil`) będą zabezpieczone middleware'em lub logiką w layoutach, która przekierowuje niezalogowanych użytkowników do `/auth`.

### Krok 8: Propozycja kluczowych elementów UI dla każdego widoku (z UX, A11y, Security)

- **Kreator Onboardingu:**
  - **Komponenty:** Komponent `Stepper` do wizualizacji kroków, `Slider` z polem do wpisania wartości dla danych numerycznych (UX), `RadioGroup` dla wyboru płci/celu, `Checkbox` z linkiem do polityki dla disclaimera.
  - **A11y:** Wszystkie kontrolki formularza muszą mieć powiązane etykiety (`<label htmlFor>`). `Stepper` powinien być nawigowalny klawiaturą.
  - **Security:** Walidacja po stronie klienta (Zod) i serwera (API) dla wszystkich wprowadzanych danych.
- **Panel Dzienny:**
  - **Komponenty:** Poziomy `CalendarStrip` do nawigacji między dniami, 4x `MacroProgressBar`, 3x `MealCard`.
  - **UX:** Optymistyczna aktualizacja pasków po oznaczeniu posiłku jako zjedzonego. Płynne animacje na paskach postępu.
  - **A11y:** Paski postępu zrealizowane jako element `<progress>` z odpowiednimi atrybutami `aria-label` (np. "Postęp kalorii: 800 z 1800"). `MealCard` to interaktywne elementy, w pełni dostępne z klawiatury.
- **Lista Zakupów:**
  - **Komponenty:** `Accordion` lub `Collapsible` dla każdej kategorii produktów, `Checkbox` przy każdym produkcie, `ShoppingListItem`.
  - **UX:** Po zaznaczeniu, produkt jest przekreślany i przenoszony na dół listy w swojej kategorii. Stan zaznaczeń jest trzymany w `Zustand`, aby przetrwać nawigację w ramach sesji.
  - **A11y:** Użycie semantycznych list (`<ul>`, `<li>`). Checkboxy z wyraźnymi etykietami.
- **Profil i Ustawienia:**
  - **Komponenty:** `Form` z polami `Input` i `Select` do edycji danych. `AlertDialog` do potwierdzenia akcji destrukcyjnych (reset planu).
  - **Security:** Zmiana hasła wymaga podania starego hasła. Reset planu wymaga dwuetapowego potwierdzenia.

### Krok 9: Rozważenie potencjalnych przypadków brzegowych i stanów błędów

- **Błąd generowania planu:** Po onboardingu, jeśli `POST /profile/me/generate-plan` zwróci błąd 500, UI musi wyświetlić `ErrorState` z komunikatem "Nie udało się wygenerować planu. Spróbuj ponownie." i przyciskiem ponowienia akcji.
- **Stan offline:** Globalny hook `useOnlineStatus` wykrywa brak połączenia. Aplikacja wyświetla `Banner` na górze ekranu informujący "Jesteś offline. Wyświetlane dane mogą być nieaktualne.". Przyciski wymagające połączenia (np. "Zmień danie", "Zapisz zmiany w profilu") są wyłączone (`disabled`). Dane do widoku dnia, tygodnia i listy zakupów są czytane z `localStorage`.
- **Brak danych (pusty stan):** Jeśli `GET /planned-meals` zwróci pustą tablicę (np. nowy użytkownik, któremu nie wygenerowano planu), Panel Dzienny powinien wyświetlić `EmptyState` z przyciskiem "Wygeneruj swój pierwszy plan".
- **Wygaśnięcie tokenu JWT:** Wrapper klienta API (np. Axios interceptor) przechwytuje błędy 401 Unauthorized. Po takim błędzie, stan użytkownika jest czyszczony, a aplikacja przekierowuje na `/auth` z informacją "Twoja sesja wygasła. Zaloguj się ponownie.".
- **Konflikt danych (409 Conflict):** Np. przy próbie ponownego wygenerowania planu, który już istnieje. UI powinien wyświetlić `Toast` z informacją "Twój plan na najbliższe dni jest już kompletny.".

### Krok 10: Zapewnienie zgodności architektury UI z planem API

- **Onboarding:** Widok zbiera wszystkie pola wymagane przez `POST /profile`. Po sukcesie wywołuje `POST /profile/me/generate-plan`.
- **Panel Dzienny/Tygodniowy:** Dane pochodzą z `GET /planned-meals?start_date=...&end_date=...`. Oznaczenie posiłku jako zjedzonego wywołuje `PATCH /planned-meals/{id}` z payloadem `{"is_eaten": true}`.
- **Modal Szczegółów Przepisu:** Otwarcie modala dla posiłku z planu (który ma `recipe.id`) wywołuje `GET /recipes/{id}` w celu pobrania pełnych danych (instrukcje, składniki).
- **Modal Wymiany Posiłku:** Wywołuje `GET /planned-meals/{id}/replacements` w celu pobrania listy alternatyw. Wybranie nowej opcji wywołuje `PATCH /planned-meals/{id}` z payloadem `{"recipe_id": new_id}`.
- **Modyfikacja gramatury:** Zmiana wartości w `Input` w widoku przepisu, po `debounce`, wywołuje `PATCH /planned-meals/{id}` z payloadem `{"ingredient_overrides": [...]}`.
- **Lista Zakupów:** Widok wywołuje `GET /shopping-list?start_date=...&end_date=...` w celu pobrania zagregowanych danych.
  Architektura UI jest w pełni zgodna z udostępnionym API. Każda interakcja użytkownika ma swój odpowiednik w postaci wywołania odpowiedniego punktu końcowego.

### Krok 11: Zmapowanie historyjek użytkownika (US) do architektury UI

- **US-001 do US-004 (Auth):** Mapują się na `Widok Uwierzytelniania` i `Widok Resetowania Hasła`.
- **US-005 do US-009 (Onboarding):** Mapują się na `Kreator Onboardingu` i ekran ładowania po nim.
- **US-010 do US-012 (Panel Dzienny):** Mapują się na `Panel Dzienny`, komponenty `MealCard` i `MacroProgressBar`.
- **US-013 (Przepis):** Mapuje się na `Modal Szczegółów Przepisu`.
- **US-014 (Wymiana posiłku):** Mapuje się na `Modal Wymiany Posiłku`.
- **US-015 (Modyfikacja gramatury):** Mapuje się na edytowalne pola w `Modal Szczegółów Przepisu` (dla dzisiejszego dnia).
- **US-016, US-017 (Lista Zakupów):** Mapują się na `Widok Listy Zakupów`.
- **US-018, US-019 (Profil):** Mapują się na `Widok Profilu i Ustawień`.
- **US-020 (Feedback):** Mapuje się na `Modal Zgłaszania Problemu`.
- **US-021 (Offline):** Mapuje się na globalną logikę obsługi stanu offline i wykorzystanie `localStorage`.

Wszystkie historyjki są pokryte.

### Krok 12: Wyraźne mapowanie wymagań na elementy UI

- **Wymaganie 3.4 (Paski postępu):** Komponent `MacroProgressBar` (4 instancje na Panelu Dziennym).
- **Wymaganie 3.2 (Kalkulator celu i disclaimer):** `Kreator Onboardingu` z kolejnymi ekranami i obowiązkowym checkboxem.
- **Wymaganie 3.5 (Wymiana posiłku):** Przycisk "Zmień danie" na `MealCard`, otwierający `Modal Wymiany Posiłku`.
- **Wymaganie 3.6 (Grupowanie składników):** W `Modal Szczegółów Przepisu` składniki będą renderowane w sekcjach (np. "Nabiał", "Mięso") z użyciem komponentu `Accordion` lub prostych nagłówków.
- **Wymaganie 3.7 (Agregacja listy zakupów):** `Widok Listy Zakupów` wyświetla dane bezpośrednio z endpointu `GET /shopping-list`, który wykonuje tę agregację. UI tylko renderuje wynik.
- **Wymaganie 3.10 (Dostęp Offline):** Dedykowany hook (`useOfflineStorage`) będzie synchronizował dane z `TanStack Query` do `localStorage` po każdym udanym pobraniu danych z `GET /planned-meals`. W trybie offline, dane będą serwowane z `localStorage`.

### Krok 13: Rozważenie potencjalnych punktów bólu użytkownika i jak UI je rozwiązuje

1.  **Pain Point: Zmęczenie decyzyjne.**
    - **Rozwiązanie UI:** Rdzeń aplikacji, czyli automatyczne generowanie planu, eliminuje potrzebę podejmowania decyzji. UI wspiera to poprzez prezentację gotowego planu na `Panelu Dziennym` i `Widoku Tygodnia`. Gdy użytkownik _chce_ podjąć decyzję, UI ułatwia to, oferując prostą wymianę posiłku na inny o podobnej kaloryczności (`Modal Wymiany Posiłku`), zamiast zmuszać do szukania od zera. `Lista Zakupów` dodatkowo redukuje obciążenie poznawcze.
2.  **Pain Point: Brak prostego feedbacku.**
    - **Rozwiązanie UI:** To jest rozwiązane bezpośrednio przez centralny element `Panelu Dziennego` - cztery duże, wizualne `MacroProgressBar`. Ich natychmiastowa, optymistyczna aktualizacja po oznaczeniu posiłku jako zjedzonego daje użytkownikowi jasny, ciągły i motywujący feedback na temat postępów w realizacji dziennego celu, bez konieczności analizowania liczb.

Planowanie zostało zakończone. Wszystkie kroki zostały wykonane, a ja mam jasny i spójny obraz architektury UI. Teraz mogę przystąpić do napisania finalnego dokumentu w formacie Markdown.
</ui_architecture_planning>

```markdown
Jasne, oto zaktualizowany plan architektury UI, który zawiera szczegółowy opis menu nawigacyjnego na podstawie dostarczonych obrazów, zgodnie z Twoją prośbą. Zastąpiłem oryginalną sekcję 4 nową, bardziej rozbudowaną wersją.

---

# Architektura UI dla LowCarbPlaner (MVP)

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika dla aplikacji LowCarbPlaner została zaprojektowana jako nowoczesna, responsywna aplikacja internetowa (SPA - Single Page Application) z wykorzystaniem frameworka Next.js i architektury App Router. Struktura wyraźnie oddziela strefę publiczną, dostępną dla niezalogowanych użytkowników, od strefy prywatnej, wymagającej uwierzytelnienia.

Nawigacja opiera się na stałym, pionowym pasku bocznym na urządzeniach desktopowych oraz ukrytym menu typu "hamburger" na urządzeniach mobilnych, zapewniając spójny i intuicyjny dostęp do kluczowych funkcji. Zarządzanie stanem serwera opiera się na TanStack Query, co umożliwia efektywne cachowanie, unieważnianie danych oraz implementację optymistycznego UI dla kluczowych interakcji. Stan globalny UI jest zarządzany przez Zustand. Dostęp offline do kluczowych danych (plan posiłków, lista zakupów) jest realizowany poprzez synchronizację danych z `localStorage`.

## 2. Lista widoków

### Widok: Przeglądarka Przepisów (Publiczny)

- **Ścieżka widoku:** `/przepisy`
- **Główny cel:** Prezentacja wartości aplikacji potencjalnym użytkownikom i zachęta do rejestracji. Jest to strona docelowa dla niezalogowanych użytkowników.
- **Kluczowe informacje do wyświetlenia:**
  - Losowy, wyróżniony przepis.
  - Siatka lub lista dostępnych przepisów.
  - Filtry (np. po typie posiłku: śniadanie, obiad, kolacja).
  - Wyraźne wezwanie do akcji (CTA) do rejestracji/logowania.
- **Kluczowe komponenty widoku:** `RecipeCard`, `Filters`, `Pagination`.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Kliknięcie na przepis przez niezalogowanego użytkownika otwiera modal z prośbą o rejestrację.
  - **Dostępność:** Karty przepisów są w pełni nawigowalne klawiaturą.
  - **Bezpieczeństwo:** Widok publiczny, brak dostępu do danych wrażliwych.

### Widok: Uwierzytelnianie

- **Ścieżka widoku:** `/auth`
- **Główny cel:** Umożliwienie nowym użytkownikom rejestracji, a istniejącym zalogowania się do aplikacji.
- **Kluczowe informacje do wyświetlenia:**
  - Formularz logowania i rejestracji.
  - Przycisk logowania/rejestracji przez Google.
  - Link do procesu odzyskiwania hasła.
- **Kluczowe komponenty widoku:** `Tabs`, `AuthForm`, `SocialAuthButton`.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Walidacja formularza w czasie rzeczywistym.
  - **Dostępność:** Poprawne etykiety formularzy, komunikaty o błędach dostępne dla czytników ekranu.
  - **Bezpieczeństwo:** Walidacja siły hasła, komunikacja przez HTTPS.

### Widok: Kreator Onboardingu

- **Ścieżka widoku:** `/onboarding`
- **Główny cel:** Zebranie od nowego użytkownika wszystkich niezbędnych informacji do wygenerowania spersonalizowanego planu.
- **Kluczowe informacje do wyświetlenia:**
  - Wieloetapowy formularz (płeć, wiek, waga, cel, etc.).
  - Podsumowanie obliczonych celów.
  - Obowiązkowy disclaimer do akceptacji.
- **Kluczowe komponenty widoku:** `Stepper`, `Slider`, `RadioGroup`, `Checkbox`.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Podział procesu na mniejsze kroki zapobiega przytłoczeniu użytkownika.
  - **Dostępność:** Pełna obsługa z klawiatury dla wszystkich kontrolek.
  - **Bezpieczeństwo:** Walidacja danych po stronie klienta i serwera.

### Widok: Panel Dzienny (Dashboard)

- **Ścieżka widoku:** `/` lub `/dashboard`
- **Główny cel:** Centralny punkt aplikacji, pokazujący plan na bieżący dzień i umożliwiający śledzenie postępów.
- **Kluczowe informacje do wyświetlenia:**
  - Cztery paski postępu: Kalorie, Białko, Węglowodany, Tłuszcze.
  - Karty zaplanowanych posiłków.
- **Kluczowe komponenty widoku:** `MacroProgressBar`, `MealCard`.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Optymistyczna aktualizacja UI po interakcji użytkownika. Użycie szkieletów interfejsu (skeleton UI) podczas ładowania danych.
  - **Dostępność:** Paski postępu wykorzystują semantyczny element `<progress>` z etykietami ARIA.
  - **Bezpieczeństwo:** Widok wyświetla tylko dane zalogowanego użytkownika.

### Widok: Plan Posiłków (Meal Plan / Calendar)

- **Ścieżka widoku:** `/meal-plan`
- **Główny cel:** Zapewnienie użytkownikowi wglądu w cały 7-dniowy plan posiłków.
- **Kluczowe informacje do wyświetlenia:**
  - Widok tabelaryczny (desktop) lub lista (mobile) z podziałem na dni tygodnia i typy posiłków.
  - Nazwa i zdjęcie każdego zaplanowanego posiłku.
- **Kluczowe komponenty widoku:** `WeekTable`, `DayList`, `MealCard`.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Umożliwia szybki podgląd przepisu (w modalu) oraz inicjację wymiany posiłku.
  - **Dostępność:** Tabela na desktopie ma odpowiednie nagłówki.
  - **Bezpieczeństwo:** Dostęp do widoku jest chroniony i wymaga uwierzytelnienia.

### Widok: Lista Zakupów

- **Ścieżka widoku:** `/shopping-list`
- **Główny cel:** Uproszczenie procesu zakupów poprzez dostarczenie jednej, zagregowanej listy składników.
- **Kluczowe informacje do wyświetlenia:**
  - Lista składników pogrupowana według kategorii.
  - Zsumowana ilość/waga każdego składnika.
- **Kluczowe komponenty widoku:** `Accordion`, `ShoppingListItem`.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Odznaczenie produktu powoduje jego wizualne przekreślenie.
  - **Dostępność:** Struktura oparta na listach semantycznych.
  - **Bezpieczeństwo:** Dostęp do widoku jest chroniony.

### Widok: Profil i Ustawienia

- **Ścieżka widoku:** `/profil` (dostępny z menu użytkownika w prawym górnym rogu)
- **Główny cel:** Umożliwienie użytkownikowi zarządzania swoimi danymi, celami i kontem.
- **Kluczowe informacje do wyświetlenia:**
  - Formularz edycji danych profilowych.
  - Opcja resetu planu.
  - Link do formularza opinii.
- **Kluczowe komponenty widoku:** `ProfileForm`, `AlertDialog`.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Zapisanie zmian w profilu skutkuje wyświetleniem komunikatu (Toast) o przeliczeniu planu.
  - **Dostępność:** Formularze są w pełni dostępne.
  - **Bezpieczeństwo:** Zmiany danych są walidowane po stronie serwera.

## 3. Mapa podróży użytkownika

**Scenariusz 1: Nowy Użytkownik**

1.  **Odkrycie:** Użytkownik ląduje na `/healthy-menu`. Przegląda dania.
2.  **Rejestracja:** Klika "Zarejestruj się", przechodzi do `/auth`, tworzy konto.
3.  **Konfiguracja:** Zostaje przekierowany na `/onboarding`, gdzie podaje swoje dane.
4.  **Generowanie Planu:** Aplikacja wyświetla stan ładowania podczas generowania planu.
5.  **Pierwsze Użycie:** Ląduje na `/dashboard`, czyli Panelu Dziennym.
6.  **Codzienna Interakcja:** Oznacza posiłki jako zjedzone, obserwuje postępy.
7.  **Planowanie Zakupów:** Przechodzi do widoku planu (`/meal-plan`) skąd może wygenerować listę zakupów.

**Scenariusz 2: Powracający Użytkownik**

1.  **Logowanie:** Użytkownik wchodzi na stronę i jest logowany automatycznie.
2.  **Panel Główny:** Zostaje przekierowany na `/dashboard`.
3.  **Modyfikacja Planu:** Użytkownik nie ma ochoty na proponowany obiad. Klika "Zmień danie".
4.  **Aktualizacja Celów:** Wchodzi w swój profil (prawy górny róg), aktualizuje wagę.

## 4. Układ i Struktura Nawigacji

Układ aplikacji jest oparty na stałym panelu nawigacyjnym po lewej stronie dla widoków desktopowych i tabletowych, który zwija się do menu typu "hamburger" na urządzeniach mobilnych. Struktura ta jest bezpośrednio wzorowana na dostarczonym projekcie UI.

### a. Nawigacja na urządzeniach Desktop / Tablet

- **Lokalizacja:** Stały, pionowy pasek po lewej stronie ekranu.
- **Komponenty:**
  - **Logo:** W górnej części paska znajduje się logo aplikacji ("LowCarbPlaner").
  - **Lista linków:** Poniżej logo znajduje się pionowa lista ikon z etykietami tekstowymi. Aktywny link jest wyraźnie wyróżniony innym kolorem tła i ikony.
- **Elementy Menu:**
  - **Panel Dzienny**: Link do `/dashboard`
  - **Widok Tygodnia**: Link do `/meal-plan`
  - **Przepisy**: Link do `/przepisy`
  - **Lista zakupów**: Link do `/shopping-list`
- **Nawigacja dodatkowa:**
  - **Profil Użytkownika:** Dostęp do profilu, ustawień i wylogowania znajduje się w prawym górnym rogu ekranu, gdzie wyświetlane jest imię i awatar użytkownika.

### b. Nawigacja na urządzeniach Mobilnych

- **Lokalizacja:** Menu jest domyślnie ukryte. Dostęp do niego uzyskuje się poprzez kliknięcie ikony "hamburgera" (trzy poziome linie) umieszczonej w nagłówku aplikacji.
- **Działanie:** Po kliknięciu ikony, z lewej strony ekranu wysuwa się panel (lub pojawia się jako nakładka), który zawiera tę samą listę linków co wersja desktopowa (logo, ikony z etykietami). Kliknięcie poza obszarem menu lub na ikonę zamknięcia powoduje jego schowanie.
- **Spójność:** Zawartość menu mobilnego jest identyczna z menu na większych ekranach, zapewniając spójne doświadczenie na wszystkich urządzeniach.

## 5. Kluczowe komponenty

Poniżej znajduje się lista kluczowych, reużywalnych komponentów:

- **`MealCard`**: Karta wyświetlająca podstawowe informacje o posiłku (zdjęcie, nazwa, kaloryczność) wraz z przyciskami interakcji ("Zjedzono", "Zmień danie").
- **`MacroProgressBar`**: Wizualny wskaźnik postępu dla pojedynczego makroskładnika lub kalorii.
- **`RecipeDetailModal`**: Modal wyświetlający pełne informacje o przepisie.
- **`GlobalErrorToast`**: Komponent wyświetlający globalne, nieblokujące powiadomienia o błędach.
- **`SkeletonLoader`**: Komponent szkieletu UI używany do sygnalizowania ładowania danych.
- **`AlertDialog`**: Modal dialogowy używany do potwierdzenia akcji destrukcyjnej.
```
