-- ============================================================
-- Migration: Add Recipe Servings Support
-- Description: Dodaje pola do obslugi porcji w przepisach
--              Umozliwia batch cooking i dzielenie przepisow
-- ============================================================
-- Uzasadnienie biznesowe:
--   - Przepisy jak chleb keto daja 10 kromek, nie 1 porcje
--   - Niektore dania lepiej przygotowac w wiekszej ilosci (batch cooking)
--   - System moze przypisac np. 3 kromki chleba zamiast calego przepisu
--   - Meal prep optimizer moze sugerowac przygotowanie 2 porcji na obiad i kolacje
-- ============================================================

-- ============================================================
-- 1. Nowe kolumny w tabeli recipes
-- ============================================================

-- Ile porcji wychodzi z przepisu bazowego (wartosci makro sa dla CALEGO przepisu)
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS base_servings INTEGER NOT NULL DEFAULT 1;

-- Opis jednostki porcji w jezyku polskim (dla UI)
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS serving_unit VARCHAR(50) DEFAULT 'porcja';

-- Czy przepis nadaje sie do przygotowania w wiekszej ilosci (batch cooking)
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS is_batch_friendly BOOLEAN NOT NULL DEFAULT false;

-- Sugerowana ilosc porcji do przygotowania na raz
-- NULL = uzyj base_servings, wartosc = sugerowany batch size
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS suggested_batch_size INTEGER;

-- Minimalna liczba porcji (niektore przepisy nie dzieła sie dobrze)
-- np. chleb - nie upieczesz 1 kromki, minimum to caly bochenek
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS min_servings INTEGER NOT NULL DEFAULT 1;

-- ============================================================
-- 2. Walidacja i constrainty
-- ============================================================

-- base_servings musi byc >= 1
ALTER TABLE public.recipes
ADD CONSTRAINT chk_recipes_base_servings_positive
CHECK (base_servings >= 1);

-- min_servings musi byc >= 1 i <= base_servings
ALTER TABLE public.recipes
ADD CONSTRAINT chk_recipes_min_servings_valid
CHECK (min_servings >= 1 AND min_servings <= base_servings);

-- suggested_batch_size jesli podany, musi byc >= base_servings
ALTER TABLE public.recipes
ADD CONSTRAINT chk_recipes_batch_size_valid
CHECK (suggested_batch_size IS NULL OR suggested_batch_size >= base_servings);

-- ============================================================
-- 3. Komentarze dokumentacyjne
-- ============================================================

COMMENT ON COLUMN public.recipes.base_servings IS
  'Liczba porcji z przepisu bazowego. Wartosci makro (total_calories itp.) dotycza CALEGO przepisu, czyli wszystkich porcji. Dla chleba keto = 10 (kromek), dla zupy = 4 (porcje).';

COMMENT ON COLUMN public.recipes.serving_unit IS
  'Jednostka porcji w jezyku polskim do wyswietlenia w UI. Przyklady: porcja, kromka, szklanka, kawałek, sztuka.';

COMMENT ON COLUMN public.recipes.is_batch_friendly IS
  'Czy przepis nadaje sie do przygotowania w wiekszej ilosci (batch cooking). True dla zup, gulaszow, chlebow. False dla jajecznicy, salatki.';

COMMENT ON COLUMN public.recipes.suggested_batch_size IS
  'Sugerowana ilosc porcji do przygotowania na raz dla batch cooking. NULL oznacza uzycie base_servings. Dla kurczaka curry = 2 (obiad + kolacja).';

COMMENT ON COLUMN public.recipes.min_servings IS
  'Minimalna liczba porcji do przygotowania. Dla chleba = base_servings (caly bochenek), dla omleta = 1.';

-- ============================================================
-- 4. Funkcja pomocnicza: oblicz makro na porcje
-- ============================================================
-- Zwraca wartosci odzywiwe dla zadanej liczby porcji

CREATE OR REPLACE FUNCTION get_recipe_nutrition_per_servings(
  p_recipe_id INTEGER,
  p_servings INTEGER DEFAULT 1
)
RETURNS TABLE(
  servings INTEGER,
  calories_per_serving NUMERIC,
  protein_per_serving NUMERIC,
  carbs_per_serving NUMERIC,
  net_carbs_per_serving NUMERIC,
  fats_per_serving NUMERIC,
  fiber_per_serving NUMERIC,
  total_calories NUMERIC,
  total_protein NUMERIC,
  total_carbs NUMERIC,
  total_net_carbs NUMERIC,
  total_fats NUMERIC,
  total_fiber NUMERIC
) AS $$
DECLARE
  v_base_servings INTEGER;
  v_ratio NUMERIC;
BEGIN
  -- Pobierz base_servings
  SELECT r.base_servings INTO v_base_servings
  FROM public.recipes r
  WHERE r.id = p_recipe_id;

  IF v_base_servings IS NULL THEN
    RAISE EXCEPTION 'Recipe with id % not found', p_recipe_id;
  END IF;

  -- Oblicz ratio (ile porcji chcemy / ile daje przepis bazowy)
  v_ratio := p_servings::NUMERIC / v_base_servings;

  RETURN QUERY
  SELECT
    p_servings,
    -- Per serving (dla 1 porcji z zadanych)
    ROUND((r.total_calories::NUMERIC / v_base_servings), 0),
    ROUND((r.total_protein_g / v_base_servings), 1),
    ROUND((r.total_carbs_g / v_base_servings), 1),
    ROUND((r.total_net_carbs_g / v_base_servings), 1),
    ROUND((r.total_fats_g / v_base_servings), 1),
    ROUND((r.total_fiber_g / v_base_servings), 1),
    -- Total (dla wszystkich zadanych porcji)
    ROUND((r.total_calories * v_ratio), 0),
    ROUND((r.total_protein_g * v_ratio), 1),
    ROUND((r.total_carbs_g * v_ratio), 1),
    ROUND((r.total_net_carbs_g * v_ratio), 1),
    ROUND((r.total_fats_g * v_ratio), 1),
    ROUND((r.total_fiber_g * v_ratio), 1)
  FROM public.recipes r
  WHERE r.id = p_recipe_id;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_recipe_nutrition_per_servings(INTEGER, INTEGER) IS
  'Oblicza wartosci odzywcze dla zadanej liczby porcji przepisu. Zwraca zarowno wartosci per serving jak i total.';

-- ============================================================
-- 5. Funkcja pomocnicza: skaluj skladniki na porcje
-- ============================================================

CREATE OR REPLACE FUNCTION get_scaled_ingredients(
  p_recipe_id INTEGER,
  p_servings INTEGER DEFAULT 1
)
RETURNS TABLE(
  ingredient_id INTEGER,
  ingredient_name TEXT,
  base_amount NUMERIC,
  scaled_amount NUMERIC,
  unit TEXT,
  is_scalable BOOLEAN
) AS $$
DECLARE
  v_base_servings INTEGER;
  v_ratio NUMERIC;
BEGIN
  -- Pobierz base_servings
  SELECT r.base_servings INTO v_base_servings
  FROM public.recipes r
  WHERE r.id = p_recipe_id;

  IF v_base_servings IS NULL THEN
    RAISE EXCEPTION 'Recipe with id % not found', p_recipe_id;
  END IF;

  v_ratio := p_servings::NUMERIC / v_base_servings;

  RETURN QUERY
  SELECT
    ri.ingredient_id,
    i.name,
    ri.base_amount,
    CASE
      WHEN ri.is_scalable THEN ROUND(ri.base_amount * v_ratio, 1)
      ELSE ri.base_amount  -- Nie skaluj skladnikow oznaczonych jako nie-skalowalne
    END,
    ri.unit,
    ri.is_scalable
  FROM public.recipe_ingredients ri
  JOIN public.ingredients i ON i.id = ri.ingredient_id
  WHERE ri.recipe_id = p_recipe_id
  ORDER BY ri.step_number NULLS LAST, i.name;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_scaled_ingredients(INTEGER, INTEGER) IS
  'Zwraca liste skladnikow przeskalowanych do zadanej liczby porcji. Respektuje flage is_scalable.';

-- ============================================================
-- 6. Indeks na is_batch_friendly (dla meal prep optimizer)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_recipes_batch_friendly
ON public.recipes (is_batch_friendly)
WHERE is_batch_friendly = true;

COMMENT ON INDEX idx_recipes_batch_friendly IS
  'Partial index dla szybkiego wyszukiwania przepisow nadajacych sie do batch cooking.';

-- ============================================================
-- 7. Aktualizacja istniejacych przepisow - wartosci domyslne
-- ============================================================
-- Wszystkie istniejace przepisy maja base_servings = 1 (domyslnie)
-- Pozniej zaktualizujemy konkretne przepisy w osobnym skrypcie seed

-- Ustawienie is_batch_friendly na podstawie tagow i kategorii
-- Zupy, gulaszes, pieczywa - sa batch friendly
UPDATE public.recipes
SET is_batch_friendly = true
WHERE
  slug LIKE '%zupa%'
  OR slug LIKE '%gulasz%'
  OR slug LIKE '%chleb%'
  OR slug LIKE '%pieczywo%'
  OR tags && ARRAY['zupa', 'gulasz', 'pieczywo', 'do-zamrozenia']::TEXT[];

-- ============================================================
-- 8. View pomocniczy: przepisy z informacja o porcjach
-- ============================================================

CREATE OR REPLACE VIEW public.recipes_with_servings AS
SELECT
  r.*,
  -- Kalorie na 1 porcje
  ROUND(r.total_calories::NUMERIC / r.base_servings, 0) AS calories_per_serving,
  -- Bialko na 1 porcje
  ROUND(r.total_protein_g / r.base_servings, 1) AS protein_per_serving,
  -- Weglowodany na 1 porcje
  ROUND(r.total_carbs_g / r.base_servings, 1) AS carbs_per_serving,
  -- Net carbs na 1 porcje
  ROUND(r.total_net_carbs_g / r.base_servings, 1) AS net_carbs_per_serving,
  -- Tluszcze na 1 porcje
  ROUND(r.total_fats_g / r.base_servings, 1) AS fats_per_serving,
  -- Opis porcji dla UI (np. "10 kromek", "2 porcje")
  CONCAT(r.base_servings, ' ',
    CASE
      WHEN r.base_servings = 1 THEN r.serving_unit
      ELSE CONCAT(r.serving_unit,
        CASE
          WHEN r.serving_unit IN ('porcja', 'kromka', 'szklanka') THEN
            CASE
              WHEN r.base_servings BETWEEN 2 AND 4 THEN
                REPLACE(REPLACE(REPLACE(r.serving_unit, 'porcja', 'porcje'), 'kromka', 'kromki'), 'szklanka', 'szklanki')
              ELSE
                REPLACE(REPLACE(REPLACE(r.serving_unit, 'porcja', 'porcji'), 'kromka', 'kromek'), 'szklanka', 'szklanek')
            END
          ELSE ''
        END
      )
    END
  ) AS servings_display
FROM public.recipes r;

COMMENT ON VIEW public.recipes_with_servings IS
  'Widok przepisow z przeliczonymi wartosciami na porcje i sformatowanym opisem porcji.';

-- ============================================================
-- 9. Przyklad uzycia (komentarz)
-- ============================================================
--
-- Przyklad 1: Pobierz makro dla 3 kromek chleba keto
-- SELECT * FROM get_recipe_nutrition_per_servings(
--   (SELECT id FROM recipes WHERE slug = 'chleb-keto'),
--   3
-- );
--
-- Przyklad 2: Pobierz przeskalowane skladniki na 2 porcje
-- SELECT * FROM get_scaled_ingredients(
--   (SELECT id FROM recipes WHERE slug = 'kurczak-curry'),
--   2
-- );
--
-- Przyklad 3: Znajdz przepisy nadajace sie do batch cooking
-- SELECT name, base_servings, serving_unit, suggested_batch_size
-- FROM recipes
-- WHERE is_batch_friendly = true;
--
-- Przyklad 4: Uzyj view do wyswietlenia przepisow z kaloriami na porcje
-- SELECT name, calories_per_serving, servings_display
-- FROM recipes_with_servings
-- ORDER BY calories_per_serving;
