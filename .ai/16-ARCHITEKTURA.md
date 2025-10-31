# Zapisy Decyzji Architektonicznych (ADR) - LowCarbPlaner

## Przegląd

Ten dokument zawiera kluczowe decyzje architektoniczne podjęte podczas rozwoju LowCarbPlaner, w tym uzasadnienie, rozważane alternatywy i konsekwencje każdej decyzji.

---

## ADR-001: Użycie Next.js 15 z App Router

**Status:** ✅ Zaakceptowano
**Data:** 2024-11-15
**Decydujący:** Zespół Deweloperski

### Kontekst

Potrzebowaliśmy wybrać framework full-stack do budowy nowoczesnej aplikacji webowej z renderowaniem po stronie serwera, routami API i doskonałym doświadczeniem dewelopera.

### Decyzja

Przyjęcie **Next.js 15 z App Router** jako podstawowego frameworka.

### Uzasadnienie

1. **React Server Components (RSC):** Dramatycznie redukuje rozmiar bundla JavaScript po stronie klienta poprzez renderowanie komponentów na serwerze
2. **Server Actions:** Eliminuje potrzebę osobnych endpointów API dla mutacji, upraszczając architekturę
3. **Routing Oparty na Plikach:** Intuicyjna i łatwa w utrzymaniu struktura routingu z współlokowanymi layoutami
4. **Wbudowane Optymalizacje:** Automatyczne dzielenie kodu, optymalizacja obrazów, optymalizacja czcionek
5. **Wsparcie TypeScript:** Pierwszorzędna integracja TypeScript od razu
6. **Aktywny Rozwój:** Next.js 15 jest gotowy do produkcji z najnowocześniejszymi funkcjami (Turbopack, częściowe pre-renderowanie)

### Rozważane Alternatywy

- **Remix:** Doskonała architektura, ale mniejszy ekosystem i mniej dojrzałe narzędzia
- **SvelteKit:** Świetna wydajność, ale zespół bardziej zaznajomiony z ekosystemem React
- **Tradycyjne React SPA + Express:** Bardziej skomplikowana konfiguracja, brak wbudowanych korzyści SSR

### Konsekwencje

**Pozytywne:**

- Szybsze początkowe ładowanie stron i lepsze SEO
- Uproszczona logika backendu z Server Actions
- Doskonałe doświadczenie dewelopera z hot reloading i nakładkami błędów
- Silne wsparcie społeczności i obszerna dokumentacja

**Negatywne:**

- Krzywa uczenia dla App Router (nowszy paradygmat)
- Niektóre biblioteki zewnętrzne jeszcze nie zoptymalizowane dla RSC
- Uzależnienie od ekosystemu Vercel (zmniejszone przez użycie Cloudflare Pages)

---

## ADR-002: Użycie Supabase jako Backend-as-a-Service (BaaS)

**Status:** ✅ Zaakceptowano
**Data:** 2024-11-15
**Decydujący:** Zespół Deweloperski, Product Owner

### Kontekst

Potrzebowaliśmy skalowalnego, bezpiecznego rozwiązania backendowego dla uwierzytelniania, zarządzania bazą danych i funkcji serverless bez zarządzania infrastrukturą.

### Decyzja

Przyjęcie **Supabase** jako podstawowej platformy backendowej.

### Uzasadnienie

1. **Baza Danych PostgreSQL:** Pełnofunkcyjna relacyjna baza danych z gwarancjami ACID
2. **Row Level Security (RLS):** Autoryzacja na poziomie bazy danych zapewnia bezpieczeństwo danych
3. **Wbudowane Uwierzytelnianie:** Wspiera email/hasło, dostawców OAuth (Google), magic linki
4. **Edge Functions:** Funkcje serverless w Deno/TypeScript dla niestandardowej logiki biznesowej
5. **Subskrypcje Realtime:** Wbudowane wsparcie WebSocket dla przyszłych funkcji real-time
6. **Możliwość Self-Hostingu:** Można migrować do self-hosted w razie potrzeby (strategia wyjścia)
7. **Doświadczenie Dewelopera:** Doskonałe CLI, wsparcie migracji, interfejs dashboardu

### Rozważane Alternatywy

- **Firebase:** Silna alternatywa, ale mniej SQL-natywna, proprietarny model NoSQL
- **AWS Amplify:** Bardziej skomplikowane, wyższa krzywa uczenia, uzależnienie od AWS
- **Niestandardowy Backend (Node.js/Express + PostgreSQL):** Pełna kontrola, ale wymaga zarządzania infrastrukturą

### Konsekwencje

**Pozytywne:**

- Szybki rozwój z pre-zbudowanym uwierzytelnianiem i bazą danych
- Silne bezpieczeństwo z politykami RLS wymuszanymi na poziomie bazy danych
- Ujednolicona platforma dla web i przyszłej aplikacji mobilnej
- Opłacalne dla skali MVP (hojny darmowy tier)

**Negatywne:**

- Uzależnienie od dostawcy (zmniejszone przez standard PostgreSQL i opcję self-hostingu)
- Niektóre zaawansowane funkcje PostgreSQL wymagają niestandardowej konfiguracji
- Tuning wydajności ograniczony w porównaniu do samodzielnie zarządzanej bazy danych

---

## ADR-003: Użycie Tailwind CSS v4 do Stylowania

**Status:** ✅ Zaakceptowano
**Data:** 2024-11-16
**Decydujący:** Zespół Frontend

### Kontekst

Potrzebowaliśmy rozwiązania CSS pozwalającego na szybki rozwój UI, utrzymanie spójności i małe rozmiary bundli.

### Decyzja

Przyjęcie **Tailwind CSS v4** z biblioteką komponentów **shadcn/ui**.

### Uzasadnienie

1. **Podejście Utility-First:** Szybkie prototypowanie bez opuszczania HTML/JSX
2. **Usuwanie Nieużywanego CSS:** Buildy produkcyjne zawierają tylko używane klasy (minimalny rozmiar bundla)
3. **Integracja Design System:** Łatwe dostosowanie design tokens (kolory, odstępy, typografia)
4. **shadcn/ui:** Pre-zbudowane dostępne komponenty, które są copy-paste friendly (brak bloatu npm)
5. **Doświadczenie Dewelopera:** Autocomplete w VSCode, narzędzia responsywne, wsparcie dark mode
6. **Korzyści Wersji 4:** Szybsze buildy, natywne wsparcie CSS, ulepszone DX

### Rozważane Alternatywy

- **CSS Modules:** Bardziej rozwlekłe, trudniejsze do utrzymania spójności
- **Styled Components / Emotion:** Narzut runtime CSS-in-JS, większe rozmiary bundli
- **Bootstrap / Material UI:** Opiniowane projekty, trudniejsze do dostosowania, cięższe bundle

### Konsekwencje

**Pozytywne:**

- Ekstremalnie szybki rozwój UI (50%+ szybciej niż tradycyjny CSS)
- Spójny system projektowania we wszystkich komponentach
- Małe rozmiary bundli produkcyjnych (tylko używane klasy wysyłane)
- Brak prop drilling dla logiki stylowania

**Negatywne:**

- Klasy HTML mogą stać się rozwlekłe (zmniejszone przez narzędzie `cn()` i CVA)
- Krzywa uczenia dla deweloperów nieznających CSS utility-first
- Wymaga kroku build (nie jest problemem z Next.js)

---

## ADR-004: Użycie TanStack Query do Zarządzania Stanem Serwera

**Status:** ✅ Zaakceptowano
**Data:** 2024-11-17
**Decydujący:** Zespół Frontend

### Kontekst

Potrzebowaliśmy solidnego rozwiązania do pobierania, cachowania, synchronizowania i aktualizowania stanu serwera w aplikacji klienta.

### Decyzja

Przyjęcie **TanStack Query (React Query) v5** dla całego zarządzania stanem serwera.

### Uzasadnienie

1. **Automatyczne Cachowanie:** Inteligentne cachowanie z wzorcem stale-while-revalidate
2. **Refetching w Tle:** Utrzymuje UI świeże bez interwencji użytkownika
3. **Optimistic Updates:** Natychmiastowy feedback UI dla mutacji z automatycznym rollbackiem przy błędzie
4. **Devtools:** Doskonałe narzędzia debugowania do inspekcji stanu zapytań
5. **Wsparcie TypeScript:** Pełna inferencja typów dla zapytań i mutacji
6. **Niezależność od Frameworka:** Może być ponownie użyty jeśli zbudujemy aplikację mobilną z React Native

### Rozważane Alternatywy

- **Redux Toolkit Query (RTK Query):** Powiązane z ekosystemem Redux, więcej boilerplate
- **SWR:** Lżejszy, ale mniej funkcjonalny, mniejsze wsparcie TypeScript
- **Apollo Client:** Overkill dla REST API, zaprojektowany dla GraphQL

### Konsekwencje

**Pozytywne:**

- Dramatycznie zmniejszony boilerplate dla pobierania danych (brak ręcznych stanów loading/error)
- Automatyczna deduplikacja i cachowanie requestów
- Lepsze UX z refetchingiem w tle i optimistic updates
- Łatwiejsze testowanie (mockowanie odpowiedzi zapytań)

**Negatywne:**

- Dodatkowa krzywa uczenia dla deweloperów nowych w React Query
- Zarządzanie kluczami zapytań wymaga dyscypliny
- Może być overkill dla bardzo prostych aplikacji (nie jest problemem dla LowCarbPlaner)

---

## ADR-005: Użycie Zustand do Globalnego Stanu Klienta

**Status:** ✅ Zaakceptowano
**Data:** 2024-11-17
**Decydujący:** Zespół Frontend

### Kontekst

Potrzebowaliśmy lekkiego rozwiązania do zarządzania globalnym stanem UI (sesja użytkownika, motyw, stan menu mobilnego), który nie należy na serwerze.

### Decyzja

Przyjęcie **Zustand v5** do zarządzania stanem globalnym po stronie klienta.

### Uzasadnienie

1. **Minimalistyczne API:** Proste, intuicyjne API z minimalnym boilerplate
2. **Brak Owijania Provider:** Działa bez React Context (unika niepotrzebnych re-renderów)
3. **Wsparcie TypeScript:** Doskonała inferencja typów
4. **Mały Rozmiar Bundla:** ~1KB gzip (vs. Redux ~3KB + React-Redux ~2KB)
5. **Wsparcie Middleware:** Wbudowane persist, devtools, wsparcie immer
6. **Elastyczność:** Może być używany poza komponentami React

### Rozważane Alternatywy

- **Redux Toolkit:** Overkill dla prostego globalnego stanu, więcej boilerplate
- **React Context:** Problemy wydajnościowe przy częstych aktualizacjach, wymaga zagnieżdżania providerów
- **Jotai / Recoil:** Atomiczne zarządzanie stanem to overkill dla naszego use case

### Konsekwencje

**Pozytywne:**

- Ekstremalnie szybka implementacja i zrozumienie
- Brak narzutu wydajnościowego (brak kaskad re-renderów Context)
- Łatwe testowanie (sklepy to zwykłe obiekty JavaScript)
- Idealne dla prostego globalnego stanu (motyw, sesja auth, flagi UI)

**Negatywne:**

- Mniej potężne niż Redux dla złożonej logiki stanu (nie potrzebne w naszej aplikacji)
- Brak debugowania time-travel (można dodać middleware jeśli potrzeba)
- Mniejsza społeczność w porównaniu do Redux

---

## ADR-006: Użycie React Hook Form + Zod do Zarządzania Formularzami

**Status:** ✅ Zaakceptowano
**Data:** 2024-11-18
**Decydujący:** Zespół Frontend

### Kontekst

Potrzebowaliśmy wydajnego rozwiązania formularzy z wbudowaną walidacją, które dobrze integruje się z TypeScript.

### Decyzja

Przyjęcie **React Hook Form v7** z **Zod v4** dla schematów walidacji.

### Uzasadnienie

1. **Wydajność:** Minimalne re-rendery (domyślnie niekontrolowane inputy)
2. **Integracja TypeScript:** Pełna inferencja typów ze schematów Zod do stanu formularza
3. **Rozmiar Bundla:** Lekki (9KB gzip) w porównaniu do Formik (15KB)
4. **DX:** Intuicyjne API z `register()` i `handleSubmit()`
5. **Walidacja:** Zod dostarcza walidację opartą na schematach, którą można ponownie użyć na serwerze i kliencie
6. **Ekosystem:** Doskonałe integracje z bibliotekami UI (komponenty formularza shadcn/ui)

### Rozważane Alternatywy

- **Formik:** Bardziej rozwlekłe API, większy bundle, wolniejsza wydajność
- **React Final Form:** Podobna wydajność, ale mniejsze wsparcie TypeScript
- **Ręczne Zarządzanie Stanem:** Za dużo boilerplate, podatne na błędy

### Konsekwencje

**Pozytywne:**

- Ekstremalnie szybkie formularze (minimalne re-rendery)
- Type-safe schematy walidacji współdzielone między frontend i backend
- Automatyczna obsługa błędów i walidacja na poziomie pól
- Doskonałe doświadczenie dewelopera z autocomplete

**Negatywne:**

- Krzywa uczenia dla składni schematu Zod (zmniejszona przez dokumentację)
- Niekontrolowane inputy mogą być mylące dla deweloperów przyzwyczajonych do kontrolowanych komponentów

---

## ADR-007: Użycie Vitest do Testowania Jednostkowego

**Status:** ✅ Zaakceptowano
**Data:** 2024-11-19
**Decydujący:** Zespół Deweloperski

### Kontekst

Potrzebowaliśmy szybkiego, nowoczesnego frameworka testowego kompatybilnego z Vite i TypeScript bez skomplikowanej konfiguracji.

### Decyzja

Przyjęcie **Vitest v2** do testowania jednostkowego i integracyjnego.

### Uzasadnienie

1. **Integracja Vite:** Błyskawicznie szybkie wykonywanie testów wykorzystujące pipeline transformacji Vite
2. **API Kompatybilne z Jest:** Łatwa migracja wiedzy z Jest (te same asercje, API mockowania)
3. **Wsparcie TypeScript:** Natywne wsparcie TypeScript bez konfiguracji babel
4. **Tryb Watch:** Ekstremalnie szybki tryb watch dla workflow TDD
5. **Coverage:** Wbudowane raportowanie pokrycia z v8 lub Istanbul
6. **Nowoczesne Funkcje:** Wsparcie ESM, top-level await, lepsze komunikaty błędów

### Rozważane Alternatywy

- **Jest:** Standard branżowy, ale wolniejszy, wymaga skomplikowanej konfiguracji dla ESM i TypeScript
- **Mocha + Chai:** Więcej ręcznej konfiguracji, mniej zintegrowany ekosystem
- **Jasmine:** Starszy, mniej nowoczesnych funkcji

### Konsekwencje

**Pozytywne:**

- 10x szybsze wykonywanie testów w porównaniu do Jest (wykorzystuje cachowanie Vite)
- Zero konfiguracji dla TypeScript i ESM
- Lepsze doświadczenie dewelopera z natychmiastowym feedbackiem
- Kompatybilne z istniejącą wiedzą Jest

**Negatywne:**

- Mniejszy ekosystem niż Jest (ale szybko rosnący)
- Niektóre pluginy Jest mogą nie mieć jeszcze odpowiedników Vitest
- Nowsze narzędzie (mniej przetestowane niż Jest, ale stabilne dla v2+)

---

## ADR-008: Użycie Playwright do Testowania E2E

**Status:** ✅ Zaakceptowano
**Data:** 2024-11-19
**Decydujący:** Zespół QA, Zespół Deweloperski

### Kontekst

Potrzebowaliśmy niezawodnego, międzyprzeglądarkowego rozwiązania testowania E2E dla krytycznych podróży użytkownika.

### Decyzja

Przyjęcie **Playwright v1.56+** do testowania end-to-end.

### Uzasadnienie

1. **Wsparcie Międzyprzeglądarkowe:** Jedno API dla Chrome, Firefox, Safari, Edge
2. **Mechanizm Auto-Wait:** Inteligentne czekanie na elementy, brak ręcznego `waitFor()` potrzebnego
3. **Testowanie Mobilne:** Wbudowana emulacja urządzeń dla testowania responsywności
4. **Niezawodność:** Mniej niestabilnych testów w porównaniu do Selenium/Cypress
5. **Wykonywanie Równoległe:** Szybkie uruchomienia testów z wbudowaną paralelizacją
6. **Narzędzia Dewelopera:** Playwright Inspector, trace viewer, generator kodu
7. **Nowoczesne API:** Async/await, silne wsparcie TypeScript

### Rozważane Alternatywy

- **Cypress:** Świetne DX, ale ograniczone do jednej przeglądarki na raz, brak wsparcia Safari
- **Selenium WebDriver:** Starsze, bardziej rozwlekłe API, wymaga osobnego zarządzania driverami
- **Puppeteer:** Tylko Chrome (brak Firefox/Safari)

### Konsekwencje

**Pozytywne:**

- Kompleksowe testowanie międzyprzeglądarkowe z jednym zestawem testów
- Ekstremalnie niezawodne testy (mechanizmy auto-wait, retry)
- Szybkie wykonywanie z paralelizacją
- Doskonałe narzędzia debugowania (trace viewer, zrzuty ekranu, filmy)

**Negatywne:**

- Dłuższy czas wykonywania testu niż Cypress dla pojedynczych uruchomień przeglądarki
- Wymaga uruchomienia pełnych przeglądarek (cięższe użycie zasobów)
- Krzywa uczenia dla deweloperów nowych w testowaniu E2E

---

## ADR-009: Wdrożenie na Cloudflare Pages

**Status:** ✅ Zaakceptowano
**Data:** 2024-11-20
**Decydujący:** DevOps, Product Owner

### Kontekst

Potrzebowaliśmy platformy hostingowej dla aplikacji Next.js z globalnym CDN, automatycznymi wdrożeniami i opłacalnością.

### Decyzja

Wdrożenie na **Cloudflare Pages** (nie Vercel).

### Uzasadnienie

1. **Globalny CDN:** 300+ lokalizacji brzegowych dla szybkiej wydajności na całym świecie
2. **Opłacalność:** Hojny darmowy tier (500 buildów/miesiąc, nieograniczona przepustowość)
3. **Zero Konfiguracji:** Automatyczne wdrożenia z GitHub
4. **Preview Deployments:** Automatyczne preview URL dla każdego pull requesta
5. **Ochrona DDoS:** Wbudowane bezpieczeństwo i SSL
6. **Brak Vendor Lock-In:** Można migrować do Vercel lub self-host jeśli potrzeba
7. **Edge Workers:** Może uruchamiać funkcje serverless na brzegu (przyszłe użycie)

### Rozważane Alternatywy

- **Vercel:** Doskonała integracja Next.js, ale droższa w skali, vendor lock-in
- **Netlify:** Dobra alternatywa, ale nieco wolniejsze buildy
- **AWS Amplify:** Nadmiernie skomplikowane, drogie, słabe DX
- **Self-Hosted (VPS):** Za dużo narzutu operacyjnego dla MVP

### Konsekwencje

**Pozytywne:**

- Ekstremalnie szybkie ładowanie stron globalnie (CDN na brzegu)
- Zero zarządzania infrastrukturą
- Opłacalne dla MVP i później
- Automatyczne SSL, ochrona DDoS wliczona
- Preview deployments przyspieszają przeglądy PR

**Negatywne:**

- Nieco mniej zoptymalizowane dla Next.js niż Vercel (ale różnica jest nieznaczna)
- Edge Workers mają ograniczenia w porównaniu do tradycyjnego serverless (nie jest problemem dla MVP)
- Runtime Edge Cloudflare może mieć subtelne różnice od Node.js

---

## ADR-010: Implementacja Row Level Security (RLS) w Bazie Danych

**Status:** ✅ Zaakceptowano
**Data:** 2024-11-21
**Decydujący:** Zespół Backend, Lead Bezpieczeństwa

### Kontekst

Potrzebowaliśmy zapewnić, że użytkownicy mogą uzyskać dostęp tylko do swoich własnych danych bez implementowania logiki autoryzacji w warstwie aplikacji.

### Decyzja

Implementacja polityk **Row Level Security (RLS)** na wszystkich tabelach użytkownika w PostgreSQL.

### Uzasadnienie

1. **Bezpieczeństwo Domyślne:** Autoryzacja wymuszana na poziomie bazy danych, nie w kodzie aplikacji
2. **Obrona w Głębi:** Nawet jeśli kod aplikacji ma błędy, RLS zapobiega nieautoryzowanemu dostępowi
3. **Prostota:** Nie trzeba dodawać klauzul WHERE do każdego zapytania
4. **Auditowalność:** Polityki RLS są scentralizowane i łatwe do przeglądu
5. **Najlepsza Praktyka Supabase:** Supabase zaleca i wspiera RLS natywnie

### Przykładowa Polityka

```sql
CREATE POLICY "Użytkownicy mogą uzyskać dostęp tylko do swoich planów posiłków"
ON planned_meals
FOR ALL
USING (auth.uid() = user_id);
```

### Rozważane Alternatywy

- **Autoryzacja Warstwy Aplikacji:** Podatne na błędy ludzkie, trudne do audytu
- **Autoryzacja API Gateway:** Dodaje złożoność, nie chroni bezpośredniego dostępu do DB
- **Brak Autoryzacji (Zaufanie Klientowi):** Całkowicie niebezpieczne

### Konsekwencje

**Pozytywne:**

- Ekstremalnie silne gwarancje bezpieczeństwa
- Uproszczony kod aplikacji (brak ręcznych sprawdzeń autoryzacji)
- Ochrona przed SQL injection i błędami aplikacji
- Łatwe do audytu i utrzymania polityki

**Negatywne:**

- Narzut wydajnościowy (minimalny, nieznaczny dla naszej skali)
- Debugowanie może być trudne (zapytania milcząco zwracają puste jeśli RLS blokuje)
- Wymaga starannego projektowania polityk dla złożonej logiki autoryzacji

---

## ADR-011: Użycie Strategii Rolling Window Meal Plan

**Status:** ✅ Zaakceptowano
**Data:** 2024-11-22
**Decydujący:** Product Owner, Zespół Backend

### Kontekst

Potrzebowaliśmy zdecydować jak generować i utrzymywać plany posiłków: generować raz na 7 dni, czy utrzymywać rolling window.

### Decyzja

Implementacja strategii **rolling window**: zawsze utrzymuj 7 dni planów posiłków począwszy od dzisiaj.

### Algorytm

```typescript
// Za każdym razem gdy użytkownik otwiera aplikację:
1. Sprawdź istniejące plany posiłków
2. Oblicz zakres dat: [dzisiaj, dzisiaj + 6 dni]
3. Zidentyfikuj brakujące dni w tym zakresie
4. Generuj plany posiłków tylko dla brakujących dni
5. Usuń plany posiłków starsze niż wczoraj
```

### Uzasadnienie

1. **Zawsze Świeże:** Użytkownik zawsze widzi 7 dni do przodu, niezależnie od tego kiedy ostatnio otworzył aplikację
2. **Wydajne:** Generuje tylko brakujące dni (nie regeneruje całego tygodnia)
3. **Brak Problemów z Wygasaniem:** Użytkownik może pominąć dni bez "marnowania" planów
4. **Wsparcie Offline:** 7 dni cache lokalnie jest wystarczające dla dostępu offline

### Rozważane Alternatywy

- **Generuj Pełny Tydzień Z Góry:** Użytkownik może pominąć dni i zmarnować wygenerowane plany
- **Generuj Dzień Po Dniu:** Użytkownik może zapomnieć otworzyć aplikację i nie mieć planu na jutro
- **Generuj 14 Dni:** Overkill dla MVP, bardziej skomplikowane do zarządzania

### Konsekwencje

**Pozytywne:**

- Użytkownik zawsze ma dostępne plany na 7 dni
- Wydajne generowanie (tylko brakujące dni)
- Obsługuje nieregularne wzorce użytkowania z gracją

**Negatywne:**

- Nieco bardziej złożona logika (sprawdzanie luk w datach)
- Wymaga zadania czyszczenia do usuwania starych planów (zmniejszone przez prosty dzienny cron)

---

## ADR-012: Użycie Inteligentnego Algorytmu Skalowania Składników

**Status:** ✅ Zaakceptowano
**Data:** 2024-11-23
**Decydujący:** Product Owner, Zespół Backend

### Kontekst

Potrzebowaliśmy sposobu na dopasowanie przepisów do celów kalorycznych użytkownika bez ręcznego tworzenia tysięcy wariantów przepisów.

### Decyzja

Implementacja **inteligentnego algorytmu skalowania składników**, który dostosowuje składniki "skalowalne", zachowując składniki "stałe" bez zmian.

### Algorytm

```typescript
1. Oznacz składniki jako "skalowalne" (mięso, oleje, orzechy) lub "stałe" (jajka, plastry sera)
2. Oblicz docelowe kalorie dla posiłku (1/3 dziennego celu)
3. Dla każdego przepisu:
   a. Oblicz kalorie bazowe (100% wszystkich składników)
   b. Oblicz współczynnik skalowania: cel / baza
   c. Skaluj tylko składniki "skalowalne" według współczynnika
   d. Waliduj ograniczenia: minimalne/maksymalne ilości, proporcje makro
   e. Oceń przepis: abs(skalowane_kalorie - docelowe_kalorie)
4. Wybierz przepis z najniższym wynikiem (najlepsze dopasowanie)
```

### Przykład

```
Przepis: Jajecznica
- 2 jajka (stałe, 140 kcal)
- 100g boczku (skalowalne, 300 kcal)
- 10g masła (skalowalne, 70 kcal)
Baza: 510 kcal

Cel: 400 kcal
Współczynnik skalowania: 400 / 510 = 0.78

Wynik:
- 2 jajka (stałe, 140 kcal)
- 78g boczku (skalowane, 234 kcal)
- 8g masła (skalowane, 55 kcal)
Łącznie: 429 kcal (w tolerancji ±5%)
```

### Uzasadnienie

1. **Personalizacja:** Każdy użytkownik dostaje dokładnie dopasowane cele kaloryczne/makro
2. **Ponowne Użycie:** Jeden przepis może obsłużyć użytkowników z różnymi celami
3. **Realizm:** Zachowuje integralność przepisu (nie można mieć 0.5 jajka)
4. **Elastyczność:** Wspiera tysiące profili użytkowników bez rozrastania się bazy danych

### Rozważane Alternatywy

- **Predefiniowane Porcje:** Wymagałoby przechowywania wariantów dla każdego poziomu kalorycznego
- **Ręczne Dostosowanie Użytkownika:** Niweluje cel automatyzacji
- **Tylko Stałe Przepisy:** Wymagałoby ogromnej bazy przepisów dla dopasowania wszystkich użytkowników

### Konsekwencje

**Pozytywne:**

- Bardzo spersonalizowane plany posiłków z małą bazą przepisów
- Skaluje się do milionów użytkowników bez rozrastania bazy danych
- Zachowuje realizm i integralność przepisów

**Negatywne:**

- Złożony algorytm wymagający dokładnego testowania
- Przypadki brzegowe gdzie żaden przepis nie mieści się w tolerancji (potrzebny fallback)
- Skalowanie składników może dawać nietypowe ilości (np. 87g kurczaka)

---

## Przyszłe ADR do Udokumentowania

Gdy zostaną podjęte następujące decyzje, utwórz nowe wpisy ADR:

- **ADR-013:** Strategia Implementacji Progressive Web App (PWA)
- **ADR-014:** Strategia Rozwiązywania Konfliktów Synchronizacji Offline
- **ADR-015:** Wybór Narzędzia do Analityki i Śledzenia Błędów
- **ADR-016:** Strategia Internacjonalizacji (i18n)
- **ADR-017:** Framework Aplikacji Mobilnej (React Native vs. Flutter)
- **ADR-018:** Integracja Przetwarzania Płatności (gdy dodano monetyzację)
- **ADR-019:** Wybór Dostawcy Usług Email
- **ADR-020:** Strategia CDN dla Obrazów Przepisów

---

## Szablon ADR (do przyszłego użycia)

```markdown
## ADR-XXX: [Tytuł Decyzji]

**Status:** 🟡 Proponowany | ✅ Zaakceptowany | ❌ Odrzucony | 🔄 Zastąpiony
**Data:** RRRR-MM-DD
**Decydujący:** [Imiona/Role]

### Kontekst

[Jaki problem obserwujemy, który motywuje tę decyzję lub zmianę?]

### Decyzja

[Jaką zmianę proponujemy i/lub wykonujemy?]

### Uzasadnienie

[Dlaczego podejmujemy tę decyzję? Wymień kluczowe powody.]

### Rozważane Alternatywy

[Jakie inne opcje zbadaliśmy? Dlaczego nie zostały wybrane?]

### Konsekwencje

**Pozytywne:**
[Co staje się łatwiejsze/lepsze dzięki tej decyzji?]

**Negatywne:**
[Co staje się trudniejsze/gorsze? Jakie są kompromisy?]
```

---

**Ostatnia Aktualizacja:** 2025-10-30
**Utrzymywane przez:** Zespół Architektoniczny
