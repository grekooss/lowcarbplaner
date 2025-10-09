# REST API Plan

## 1. Zasoby

- **Profile**: Reprezentuje profil i cele żywieniowe zalogowanego użytkownika. Odpowiada tabeli `public.profiles`.
- **Planned Meals**: Reprezentuje posiłki w planie żywieniowym użytkownika. Odpowiada tabeli `public.planned_meals`.
- **Recipes**: Reprezentuje przepisy dostępne w aplikacji. Zasób tylko do odczytu dla użytkowników. Odpowiada tabeli `content.recipes`.
- **Shopping List**: Zasób wirtualny, generowany dynamicznie na podstawie planu posiłków użytkownika. Nie ma bezpośredniego odpowiednika w postaci tabeli.
- **Feedback**: Reprezentuje opinie i zgłoszenia od użytkownika. Odpowiada tabeli `public.feedback`.

## 2. Punkty końcowe

### Zasób: Profile

#### `POST /profile`

- **Opis**: Tworzy profil użytkownika po zakończeniu onboardingu. Ta operacja jest wykonywana tylko raz.
- **Ładunek żądania**:
  ```json
  {
    "gender": "female",
    "age": 30,
    "weight_kg": 70.5,
    "height_cm": 165,
    "activity_level": "moderate",
    "goal": "weight_loss",
    "weight_loss_rate_kg_week": 0.5,
    "disclaimer_accepted_at": "2023-10-27T10:00:00Z"
  }
  ```
- **Ładunek odpowiedzi**:
  ```json
  {
    "id": "uuid-of-the-user",
    "email": "user@example.com",
    "gender": "female",
    "age": 30,
    // ... reszta pól z ładunku żądania
    "target_calories": 1800,
    "target_carbs_g": 68,
    "target_protein_g": 158,
    "target_fats_g": 100,
    "created_at": "2023-10-27T10:00:00Z",
    "updated_at": "2023-10-27T10:00:00Z"
  }
  ```
- **Kody sukcesu**: `201 Created`
- **Kody błędów**:
  - `400 Bad Request` (nieprawidłowe dane, obliczone kalorie poniżej minimum: 1400 dla kobiet / 1600 dla mężczyzn)
  - `401 Unauthorized` (użytkownik niezalogowany)
  - `409 Conflict` (profil już istnieje)

---

#### `GET /profile/me`

- **Opis**: Pobiera profil zalogowanego użytkownika.
- **Ładunek odpowiedzi**:
  ```json
  // Taka sama struktura jak w odpowiedzi na POST /profile
  ```
- **Kody sukcesu**: `200 OK`
- **Kody błędów**: `401 Unauthorized`, `404 Not Found` (profil nie istnieje)

---

#### `PATCH /profile/me`

- **Opis**: Aktualizuje część danych profilowych użytkownika (np. wagę, poziom aktywności). Wywołuje przeliczenie celów żywieniowych.
- **Ładunek żądania**:
  ```json
  {
    "weight_kg": 69.0,
    "activity_level": "high"
  }
  ```
- **Ładunek odpowiedzi**:
  ```json
  // Zaktualizowany, pełny obiekt profilu
  ```
- **Kody sukcesu**: `200 OK`
- **Kody błędów**: `400 Bad Request`, `401 Unauthorized`, `404 Not Found`

---

#### `POST /profile/me/generate-plan`

- **Opis**: Uruchamia logikę biznesową do wygenerowania lub uzupełnienia 7-dniowego planu posiłków dla użytkownika na podstawie jego celów.
- **Ładunek odpowiedzi**:
  ```json
  {
    "status": "success",
    "message": "Meal plan generation started successfully.",
    "generated_days": 7
  }
  ```
- **Kody sukcesu**: `200 OK` (operacja synchroniczna) lub `202 Accepted` (operacja asynchroniczna)
- **Kody błędów**: `401 Unauthorized`, `404 Not Found` (profil nie istnieje), `409 Conflict` (plan na te dni już istnieje i jest kompletny), `500 Internal Server Error` (błąd generatora)

### Zasób: Planned Meals

#### `GET /planned-meals`

- **Opis**: Pobiera listę zaplanowanych posiłków dla zalogowanego użytkownika w podanym zakresie dat.
- **Parametry zapytania**:
  - `start_date` (string, format `YYYY-MM-DD`, wymagany): Data początkowa zakresu.
  - `end_date` (string, format `YYYY-MM-DD`, wymagany): Data końcowa zakresu.
- **Ładunek odpowiedzi**:
  ```json
  [
    {
      "id": 1,
      "user_id": "uuid-of-the-user",
      "meal_date": "2023-10-27",
      "meal_type": "breakfast",
      "is_eaten": false,
      "ingredient_overrides": null,
      "recipe": {
        "id": 101,
        "name": "Jajecznica z boczkiem",
        "image_url": "...",
        "total_calories": 450,
        "total_protein_g": 25.5,
        "total_carbs_g": 3.2,
        "total_fats_g": 35.8
      },
      "created_at": "2023-10-27T08:00:00Z",
      "updated_at": "2023-10-27T08:00:00Z"
    },
    {
      "id": 2,
      "user_id": "uuid-of-the-user",
      "meal_date": "2023-10-27",
      "meal_type": "lunch",
      "is_eaten": true,
      "ingredient_overrides": [{ "ingredient_id": 12, "new_amount": 150 }],
      "recipe": {
        "id": 105,
        "name": "Sałatka z kurczakiem",
        "image_url": "...",
        "total_calories": 520,
        "total_protein_g": 42.0,
        "total_carbs_g": 8.5,
        "total_fats_g": 35.0
      },
      "created_at": "2023-10-27T08:00:00Z",
      "updated_at": "2023-10-27T13:00:00Z"
    }
  ]
  ```
- **Kody sukcesu**: `200 OK`
- **Kody błędów**: `400 Bad Request` (brakujące lub nieprawidłowe parametry), `401 Unauthorized`

---

#### `PATCH /planned-meals/{id}`

- **Opis**: Aktualizuje pojedynczy zaplanowany posiłek. Służy do oznaczania posiłku jako zjedzony, zmiany przepisu (wymiana) lub modyfikacji gramatury składników.
- **Ładunek żądania (oznaczenie jako zjedzony)**:
  ```json
  {
    "is_eaten": true
  }
  ```
- **Ładunek żądania (wymiana przepisu)**:
  ```json
  {
    "recipe_id": 105
  }
  ```
- **Ładunek żądania (modyfikacja składników)**:
  ```json
  {
    "ingredient_overrides": [
      { "ingredient_id": 12, "new_amount": 150 },
      { "ingredient_id": 45, "new_amount": 20 }
    ]
  }
  ```
- **Ładunek odpowiedzi**:
  ```json
  {
    "id": 1,
    "user_id": "uuid-of-the-user",
    "meal_date": "2023-10-27",
    "meal_type": "breakfast",
    "is_eaten": true,
    "ingredient_overrides": null,
    "recipe": {
      "id": 101,
      "name": "Jajecznica z boczkiem",
      "image_url": "...",
      "total_calories": 450,
      "total_protein_g": 25.5,
      "total_carbs_g": 3.2,
      "total_fats_g": 35.8
    },
    "created_at": "2023-10-27T08:00:00Z",
    "updated_at": "2023-10-27T09:00:00Z"
  }
  ```
- **Kody sukcesu**: `200 OK`
- **Kody błędów**:
  - `400 Bad Request` (nieprawidłowe dane, nadpisanie składnika nieskalowanego, zmiana poza zakresem +/- 10%, nieprawidłowy recipe_id)
  - `401 Unauthorized` (brak autentykacji)
  - `403 Forbidden` (próba modyfikacji nie swojego posiłku)
  - `404 Not Found` (posiłek nie istnieje)

---

#### `GET /planned-meals/{id}/replacements`

- **Opis**: Pobiera listę sugerowanych przepisów zastępczych dla danego posiłku, posortowaną według najmniejszej różnicy kalorycznej.
- **Ładunek odpowiedzi**:
  ```json
  [
    {
      "id": 105,
      "name": "Sałatka z kurczakiem i awokado",
      "image_url": "...",
      "meal_types": ["breakfast", "lunch"],
      "total_calories": 460,
      "total_protein_g": 28.0,
      "total_carbs_g": 5.0,
      "total_fats_g": 36.0,
      "calorie_diff": 10
    },
    {
      "id": 112,
      "name": "Omlet ze szpinakiem",
      "image_url": "...",
      "meal_types": ["breakfast"],
      "total_calories": 435,
      "total_protein_g": 24.0,
      "total_carbs_g": 4.0,
      "total_fats_g": 34.0,
      "calorie_diff": -15
    }
  ]
  ```
- **Kody sukcesu**: `200 OK`
- **Kody błędów**: `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

### Zasób: Recipes

#### `GET /recipes`

- **Opis**: Pobiera listę wszystkich dostępnych przepisów. Obsługuje paginację i filtrowanie.
- **Parametry zapytania**:
  - `limit` (integer, opcjonalny, domyślnie 20): Liczba wyników na stronę.
  - `offset` (integer, opcjonalny, domyślnie 0): Przesunięcie wyników.
  - `tags` (string, opcjonalny, np. `kurczak,szybkie`): Filtrowanie po tagach (przecinek jako separator).
  - `meal_types` (string, opcjonalny, np. `lunch,dinner`): Filtrowanie po typach posiłków.
- **Ładunek odpowiedzi**:
  ```json
  {
    "count": 150,
    "next": "/recipes?limit=20&offset=20",
    "previous": null,
    "results": [
      {
        "id": 101,
        "name": "Jajecznica z boczkiem",
        "image_url": "...",
        "meal_types": ["breakfast"],
        "tags": ["jajka", "szybkie", "patelnia"],
        "total_calories": 450,
        "total_protein_g": 25.5,
        "total_carbs_g": 3.2,
        "total_fats_g": 35.8
      }
    ]
  }
  ```
- **Kody sukcesu**: `200 OK`
- **Kody błędów**: `401 Unauthorized`

---

#### `GET /recipes/{id}`

- **Opis**: Pobiera szczegółowe informacje o pojedynczym przepisie, w tym listę składników i instrukcje.
- **Ładunek odpowiedzi**:
  ```json
  {
    "id": 101,
    "name": "Jajecznica z boczkiem",
    "image_url": "...",
    "instructions": [
      { "step": 1, "description": "Pokrój boczek w kostkę." },
      { "step": 2, "description": "Podsmaż boczek na patelni." }
    ],
    "meal_types": ["breakfast"],
    "tags": ["jajka", "szybkie", "patelnia"],
    "total_calories": 450,
    // ... total macros
    "ingredients": [
      {
        "category": "eggs",
        "items": [
          {
            "id": 5,
            "name": "Jajko",
            "base_amount": 3,
            "unit": "sztuka",
            "is_scalable": false,
            "calories": 234,
            "protein_g": 21.0,
            "carbs_g": 1.5,
            "fats_g": 15.0
          }
        ]
      },
      {
        "category": "meat",
        "items": [
          {
            "id": 22,
            "name": "Boczek wędzony",
            "base_amount": 50,
            "unit": "g",
            "is_scalable": true,
            "calories": 210
            // ... macros
          }
        ]
      }
    ]
  }
  ```
- **Kody sukcesu**: `200 OK`
- **Kody błędów**: `401 Unauthorized`, `404 Not Found`

### Zasób: Shopping List

#### `GET /shopping-list`

- **Opis**: Generuje zagregowaną listę zakupów na podstawie oryginalnego planu posiłków w podanym zakresie dat.
- **Parametry zapytania**:
  - `start_date` (string, format `YYYY-MM-DD`, wymagany): Data początkowa zakresu.
  - `end_date` (string, format `YYYY-MM-DD`, wymagany): Data końcowa zakresu.
- **Ładunek odpowiedzi**:
  ```json
  [
    {
      "category": "meat",
      "items": [
        { "name": "Pierś z kurczaka", "total_amount": 350, "unit": "g" },
        { "name": "Boczek wędzony", "total_amount": 100, "unit": "g" }
      ]
    },
    {
      "category": "dairy",
      "items": [
        { "name": "Ser Feta", "total_amount": 80, "unit": "g" },
        { "name": "Śmietana 30%", "total_amount": 150, "unit": "ml" }
      ]
    },
    {
      "category": "eggs",
      "items": [{ "name": "Jajko", "total_amount": 6, "unit": "sztuka" }]
    }
  ]
  ```
- **Kody sukcesu**: `200 OK`
- **Kody błędów**: `400 Bad Request`, `401 Unauthorized`

### Zasób: Feedback

#### `POST /feedback`

- **Opis**: Przesyła nową opinię lub zgłoszenie problemu od użytkownika.
- **Ładunek żądania**:
  ```json
  {
    "content": "Aplikacja działa świetnie, ale znalazłem błąd w przepisie na omlet.",
    "metadata": {
      "appVersion": "1.0.1",
      "os": "Android 13"
    }
  }
  ```
- **Ładunek odpowiedzi**:
  ```json
  {
    "id": 1,
    "user_id": "uuid-of-the-user",
    "content": "Aplikacja działa świetnie, ale znalazłem błąd w przepisie na omlet.",
    "metadata": {
      "appVersion": "1.0.1",
      "os": "Android 13"
    },
    "created_at": "2023-10-27T12:00:00Z"
  }
  ```
- **Kody sukcesu**: `201 Created`
- **Kody błędów**: `400 Bad Request`, `401 Unauthorized`

## 3. Uwierzytelnianie i autoryzacja

- **Mechanizm**: Wszystkie punkty końcowe (z wyjątkiem tych związanych z procesem logowania/rejestracji, które obsługuje Supabase) wymagają uwierzytelnienia. Klient musi dołączyć prawidłowy token JWT (otrzymany z Supabase Auth) w nagłówku `Authorization` każdego żądania.
  ```
  Authorization: Bearer <your_supabase_jwt>
  ```
- **Autoryzacja**: Logika autoryzacji jest zaimplementowana bezpośrednio w bazie danych PostgreSQL za pomocą mechanizmu **Row Level Security (RLS)**. Każde zapytanie do tabel w schemacie `public` (np. `profiles`, `planned_meals`) jest automatycznie filtrowane przez bazę danych, aby zapewnić, że użytkownik ma dostęp wyłącznie do własnych danych. API nie implementuje dodatkowej logiki autoryzacji, polegając w pełni na RLS.

## 4. Walidacja i logika biznesowa

- **Walidacja**: Walidacja danych wejściowych jest realizowana na poziomie API (np. przy użyciu biblioteki Zod) przed przekazaniem ich do bazy danych. Reguły walidacji ściśle odzwierciedlają ograniczenia (constraints) zdefiniowane w schemacie bazy danych.
  - **Profile**:
    - `gender`: musi być jednym z `['male', 'female']`
    - `age`: liczba całkowita od 1 do 119
    - `weight_kg`: liczba > 0, format numeric(5,2)
    - `height_cm`: liczba całkowita > 0
    - `activity_level`: musi być jednym z `['sedentary', 'light', 'moderate', 'high', 'very_high']`
    - `goal`: musi być jednym z `['weight_loss', 'weight_maintenance']`
    - `weight_loss_rate_kg_week`: wymagane jeśli goal = 'weight_loss', musi być jednym z `[0.25, 0.5, 0.75]`
    - `disclaimer_accepted_at`: wymagany timestamp
    - **Obliczone cele**: `target_calories` musi być >= 1400 dla kobiet, >= 1600 dla mężczyzn
  - **Planned Meals**:
    - `meal_date`: wymagana, poprawny format daty
    - `meal_type`: musi być jednym z `['breakfast', 'lunch', 'dinner']`
    - `recipe_id`: musi odwoływać się do istniejącego przepisu w `content.recipes`
    - `is_eaten`: musi być boolean
    - `ingredient_overrides`: musi być poprawną strukturą tablicy JSON w formacie:

      ```json
      [
        { "ingredient_id": <integer>, "new_amount": <numeric> }
      ]
      ```

      - Każde `ingredient_id` musi istnieć w składnikach przepisu
      - Każdy składnik musi mieć `is_scalable = true`
      - `new_amount` musi być w zakresie +/- 10% od `base_amount`

  - **Feedback**:
    - `content`: wymagane, długość > 0
    - `metadata`: opcjonalny, musi być poprawnym obiektem JSON jeśli podany

- **Logika Biznesowa**: Złożone operacje wykraczające poza standardowy CRUD są zaimplementowane w dedykowanych punktach końcowych:
  - **Obliczanie celów żywieniowych**: Logika jest zawarta w implementacji `POST /profile` i `PATCH /profile/me`.
    - Endpoint przyjmuje surowe dane (płeć, wiek, waga, wzrost, poziom aktywności, cel)
    - Oblicza PPM według wzoru Mifflin-St Jeor:
      - Mężczyźni: PPM = (10 × waga_kg) + (6.25 × wzrost_cm) - (5 × wiek) + 5
      - Kobiety: PPM = (10 × waga_kg) + (6.25 × wzrost_cm) - (5 × wiek) - 161
    - Oblicza CPM (całkowite zapotrzebowanie kaloryczne): PPM × mnożnik aktywności
      - sedentary: 1.2
      - light: 1.375
      - moderate: 1.55
      - high: 1.725
      - very_high: 1.9
    - Jeśli cel = 'weight_loss', odejmuje deficyt kaloryczny: CPM - (tempo_kg_tydzień × 7700 / 7)
    - Oblicza rozkład makroskładników z target_calories:
      - Węglowodany: 15% kalorii → gramy = (kalorie × 0.15) / 4
      - Białko: 35% kalorii → gramy = (kalorie × 0.35) / 4
      - Tłuszcze: 50% kalorii → gramy = (kalorie × 0.50) / 9
    - Waliduje próg minimalny: >= 1400 kcal (kobiety), >= 1600 kcal (mężczyźni)
    - Zapisuje w bazie zarówno dane wejściowe, jak i obliczone cele

  - **Generowanie Planu Posiłków**: Logika jest hermetyzowana w `POST /profile/me/generate-plan`.
    - Pobiera cele żywieniowe użytkownika z tabeli `profiles`
    - Dla każdego z 7 dni:
      - Dla każdego typu posiłku (breakfast, lunch, dinner):
        - Zapytanie do `content.recipes` WHERE meal_type zawiera odpowiedni typ
        - Filtrowanie według dostępności i kryteriów różnorodności
        - Wybór przepisu, który przybliża dzienny suma_kalorii do target_calories
        - Zapewnienie, że suma dzienna mieści się w zakresie target +/- 5%
      - Tworzenie wpisów w tabeli `planned_meals`
    - Zwrócenie statusu sukcesu z liczbą wygenerowanych dni

  - **Generowanie Listy Zakupów**: Logika jest zaimplementowana w `GET /shopping-list`.
    - Zapytanie wszystkich planned_meals użytkownika w zakresie dat
    - Dla każdego zaplanowanego posiłku:
      - JOIN z content.recipe_ingredients
      - JOIN z content.ingredients
      - Użycie base_amount (ignorowanie ingredient_overrides)
    - Agregacja składników według ingredient_id: SUM(base_amount) per składnik
    - Grupowanie wyników według ingredient.category
    - Zwrócenie zagnieżdżonej struktury: kategorie → elementy

  - **Wyszukiwanie Zamienników**: Logika jest zawarta w `GET /planned-meals/{id}/replacements`.
    - Pobieranie oryginalnego planned_meal i jego recipe
    - Obliczanie oryginalnej total_calories
    - Zapytanie do `content.recipes` WHERE:
      - meal_types zawiera oryginalny meal_type
      - total_calories mieści się w zakresie +/- 15% oryginału
      - recipe_id != oryginalne recipe_id
    - Sortowanie po ABS(total_calories - original_calories) ASC
    - Zwrócenie top 10 wyników z obliczonym calorie_diff
