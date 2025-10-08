<pytania>
1.  Czy tabela `profiles` powinna być tworzona automatycznie po utworzeniu nowego użytkownika w `auth.users` w Supabase?
    Rekomendacja: Tak. Należy użyć triggera PostgreSQL, który po wstawieniu nowego rekordu do `auth.users` automatycznie utworzy powiązany wiersz w tabeli `profiles`, kopiując `id` użytkownika. Zapewni to spójność danych.
- wedlug rekomendacji

2.  Gdzie powinny być przechowywane obliczone cele użytkownika (dzienne zapotrzebowanie kaloryczne i makroskładniki)? Czy w tabeli `profiles` czy powinny być obliczane dynamicznie przy każdym żądaniu?
    Rekomendacja: Wartości te powinny być przechowywane w tabeli `profiles`. Obliczanie ich za każdym razem byłoby nieefektywne. Należy je zaktualizować tylko wtedy, gdy użytkownik modyfikuje swoje dane wejściowe (waga, poziom aktywności itp.).

- wedlug rekomendacji

3.  W jaki sposób powinny być przechowywane predefiniowane opcje dla pól takich jak `płeć`, `poziom aktywności fizycznej` i `cel`? Jako stringi (TEXT) czy dedykowany typ ENUM?
    Rekomendacja: Należy użyć natywnych typów `ENUM` w PostgreSQL dla tych pól. Zapewnia to integralność danych, jest bardziej wydajne pod względem przechowywania i zapobiega literówkom oraz nieprawidłowym wartościom.

- wedlug rekomendacji

4.  Czy baza danych powinna zawierać tabelę `ingredients` z informacjami o wartościach odżywczych (kalorie, białko, węglowodany, tłuszcze na 100g), które są niezbędne dla algorytmu skalującego? Dokument PRD nie precyzuje źródła tych danych.
    Rekomendacja: Tak, stworzenie tabeli `ingredients` jest kluczowe. Powinna zawierać co najmniej: `id`, `name`, `unit` (np. 'g', 'ml', 'szt.'), oraz wartości odżywcze na 100 jednostek (np. `calories_per_100g`, `protein_per_100g`). Dane te stanowią fundament dla całego algorytmu generowania planu.

- id, name, unit, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g oraz common units ile wazy np jedna sztuka oraz czy skladnik jest podzielny

5.  Jak powinna być ustrukturyzowana relacja między przepisami (`recipes`) a składnikami (`ingredients`)?
    Rekomendacja: Należy stworzyć tabelę łączącą `recipe_ingredients` z kolumnami: `recipe_id`, `ingredient_id`, `base_quantity` (ilość w bazowym przepisie) oraz `is_scalable` (boolean). To pozwoli na elastyczne definiowanie przepisów.

- wedlug rekomendacji oraz skladniki maja byc tez polaczone z odpowiednim krokiem przepisu, aby nie trzeba bylo wracac na glowna strone przepisu i sprawdzac czego ile uzyc

6.  Jak najlepiej przechowywać instrukcje przygotowania przepisu w tabeli `recipes`? Jako pojedyncze pole tekstowe (TEXT) czy w formacie strukturalnym?
    Rekomendacja: Użycie typu `JSONB` do przechowywania instrukcji jako listy kroków (np. `[{"step": 1, "description": "Pokrój cebulę."}, {"step": 2, "description": "..."}]`) zapewni większą elastyczność dla frontendu i ewentualnych przyszłych funkcji.

- wedlug rekomendacji

7.  Jak reprezentować 7-dniowy plan posiłków dla użytkownika? Czy jedna tabela `user_plans` z jednym wierszem na dzień i kolumnami `breakfast_recipe_id`, `lunch_recipe_id`, `dinner_recipe_id` jest wystarczająca?
    Rekomendacja: Lepszym i bardziej skalowalnym podejściem jest stworzenie tabeli `planned_meals` z kolumnami `id`, `user_id`, `date`, `meal_type` (ENUM: 'breakfast', 'lunch', 'dinner'), `recipe_id`. Taka struktura jest bardziej znormalizowana i ułatwi w przyszłości np. dodanie czwartego posiłku.

- wedlug rekomendacji

8.  W jaki sposób przechowywać informację o tym, że posiłek został "zjedzony" przez użytkownika?
    Rekomendacja: W tabeli `planned_meals` należy dodać kolumnę `is_eaten` typu `BOOLEAN` z domyślną wartością `FALSE`.

- wedlug rekomendacji

9.  Jak obsłużyć modyfikację gramatury składników przez użytkownika (US-015) oraz wymianę posiłku (US-014)? Czy modyfikuje to oryginalny plan, czy tworzy jego kopię?
    Rekomendacja: Wymianę posiłku należy obsłużyć przez aktualizację `recipe_id` w odpowiednim wierszu tabeli `planned_meals`. Modyfikacje gramatury należy przechowywać w dodatkowej kolumnie typu `JSONB` o nazwie `ingredient_overrides` w tabeli `planned_meals`. Przechowywałaby ona listę zmodyfikowanych składników i ich nowych wartości, np. `[{"ingredient_id": "uuid", "new_quantity": 250}]`. Dzięki temu nie modyfikujemy oryginalnych przepisów i zachowujemy informację o zmianach dokonanych przez użytkownika.

- wedlug rekomendacji

10. Czy stan listy zakupów (odznaczone pozycje) ma być utrwalany w bazie danych i synchronizowany między urządzeniami?
    Rekomendacja: Dla MVP, zgodnie z zasadą minimalizmu, stan odznaczonych produktów powinien być zarządzany wyłącznie po stronie klienta (np. w `localStorage`). Upraszcza to schemat bazy danych. Jeśli w przyszłości synchronizacja będzie wymagana, konieczne będzie dodanie nowej tabeli.

- wedlug rekomendacji

11. W jaki sposób powinna być generowana zagregowana lista zakupów?
    Rekomendacja: Zamiast tworzyć i przechowywać listę w osobnej tabeli, należy stworzyć `VIEW` lub funkcję PostgreSQL, która dynamicznie generuje listę na podstawie tabeli `planned_meals` dla danego użytkownika i zakresu dat. Zapobiega to redundancji danych i zapewnia, że lista zawsze odzwierciedla oryginalnie wygenerowany plan.

- wedlug rekomendacji

12. Jakie indeksy powinny zostać utworzone w celu zapewnienia wydajności zapytań, zwłaszcza przy generowaniu planów i list zakupów?
    Rekomendacja: Należy utworzyć indeksy na kluczach obcych (np. `planned_meals.user_id`, `planned_meals.recipe_id`, `recipe_ingredients.recipe_id`). Dodatkowo, kluczowy będzie złożony indeks na tabeli `planned_meals` dla kolumn `(user_id, date)`, aby szybko pobierać plany na konkretne dni.

- wedlug rekomendacji

13. Jakie zasady bezpieczeństwa na poziomie wierszy (RLS) powinny zostać zaimplementowane, aby zapewnić, że użytkownicy mają dostęp tylko do swoich danych?
    Rekomendacja: Należy włączyć RLS na wszystkich tabelach zawierających `user_id` (`profiles`, `planned_meals`, `feedback`). Polityki powinny zezwalać na operacje (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) tylko wtedy, gdy `auth.uid() = user_id`. Tabele z danymi publicznymi (`recipes`, `ingredients`) powinny mieć politykę `SELECT` dla wszystkich zalogowanych użytkowników (`auth.role() = 'authenticated'`).

- wedlug rekomendacji
  </pytania>

  <pytania>

14. Jak dokładnie modelować "podzielność" składników (feedback do pyt. 4)? Czy powinniśmy użyć dwóch flag: jednej w tabeli `ingredients` (`is_divisible` BOOLEAN) określającej ogólną naturę składnika, a drugiej w `recipe_ingredients` (`is_scalable` BOOLEAN), która decyduje, czy w kontekście danego przepisu ilość może być modyfikowana przez algorytm?
    Rekomendacja: Tak, należy zastosować oba atrybuty. Flaga `ingredients.is_divisible` posłuży jako domyślna wartość przy dodawaniu składnika do nowego przepisu, podczas gdy `recipe_ingredients.is_scalable` da ostateczną kontrolę nad zachowaniem algorytmu dla każdego składnika w każdym przepisie, co zapewnia maksymalną elastyczność.

- wedlug rekomendacji

15. W jaki sposób przechowywać informacje o "popularnych jednostkach" i ich wadze (np. "1 jajko = 50g", feedback do pyt. 4)?
    Rekomendacja: Należy stworzyć nową tabelę `ingredient_unit_conversions` z kolumnami `id`, `ingredient_id` (klucz obcy do `ingredients`), `unit_name` (TEXT, np. 'sztuka', 'łyżka', 'szklanka') oraz `grams_equivalent` (NUMERIC). Taka struktura pozwoli na elastyczne definiowanie wielu niestandardowych jednostek dla jednego składnika.

- wedlug rekomendacji

16. Aby powiązać składniki z konkretnymi krokami przepisu (feedback do pyt. 5), jak powinniśmy zmodyfikować schemat?
    Rekomendacja: Należy rozszerzyć tabelę łączącą `recipe_ingredients` o kolumnę `step_number` (INTEGER). Klucz główny tej tabeli powinien być złożony z `(recipe_id, ingredient_id, step_number)`, aby umożliwić użycie tego samego składnika w różnych krokach tego samego przepisu. Struktura instrukcji w `recipes.instructions` (JSONB) pozostaje prostą listą kroków, a frontend połączy te dane w widoku.

- wedlug rekomendacji

17. Jakie dokładnie kolumny powinna zawierać tabela `feedback` do obsługi US-020 (Zgłaszanie problemu/opinii)?
    Rekomendacja: Tabela `feedback` powinna zawierać: `id` (UUID, klucz główny), `user_id` (klucz obcy do `auth.users`), `content` (TEXT), `created_at` (TIMESTAMPTZ with default `now()`) oraz kolumnę `metadata` (JSONB) do przechowywania dodatkowych informacji, takich jak `app_version` i `os_type` wspomnianych w PRD.

- wedlug rekomendacji

18. Czy przepisy (`recipes`) powinny mieć przypisane kategorie (np. 'śniadaniowy', 'obiadowy', 'kolacyjny') lub typy (np. 'danie z kurczakiem', 'danie rybne'), aby algorytm generujący plan mógł zapewnić większą różnorodność posiłków?
    Rekomendacja: Tak, dodanie atrybutów do tabeli `recipes` znacząco ułatwi pracę algorytmu. Proponuje się dodanie kolumny `meal_types` (ARRAY typów ENUM: `'breakfast', 'lunch', 'dinner'`), która określi, do jakich posiłków nadaje się dany przepis. Dodatkowo, kolumna `tags` (ARRAY typów TEXT) pozwoli na elastyczne kategoryzowanie dań (np. `{'chicken', 'quick', 'spicy'}`) w celu unikania powtórzeń i zwiększania różnorodności.

- wedlug rekomendacji
  </pytania>

<pytania>
19. Gdzie i jak powinniśmy przechowywać informację o akceptacji przez użytkownika obowiązkowego disclaimera (US-008)? Czy jest to jednorazowe zdarzenie, które musimy odnotować?
    Rekomendacja: Tak, jest to kluczowe z perspektywy prawnej. W tabeli `profiles` należy dodać kolumnę `disclaimer_accepted_at` typu `TIMESTAMPTZ`. Powinna być ona `NULL`-owalna. Wartość zostanie ustawiona na aktualny czas w momencie akceptacji, co stanowi dowód jej udzielenia i pozwala w przyszłości np. na wymuszenie ponownej akceptacji po zmianie regulaminu.

- wedlug rekomendacji

20. Jakie powinno być zachowanie bazy danych, gdy przepis (`recipe`) zostanie usunięty przez administratora? Co stanie się z planami posiłków użytkowników (`planned_meals`), które zawierają ten przepis?
    Rekomendacja: Domyślna polityka `ON DELETE CASCADE` byłaby destrukcyjna dla danych historycznych użytkownika. Lepszym rozwiązaniem jest ustawienie dla klucza obcego `planned_meals.recipe_id` polityki `ON DELETE SET NULL`. Dzięki temu, nawet po usunięciu przepisu, wpis w planie użytkownika pozostanie, ale będzie wskazywał na brakujący przepis. Aplikacja powinna obsłużyć ten stan, np. prosząc użytkownika o wybranie zamiennika.

- wedlug rekomendacji

21. W jaki sposób zoptymalizować wyszukiwanie przepisów na podstawie tagów (`recipes.tags`), aby algorytm generujący plan działał wydajnie, zwłaszcza przy dużej liczbie przepisów?
    Rekomendacja: Dla kolumny `tags` typu `TEXT[]` w tabeli `recipes` należy utworzyć indeks typu `GIN` (Generalized Inverted Index). Jest on specjalnie zaprojektowany w PostgreSQL do efektywnego przeszukiwania elementów wewnątrz tablic i znacząco przyspieszy zapytania filtrujące przepisy po tagach (np. `WHERE tags @> ARRAY['chicken']`).

- wedlug rekomendacji

22. Jak efektywnie zaimplementować funkcję wymiany posiłku na inny, posortowany według najmniejszej różnicy w kaloryczności (US-014)? Obliczanie kaloryczności każdego przepisu w locie podczas zapytania może być bardzo wolne.
    Rekomendacja: Należy zdenormalizować dane i dodać do tabeli `recipes` kolumnę `total_calories` (oraz opcjonalnie `total_protein`, `total_fat`, `total_carbs`). Wartości w tych kolumnach powinny być automatycznie obliczane i aktualizowane za pomocą triggera PostgreSQL za każdym razem, gdy składnik w tabeli `recipe_ingredients` jest dodawany, modyfikowany lub usuwany. Umożliwi to błyskawiczne sortowanie przepisów po kaloryczności.

- wedlug rekomendacji

23. W jaki sposób będą zarządzane dane "master" takie jak przepisy (`recipes`) i składniki (`ingredients`)? Czy potrzebujemy mechanizmu rozróżniającego, kto może dodawać i modyfikować te dane?
    Rekomendacja: Chociaż PRD nie definiuje interfejsu administratora, schemat powinien go przewidzieć. Należy utworzyć dedykowaną rolę w PostgreSQL (np. `content_manager`) z uprawnieniami `INSERT`, `UPDATE`, `DELETE` do tabel `recipes`, `ingredients` i powiązanych. Zwykli użytkownicy (`authenticated`) powinni mieć do tych tabel tylko uprawnienia `SELECT`. Zapewni to rozdzielenie uprawnień i bezpieczeństwo danych podstawowych.

- wedlug rekomendacji

24. Czy powinniśmy używać różnych schematów PostgreSQL do organizacji tabel?
    Rekomendacja: Tak, dla lepszej organizacji i zarządzania uprawnieniami, warto rozważyć użycie schematów. Proponuje się pozostawienie tabel związanych z użytkownikami (`profiles`, `planned_meals`, `feedback`) w domyślnym schemacie `public`, natomiast tabele z danymi podstawowymi (`recipes`, `ingredients`, `recipe_ingredients`, `ingredient_unit_conversions`) przenieść do nowego schematu, np. `content`. Ułatwi to zarządzanie kopiami zapasowymi i uprawnieniami dla ról.

- wedlug rekomendacji
  </pytania>

<pytania>
25. Jakie powinno być zachowanie bazy danych w przypadku usunięcia konta użytkownika z `auth.users`? Co powinno stać się z powiązanymi danymi w tabelach `profiles`, `planned_meals` i `feedback`?
    Rekomendacja: Należy zastosować politykę `ON DELETE CASCADE` dla wszystkich kluczy obcych (`user_id`) wskazujących na tabelę `auth.users`. Zapewni to, że po usunięciu użytkownika, wszystkie jego dane osobowe i powiązane zostaną automatycznie i kompletnie usunięte z bazy danych, co jest zgodne z dobrymi praktykami i wymogami RODO/GDPR.

- wedlug rekomendacji

26. Jakie dodatkowe ograniczenia unikalności (UNIQUE constraints) powinniśmy zdefiniować, aby zapewnić integralność danych na poziomie bazy?
    Rekomendacja: Należy dodać następujące ograniczenia:
    1.  `UNIQUE` na kolumnie `name` w tabeli `ingredients`, aby uniknąć duplikatów składników.
    2.  `UNIQUE` na kolumnie `name` w tabeli `recipes`, aby każdy przepis miał unikalną nazwę.
    3.  Złożony `UNIQUE` constraint na kolumnach `(user_id, date, meal_type)` w tabeli `planned_meals`, aby zapobiec przypadkowemu przypisaniu dwóch różnych dań do tego samego posiłku tego samego dnia dla jednego użytkownika.

- wedlug rekomendacji

27. Jak z perspektywy bazy danych powinna być zaimplementowana funkcja "Resetowanie planu" (US-019)? Czy usuwamy cały profil użytkownika?
    Rekomendacja: Operacja resetu nie powinna usuwać wiersza w `profiles`, a jedynie przygotować go do ponownego onboardingu. Należy stworzyć funkcję PostgreSQL (np. `reset_user_plan()`), która:
    1.  Usuwa wszystkie rekordy dla danego użytkownika z tabeli `planned_meals` (`DELETE FROM planned_meals WHERE user_id = ...`).
    2.  Aktualizuje wiersz w tabeli `profiles`, ustawiając kolumny związane z onboardingiem (np. `gender`, `weight`, `height`, `activity_level`, `goal`, `target_calories`) na `NULL`.

- wedlug rekomendacji

28. W jaki sposób baza danych może wspierać logikę algorytmu, która zapobiega powtarzaniu się tego samego dania w ciągu 7 dni (US-009)?
    Rekomendacja: Algorytm generujący plan, przed wybraniem przepisów dla danego użytkownika, powinien najpierw wykonać zapytanie pobierające listę identyfikatorów przepisów użytych przez tego użytkownika w ciągu ostatnich 6 dni. Ta lista ID posłuży jako warunek wykluczający (`NOT IN (...)`) w głównym zapytaniu selekcjonującym nowe dania. Indeks na kolumnach `(user_id, date)` w tabeli `planned_meals` zapewni wysoką wydajność tej operacji.

- wedlug rekomendacji

29. W jaki sposób baza danych zostanie wypełniona początkową, wymaganą do działania aplikacji zawartością (przepisy, składniki)?
    Rekomendacja: Należy przygotować początkowe dane w postaci skryptów SQL lub plików CSV i wykorzystać wbudowany w Supabase mechanizm seedingu (`supabase/seed.sql`). Pozwoli to na automatyczne i powtarzalne wypełnianie bazy danymi przy tworzeniu nowych instancji (np. deweloperskich, testowych), co jest kluczowe dla spójności i efektywności procesu deweloperskiego.

- tak bedzie zrobione
  </pytania>

<pytania>
30. Czy powinniśmy dodać dodatkowe ograniczenia (`CHECK` constraints) do kolumn numerycznych, aby zapewnić, że przechowywane wartości są logicznie poprawne (np. zawsze dodatnie)?
    Rekomendacja: Tak, jest to dobra praktyka w celu zwiększenia integralności danych na poziomie bazy. Należy dodać ograniczenia `CHECK (kolumna > 0)` dla pól takich jak `profiles.age`, `profiles.weight`, `profiles.height` oraz `recipe_ingredients.base_quantity`.

- wedlug rekomendacji

31. W specyfikacji "Widok Przepisu" (US-013) mowa jest o zdjęciu dania. W obecnym schemacie brakuje miejsca na przechowywanie tej informacji. Gdzie powinniśmy ją umieścić?
    Rekomendacja: Należy dodać do tabeli `recipes` nową, opcjonalną kolumnę `image_url` typu `TEXT`. Będzie ona przechowywać adres URL do pliku graficznego, który może być hostowany np. w Supabase Storage.

- wedlug rekomendacji, lecz zdjec moze byc wiecej dla kazdego kroku w przepisie

32. Tabela `planned_meals` będzie rosła liniowo z każdym dniem i każdym użytkownikiem. Czy na etapie MVP powinniśmy zaplanować mechanizm archiwizacji lub usuwania starych danych (np. starszych niż rok), aby zarządzać rozmiarem tabeli w przyszłości?
    Rekomendacja: Dla MVP nie jest to wymagane i można odłożyć tę decyzję. Warto jednak mieć świadomość, że w przyszłości, w celu optymalizacji wydajności, można zaimplementować politykę retencji danych, np. za pomocą zadania cyklicznego (`pg_cron`), które usuwałoby historyczne plany posiłków.

- wprowadzmy to juz teraz, archiwalny plan dnia nie musi byc przetrzymywany - od razu moze byc usuwany

33. Jak zapewnić, że funkcja `reset_user_plan()` będzie mogła modyfikować dane użytkownika, skoro tabele `profiles` i `planned_meals` będą chronione przez RLS?
    Rekomendacja: Funkcja `reset_user_plan(user_id_to_reset uuid)` musi być zdefiniowana z opcją `SECURITY DEFINER`. Pozwoli to na jej wykonanie z uprawnieniami twórcy funkcji (zazwyczaj roli `postgres`), co umożliwi modyfikację danych. Wewnątrz funkcji należy bezwzględnie sprawdzić, czy zalogowany użytkownik (`auth.uid()`) ma prawo do wykonania tej operacji, np. poprzez warunek `WHERE user_id = auth.uid()`, aby zapobiec resetowaniu danych przez nieuprawnione osoby.

- wedlug rekomendacji

</pytania>

<pytania>
34. W jaki sposób zmodyfikować schemat, aby obsłużyć możliwość dodania zdjęcia do każdego kroku przepisu (feedback do pyt. 31), a nie tylko jednego ogólnego zdjęcia dla całego dania?
    Rekomendacja: Zamiast tworzyć nową, oddzielną tabelę, należy rozszerzyć strukturę JSONB w kolumnie `recipes.instructions`. Każdy obiekt reprezentujący krok powinien zawierać nowe, opcjonalne pole `image_url`. Przykładowa struktura: `[{"step": 1, "description": "Pokrój cebulę.", "image_url": "url_do_zdjecia_1.jpg"}, {"step": 2, "description": "Podsmaż na patelni.", "image_url": null}]`. Główne, ogólne zdjęcie dania pozostanie w kolumnie `recipes.image_url`. Taki model upraszcza zapytania i utrzymuje wszystkie dane przepisu w jednym miejscu.

- wedlug rekomendacji

35. Jak precyzyjnie zdefiniować regułę automatycznego usuwania starych planów posiłków (feedback do pyt. 32)? Kiedy dokładnie wiersz z tabeli `planned_meals` powinien być uznany za "archiwalny" i usunięty?
    Rekomendacja: Należy zaimplementować codzienne zadanie cykliczne za pomocą rozszerzenia `pg_cron`. Zadanie powinno uruchamiać się raz na dobę (np. o 01:00 UTC) i wykonywać polecenie `DELETE FROM public.planned_meals WHERE date < (current_date - INTERVAL '1 day')`. Taka logika usunie wszystkie plany posiłków starsze niż wczorajszy, zachowując dane z bieżącego i poprzedniego dnia, co stanowi bezpieczny bufor dla użytkowników.

- wedlug rekomendacji

</pytania>
