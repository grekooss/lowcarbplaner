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
- **Kluczowe komponenty widoku:** `RecipeCard`, `Filters`, `Pagination` (typu "Załaduj więcej").
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Kliknięcie na przepis przez niezalogowanego użytkownika otwiera modal z prośbą o rejestrację, zapamiętując docelowy przepis do wyświetlenia po zalogowaniu.
  - **Dostępność:** Karty przepisów są w pełni nawigowalne klawiaturą i zawierają semantyczny HTML.
  - **Bezpieczeństwo:** Widok publiczny, brak dostępu do danych wrażliwych.

### Widok: Uwierzytelnianie

- **Ścieżka widoku:** `/auth`
- **Główny cel:** Umożliwienie nowym użytkownikom rejestracji, a istniejącym zalogowania się do aplikacji.
- **Kluczowe informacje do wyświetlenia:**
  - Zakładki do przełączania między formularzem logowania i rejestracji.
  - Pola formularza: e-mail, hasło, powtórz hasło (dla rejestracji).
  - Przycisk logowania/rejestracji przez Google.
  - Link do procesu odzyskiwania hasła.
- **Kluczowe komponenty widoku:** `Tabs`, `AuthForm`, `SocialAuthButton`.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Walidacja formularza w czasie rzeczywistym. System zapamiętuje URL, do którego użytkownik próbował dotrzeć przed przekierowaniem na logowanie.
  - **Dostępność:** Wszystkie pola formularza mają powiązane etykiety. Komunikaty o błędach są powiązane z polami za pomocą atrybutów `aria-describedby`.
  - **Bezpieczeństwo:** Wdrożona walidacja siły hasła po stronie klienta. Komunikacja z API odbywa się przez HTTPS.

### Widok: Kreator Onboardingu

- **Ścieżka widoku:** `/onboarding`
- **Główny cel:** Zebranie od nowego użytkownika wszystkich niezbędnych informacji do wygenerowania spersonalizowanego planu żywieniowego.
- **Kluczowe informacje do wyświetlenia:**
  - Wieloetapowy formularz zbierający dane: płeć, wiek, waga, wzrost, poziom aktywności, cel.
  - Ekran podsumowujący obliczone zapotrzebowanie kaloryczne i makroskładniki.
  - Ekran z obowiązkowym disclaimerem do akceptacji.
- **Kluczowe komponenty widoku:** `Stepper` (wizualizacja kroków), `Slider`, `RadioGroup`, `Checkbox`.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Podział procesu na mniejsze kroki zapobiega przytłoczeniu użytkownika. Stan formularza jest zarządzany przez Zustand, co umożliwia potencjalne wznowienie procesu w przyszłości.
  - **Dostępność:** Jasne instrukcje na każdym kroku. Pełna obsługa z klawiatury dla wszystkich kontrolek.
  - **Bezpieczeństwo:** Dane są walidowane na każdym kroku, zarówno po stronie klienta, jak i serwera po finalnym przesłaniu.

### Widok: Panel Dzienny (Dashboard)

- **Ścieżka widoku:** `/`
- **Główny cel:** Centralny punkt aplikacji, pokazujący plan na bieżący dzień i umożliwiający śledzenie postępów.
- **Kluczowe informacje do wyświetlenia:**
  - Nawigacja kalendarzowa na 7 dni.
  - Cztery paski postępu: Kalorie, Białko, Węglowodany, Tłuszcze.
  - Trzy karty posiłków: Śniadanie, Obiad, Kolacja, z nazwą dania, kalorycznością i przyciskiem do interakcji.
- **Kluczowe komponenty widoku:** `CalendarStrip`, `MacroProgressBar`, `MealCard`.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Oznaczenie posiłku jako "Zjedzony" powoduje natychmiastową, optymistyczną aktualizację pasków postępu. Długie operacje (np. generowanie planu) są sygnalizowane przez szkielety interfejsu (skeleton UI).
  - **Dostępność:** Paski postępu wykorzystują semantyczny element `<progress>` z odpowiednimi etykietami ARIA. Wszystkie interaktywne elementy są dostępne z klawiatury.
  - **Bezpieczeństwo:** Widok wyświetla tylko dane zalogowanego użytkownika, co jest gwarantowane przez mechanizm RLS w Supabase.

### Widok: Widok Tygodnia

- **Ścieżka widoku:** `/tydzien`
- **Główny cel:** Zapewnienie użytkownikowi wglądu w cały 7-dniowy plan posiłków, co ułatwia planowanie.
- **Kluczowe informacje do wyświetlenia:**
  - Widok tabelaryczny (desktop) lub lista (mobile) z podziałem na dni tygodnia i typy posiłków.
  - Nazwa i zdjęcie każdego zaplanowanego posiłku.
- **Kluczowe komponenty widoku:** `WeekTable`, `DayList` (wersja mobilna), `MealCard`.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Umożliwia szybki podgląd przepisu (w modalu) oraz inicjację wymiany posiłku bezpośrednio z tego widoku.
  - **Dostępność:** Tabela na desktopie ma odpowiednie nagłówki (`<th>`, `scope`). Widok mobilny to semantyczna lista.
  - **Bezpieczeństwo:** Dostęp do widoku jest chroniony i wymaga uwierzytelnienia.

### Widok: Lista Zakupów

- **Ścieżka widoku:** `/lista-zakupow`
- **Główny cel:** Uproszczenie procesu zakupów poprzez dostarczenie jednej, zagregowanej listy wszystkich potrzebnych składników.
- **Kluczowe informacje do wyświetlenia:**
  - Lista składników pogrupowana według kategorii (np. Nabiał, Mięso, Warzywa).
  - Zsumowana ilość/waga każdego składnika.
  - Informacja, że lista bazuje na oryginalnym planie i nie uwzględnia modyfikacji.
- **Kluczowe komponenty widoku:** `Accordion` (dla kategorii), `ShoppingListItem` (z checkboxem).
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Odznaczenie produktu powoduje jego wizualne przekreślenie i przeniesienie na dół listy w danej kategorii. Stan odznaczeń jest przechowywany w sesji (Zustand).
  - **Dostępność:** Struktura oparta na listach semantycznych. Każdy checkbox jest powiązany z etykietą produktu.
  - **Bezpieczeństwo:** Dostęp do widoku jest chroniony i wymaga uwierzytelnienia.

### Widok: Profil i Ustawienia

- **Ścieżka widoku:** `/profil`
- **Główny cel:** Umożliwienie użytkownikowi zarządzania swoimi danymi, celami i kontem.
- **Kluczowe informacje do wyświetlenia:**
  - Formularz edycji danych profilowych (waga, poziom aktywności).
  - Sekcja zarządzania kontem z opcjami "Zacznij od nowa" (reset planu).
  - Link do formularza opinii/zgłaszania problemów.
- **Kluczowe komponenty widoku:** `ProfileForm`, `AlertDialog` (do potwierdzania akcji destrukcyjnych).
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Zapisanie zmian w profilu skutkuje wyświetleniem komunikatu (Toast) informującego o przeliczeniu planu. Akcje destrukcyjne wymagają dwuetapowego potwierdzenia.
  - **Dostępność:** Formularze są w pełni dostępne i poprawnie oetykietowane.
  - **Bezpieczeństwo:** Zmiany danych są walidowane po stronie serwera.

## 3. Mapa podróży użytkownika

**Scenariusz 1: Nowy Użytkownik**

1.  **Odkrycie:** Użytkownik ląduje na `/przepisy`. Przegląda dania.
2.  **Rejestracja:** Klika "Zarejestruj się", przechodzi do `/auth`, tworzy konto.
3.  **Konfiguracja:** Zostaje przekierowany na `/onboarding`, gdzie krok po kroku podaje swoje dane, akceptuje cele i disclaimer.
4.  **Generowanie Planu:** Aplikacja wyświetla stan ładowania podczas generowania pierwszego planu.
5.  **Pierwsze Użycie:** Ląduje na `/`, czyli Panelu Dziennym. Widzi swój plan na dziś.
6.  **Codzienna Interakcja:** Oznacza posiłki jako zjedzone, obserwuje paski postępu. Klika na posiłek, aby zobaczyć przepis w modalu.
7.  **Planowanie Zakupów:** Przechodzi do `/lista-zakupow`, aby przygotować się do zakupów.

**Scenariusz 2: Powracający Użytkownik**

1.  **Logowanie:** Użytkownik wchodzi na stronę i zostaje automatycznie zalogowany (dzięki tokenowi) lub loguje się manualnie przez `/auth`.
2.  **Panel Główny:** Zostaje przekierowany na `/`. Widzi dzisiejszy plan i swój aktualny postęp.
3.  **Modyfikacja Planu:** Użytkownik nie ma ochoty na proponowany obiad. Klika "Zmień danie", otwiera się modal z propozycjami, wybiera nową.
4.  **Aktualizacja Celów:** Po tygodniu wchodzi w `/profil`, aktualizuje swoją wagę. Aplikacja przelicza jego cele i informuje o aktualizacji przyszłych dni planu.

## 4. Układ i struktura nawigacji

- **Układ Główny:** Aplikacja ma stały układ z pionowym paskiem nawigacyjnym po lewej stronie na ekranach desktopowych. Na urządzeniach mobilnych pasek ten jest zwinięty do ikony "hamburgera" w nagłówku. Główna treść widoku jest wyświetlana w centralnej części ekranu.
- **Elementy Nawigacji:**
  - **Panel Dzienny (`/`)**
  - **Widok Tygodnia (`/tydzien`)**
  - **Lista Zakupów (`/lista-zakupow`)**
  - **Wszystkie przepisy (`/przepisy`)**
  - **Profil (`/profil`)**
- **Logika Nawigacji:**
  - **Użytkownik zalogowany:** Widzi i ma dostęp do wszystkich elementów nawigacji.
  - **Użytkownik niezalogowany:** Widzi wszystkie elementy, ale kliknięcie na pozycje wymagające autentykacji (wszystkie oprócz "Wszystkie przepisy") przekierowuje go do widoku logowania (`/auth`).

## 5. Kluczowe komponenty

Poniżej znajduje się lista kluczowych, reużywalnych komponentów, które będą stanowić podstawę interfejsu użytkownika:

- **`MealCard`**: Karta wyświetlająca podstawowe informacje o posiłku (zdjęcie, nazwa, kaloryczność) wraz z przyciskami interakcji ("Zjedzono", "Zmień danie"). Używana w Panelu Dziennym i Widoku Tygodnia.
- **`MacroProgressBar`**: Wizualny wskaźnik postępu dla pojedynczego makroskładnika lub kalorii, pokazujący aktualną wartość w stosunku do celu.
- **`RecipeDetailModal`**: Modal wyświetlający pełne informacje o przepisie, w tym składniki, instrukcje i wartości odżywcze. Umożliwia edycję gramatury skalowalnych składników.
- **`GlobalErrorToast`**: Komponent wyświetlający globalne, nieblokujące powiadomienia o błędach (np. błąd API, utrata połączenia).
- **`SkeletonLoader`**: Komponent szkieletu UI używany do sygnalizowania ładowania danych w kluczowych widokach (np. Panel Dzienny, Lista Zakupów), poprawiający postrzeganą wydajność.
- **`AlertDialog`**: Modal dialogowy używany do uzyskania od użytkownika potwierdzenia wykonania akcji destrukcyjnej (np. reset planu).
- **`CalendarStrip`**: Poziomy, przewijany pasek z dniami tygodnia, umożliwiający nawigację w Panelu Dziennym.
```
