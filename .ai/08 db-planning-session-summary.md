<conversation_summary>
<decisions>

1.  Tabela `profiles` będzie tworzona automatycznie dla każdego nowego użytkownika w `auth.users` za pomocą triggera PostgreSQL.
2.  Obliczone cele użytkownika (kalorie, makroskładniki) będą przechowywane w tabeli `profiles` i aktualizowane tylko po zmianie danych wejściowych.
3.  Predefiniowane opcje dla pól `płeć`, `poziom aktywności` i `cel` będą implementowane jako natywne typy `ENUM` w PostgreSQL.
4.  Zostanie utworzona tabela `ingredients` zawierająca dane odżywcze, jednostkę, informację o podzielności (`is_divisible`) oraz unikalną nazwę.
5.  Relacja między przepisami a składnikami zostanie zrealizowana przez tabelę łączącą `recipe_ingredients`, która będzie zawierać ilość bazową, flagę skalowalności (`is_scalable`) oraz powiązanie z konkretnym krokiem przepisu (`step_number`).
6.  Instrukcje przygotowania przepisu będą przechowywane w tabeli `recipes` w kolumnie typu `JSONB` jako lista obiektów, gdzie każdy obiekt reprezentuje krok i może zawierać opcjonalny URL do zdjęcia.
7.  7-dniowy plan posiłków będzie reprezentowany w znormalizowanej tabeli `planned_meals` z osobnym wierszem dla każdego posiłku (`user_id`, `date`, `meal_type`, `recipe_id`).
8.  Informacja o zjedzeniu posiłku będzie przechowywana jako kolumna `is_eaten` (`BOOLEAN`) w tabeli `planned_meals`.
9.  Modyfikacje planu przez użytkownika będą obsługiwane przez: aktualizację `recipe_id` (wymiana posiłku) oraz zapisanie zmian gramatury w dodatkowej kolumnie `ingredient_overrides` (`JSONB`) w tabeli `planned_meals`.
10. Stan listy zakupów (odznaczone pozycje) będzie zarządzany wyłącznie po stronie klienta (np. w `localStorage`) dla MVP.
11. Zagregowana lista zakupów będzie generowana dynamicznie za pomocą widoku (`VIEW`) lub funkcji PostgreSQL na podstawie tabeli `planned_meals`.
12. Zostaną utworzone kluczowe indeksy: na kluczach obcych, złożony indeks na `(user_id, date)` w `planned_meals` oraz indeks `GIN` na kolumnie `tags` w tabeli `recipes`.
13. Zostaną zaimplementowane polityki bezpieczeństwa na poziomie wiersza (RLS) na wszystkich tabelach z danymi użytkownika (`user_id = auth.uid()`), a dane publiczne (`recipes`, `ingredients`) będą dostępne do odczytu dla wszystkich zalogowanych użytkowników.
14. Zastosowane zostaną dwie flagi do obsługi skalowalności składników: `ingredients.is_divisible` (ogólna właściwość) i `recipe_ingredients.is_scalable` (kontekst przepisu).
15. Zostanie utworzona dedykowana tabela `ingredient_unit_conversions` do przechowywania niestandardowych jednostek i ich ekwiwalentów w gramach (np. "1 jajko = 50g").
16. Tabela `feedback` zostanie utworzona do zbierania opinii od użytkowników, zawierając m.in. `user_id`, treść (`content`) i metadane (`metadata` typu JSONB).
17. Tabela `recipes` zostanie rozszerzona o kolumny `meal_types` (ARRAY typów ENUM) i `tags` (ARRAY typów TEXT), aby ułatwić algorytmowi generowanie zróżnicowanych planów.
18. Akceptacja regulaminu przez użytkownika będzie odnotowywana w tabeli `profiles` w kolumnie `disclaimer_accepted_at` (`TIMESTAMPTZ`).
19. Usunięcie przepisu przez administratora ustawi `recipe_id` w tabeli `planned_meals` na `NULL` (polityka `ON DELETE SET NULL`), zachowując historyczne dane użytkownika.
20. Zostaną zdenormalizowane dane w tabeli `recipes` poprzez dodanie kolumny `total_calories` (i opcjonalnie makroskładników), która będzie automatycznie aktualizowana przez trigger, w celu optymalizacji funkcji wymiany posiłku.
21. Zostanie utworzona dedykowana rola w PostgreSQL (np. `content_manager`) do zarządzania danymi "master" (przepisy, składniki), podczas gdy zwykli użytkownicy będą mieli tylko uprawnienia do odczytu tych danych.
22. Tabele zostaną zorganizowane w schematach: `public` dla danych użytkowników (`profiles`, `planned_meals`) i `content` dla danych głównych (`recipes`, `ingredients`).
23. Usunięcie konta użytkownika z `auth.users` spowoduje kaskadowe usunięcie wszystkich powiązanych z nim danych (polityka `ON DELETE CASCADE`), zgodnie z RODO.
24. Zostaną dodane ograniczenia `UNIQUE` na nazwach składników i przepisów oraz złożone `UNIQUE` na `(user_id, date, meal_type)` w `planned_meals`, aby zapewnić integralność danych.
25. Funkcja resetowania planu zostanie zaimplementowana jako funkcja PostgreSQL, która czyści `planned_meals` i zeruje odpowiednie pola w `profiles`, nie usuwając samego profilu.
26. Początkowe dane (przepisy, składniki) zostaną załadowane do bazy za pomocą mechanizmu seedingu w Supabase (`supabase/seed.sql`).
27. Zostaną dodane ograniczenia `CHECK` na kolumnach numerycznych (np. `wiek`, `waga`), aby zapewnić, że wartości są dodatnie.
28. Wprowadzona zostanie polityka retencji danych: codzienne zadanie (`pg_cron`) będzie usuwać rekordy z `planned_meals` starsze niż wczorajszy dzień.
29. Funkcja `reset_user_plan()` zostanie zdefiniowana z opcją `SECURITY DEFINER`, aby mogła modyfikować dane chronione przez RLS, z wewnętrzną weryfikacją uprawnień.
    </decisions>

<matched_recommendations>

1.  **Automatyzacja i spójność danych za pomocą triggerów:** Automatyczne tworzenie profilu po rejestracji oraz przeliczanie sumy kalorii w przepisie po zmianie składników to kluczowe decyzje zapewniające integralność i odciążające logikę aplikacji.
2.  **Rygorystyczne bezpieczeństwo poprzez RLS i role:** Wdrożenie polityk RLS na wszystkich tabelach z danymi użytkownika oraz separacja uprawnień za pomocą ról (`authenticated`, `content_manager`) jest fundamentem bezpieczeństwa aplikacji.
3.  **Wykorzystanie zaawansowanych typów danych PostgreSQL:** Użycie `ENUM` dla integralności, `JSONB` dla elastyczności przechowywania danych strukturalnych (kroki przepisu, modyfikacje użytkownika) oraz `ARRAY` dla tagowania znacząco podnosi jakość i wydajność schematu.
4.  **Optymalizacja wydajności zapytań:** Decyzje o stworzeniu specjalistycznych indeksów (`GIN` dla tagów, złożone indeksy dla zapytań o plany) oraz strategiczna denormalizacja (obliczone kalorie w przepisach) są kluczowe dla szybkiego działania algorytmów aplikacji.
5.  **Znormalizowana i skalowalna architektura:** Projekt tabel, zwłaszcza `planned_meals`, został oparty na zasadach normalizacji, co zapewnia elastyczność na przyszłość (np. dodawanie kolejnych typów posiłków).
6.  **Zarządzanie cyklem życia danych:** Zdefiniowano polityki `ON DELETE` (CASCADE dla danych użytkownika, SET NULL dla przepisów) oraz wprowadzono mechanizm automatycznego usuwania starych danych (`pg_cron`), co świadczy o dojrzałym podejściu do zarządzania bazą danych.
    </matched_recommendations>

<database_planning_summary>

### Główne wymagania dotyczące schematu bazy danych

Schemat bazy danych dla MVP zostanie zaimplementowany w PostgreSQL z wykorzystaniem platformy Supabase. Kluczowe założenia to:

- **Automatyzacja:** Procesy takie jak tworzenie profilu użytkownika po rejestracji będą zautomatyzowane za pomocą triggerów.
- **Bezpieczeństwo:** Dane użytkowników będą ściśle chronione za pomocą polityk RLS, zapewniając, że każdy użytkownik ma dostęp wyłącznie do swoich informacji.
- **Wydajność:** Schemat zostanie zoptymalizowany pod kątem kluczowych operacji, takich jak generowanie planu żywieniowego i listy zakupów, poprzez odpowiednie indeksowanie i strategiczną denormalizację.
- **Integralność danych:** Użycie typów `ENUM`, ograniczeń `UNIQUE` i `CHECK` zapewni spójność i poprawność przechowywanych danych na poziomie bazy.
- **Skalowalność:** Struktura tabel, zwłaszcza tych przechowujących plany posiłków, jest zaprojektowana w sposób znormalizowany, aby umożliwić łatwą rozbudowę w przyszłości.

### Kluczowe encje i ich relacje

1.  **Użytkownicy i Profile:**
    - `auth.users`: Tabela Supabase zarządzająca uwierzytelnianiem.
    - `public.profiles`: Relacja 1-do-1 z `auth.users`. Przechowuje dane osobowe (wiek, waga, płeć), obliczone cele żywieniowe (np. `target_calories`) oraz metadane (np. `disclaimer_accepted_at`). Wiersz tworzony automatycznie przez trigger.

2.  **Treści Główne (w schemacie `content`):**
    - `content.ingredients`: Tabela słownikowa ze składnikami i ich wartościami odżywczymi na 100g.
    - `content.recipes`: Centralna tabela z przepisami. Zawiera nazwę, tagi (`TEXT[]`), typy posiłków (`ENUM[]`), zdenormalizowaną sumę kalorii (`total_calories`) oraz instrukcje w formacie `JSONB` (lista kroków z opcjonalnymi zdjęciami).
    - `content.recipe_ingredients`: Tabela łącząca (wiele-do-wielu) `recipes` i `ingredients`. Określa ilość składnika w przepisie, jego skalowalność i powiązanie z konkretnym krokiem instrukcji.
    - `content.ingredient_unit_conversions`: Tabela pomocnicza (1-do-wielu z `ingredients`) definiująca niestandardowe jednostki (np. "sztuka") i ich wagę w gramach.

3.  **Dane Użytkownika (w schemacie `public`):**
    - `public.planned_meals`: Główna tabela transakcyjna. Każdy wiersz reprezentuje jeden posiłek dla konkretnego użytkownika w danym dniu (`user_id`, `date`, `meal_type`, `recipe_id`). Zawiera również status `is_eaten` oraz `JSONB` z modyfikacjami gramatury dokonanymi przez użytkownika.
    - `public.feedback`: Prosta tabela do przechowywania opinii i zgłoszeń od użytkowników.

### Ważne kwestie dotyczące bezpieczeństwa i skalowalności

- **Bezpieczeństwo:**
  - **RLS:** Wszystkie tabele w schemacie `public` będą miały włączone RLS, ograniczając dostęp do danych na podstawie `auth.uid()`.
  - **Role:** Dostęp do modyfikacji danych w schemacie `content` będzie ograniczony do specjalnej roli (`content_manager`), podczas gdy zalogowani użytkownicy będą mieli tylko dostęp do odczytu.
  - **Funkcje z `SECURITY DEFINER`**: Funkcje administracyjne (np. resetowanie planu) będą bezpiecznie wykonywane z podwyższonymi uprawnieniami, z wewnętrzną walidacją tożsamości użytkownika.
- **Skalowalność i Wydajność:**
  - **Indeksy:** Zastosowanie indeksu `GIN` na tablicy tagów w `recipes` oraz złożonego indeksu na `(user_id, date)` w `planned_meals` zapewni szybkie wyszukiwanie i pobieranie danych.
  - **Denormalizacja:** Obliczone sumy kaloryczne w `recipes` (aktualizowane przez trigger) drastycznie przyspieszą sortowanie przepisów przy wymianie posiłku.
  - **Dynamiczne generowanie danych:** Lista zakupów będzie generowana dynamicznie przez `VIEW` lub funkcję, co eliminuje redundancję danych i zapewnia jej aktualność.
  - **Automatyczne czyszczenie danych:** Codzienne zadanie `pg_cron` będzie usuwać stare wpisy z `planned_meals`, zapobiegając niekontrolowanemu rozrostowi tabeli i utrzymując wysoką wydajność.

</database_planning_summary>

<unresolved_issues>
Na podstawie dostarczonej historii konwersacji wszystkie zidentyfikowane kwestie zostały omówione i podjęto co do nich konkretne decyzje projektowe. Obecnie nie ma nierozwiązanych problemów wymagających dalszych wyjaśnień.
</unresolved_issues>
</conversation_summary>
