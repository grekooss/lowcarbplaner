-- =====================================================================
-- Seed Data for LowCarbPlaner - INGREDIENTS WITH FIBER
-- Description: Complete ingredients data including fiber_per_100_units
--              for Net Carbs calculation (keto/low-carb diets)
-- =====================================================================
-- IMPORTANT: This replaces seed_ingredients_public.sql
-- Net Carbs = Total Carbs - Fiber (essential for keto tracking)
-- =====================================================================
-- Valid categories (ENUM): vegetables, fruits, meat, fish, dairy, eggs,
--                          nuts_seeds, oils_fats, spices_herbs, flours,
--                          beverages, sweeteners, condiments, other
-- =====================================================================

-- Clear existing data (optional - uncomment if needed)
-- TRUNCATE public.ingredient_unit_conversions CASCADE;
-- TRUNCATE public.ingredients CASCADE;

-- =====================================================================
-- SECTION 1: SEED INGREDIENTS (public.ingredients)
-- =====================================================================

INSERT INTO public.ingredients (id, name, category, unit, calories_per_100_units, carbs_per_100_units, protein_per_100_units, fats_per_100_units, fiber_per_100_units, is_divisible, image_url)
VALUES
  -- ===============================
  -- JAJA (EGGS) - no fiber
  -- ===============================
  (866, 'Jajko kurze (całe)', 'eggs', 'g', 155.00, 1.10, 13.00, 11.00, 0.00, false, null),
  (867, 'Jajko kurze (białko)', 'eggs', 'g', 52.00, 0.70, 11.00, 0.20, 0.00, true, null),
  (868, 'Jajko kurze (żółtko)', 'eggs', 'g', 322.00, 3.60, 15.90, 26.50, 0.00, true, null),

  -- ===============================
  -- NABIAŁ (DAIRY) - no fiber
  -- ===============================
  (869, 'Ser feta', 'dairy', 'g', 264.00, 4.10, 14.20, 21.30, 0.00, true, null),
  (870, 'Ser mozzarella', 'dairy', 'g', 280.00, 2.20, 22.20, 22.40, 0.00, true, null),
  (871, 'Ser parmezan', 'dairy', 'g', 431.00, 4.10, 38.50, 28.60, 0.00, true, null),
  (872, 'Ser cheddar', 'dairy', 'g', 403.00, 1.30, 24.90, 33.10, 0.00, true, null),
  (873, 'Ser gouda', 'dairy', 'g', 356.00, 2.20, 24.90, 27.40, 0.00, true, null),
  (874, 'Ser camembert', 'dairy', 'g', 300.00, 0.50, 19.80, 24.30, 0.00, true, null),
  (875, 'Ser pecorino', 'dairy', 'g', 387.00, 3.60, 25.80, 29.40, 0.00, true, null),
  (876, 'Twaróg półtłusty', 'dairy', 'g', 98.00, 3.50, 17.00, 2.00, 0.00, true, null),
  (877, 'Twaróg chudy', 'dairy', 'g', 72.00, 3.40, 13.50, 0.50, 0.00, true, null),
  (878, 'Twaróg tłusty', 'dairy', 'g', 154.00, 2.70, 15.50, 9.00, 0.00, true, null),
  (879, 'Ser ricotta', 'dairy', 'g', 174.00, 3.00, 11.30, 13.00, 0.00, true, null),
  (880, 'Serek wiejski', 'dairy', 'g', 98.00, 3.40, 11.10, 4.30, 0.00, true, null),
  (881, 'Masło', 'dairy', 'g', 717.00, 0.10, 0.90, 81.10, 0.00, true, null),
  (882, 'Śmietana 18%', 'dairy', 'ml', 195.00, 3.30, 2.70, 18.00, 0.00, true, null),
  (883, 'Śmietana 30%', 'dairy', 'ml', 292.00, 3.10, 2.20, 30.00, 0.00, true, null),
  (884, 'Jogurt grecki naturalny (pełnotłusty)', 'dairy', 'g', 97.00, 3.60, 9.00, 5.00, 0.00, true, null),
  (885, 'Jogurt grecki naturalny (2% tłuszczu)', 'dairy', 'g', 73.00, 3.80, 10.00, 1.90, 0.00, true, null),
  (886, 'Kefir naturalny', 'dairy', 'ml', 41.00, 4.50, 2.90, 1.00, 0.00, true, null),

  -- ===============================
  -- MIĘSO (MEAT) - no fiber
  -- ===============================
  (887, 'Kurczak - pierś (bez skóry)', 'meat', 'g', 165.00, 0.00, 31.00, 3.60, 0.00, true, null),
  (888, 'Kurczak - udko (ze skórą)', 'meat', 'g', 211.00, 0.00, 26.00, 11.00, 0.00, true, null),
  (889, 'Kurczak - skrzydełka (ze skórą)', 'meat', 'g', 290.00, 0.00, 27.00, 19.50, 0.00, true, null),
  (890, 'Indyk - pierś (bez skóry)', 'meat', 'g', 135.00, 0.00, 30.00, 1.00, 0.00, true, null),
  (891, 'Indyk - udko (bez skóry)', 'meat', 'g', 144.00, 0.00, 28.60, 2.10, 0.00, true, null),
  (892, 'Kaczka - pierś (bez skóry)', 'meat', 'g', 123.00, 0.00, 23.50, 2.50, 0.00, true, null),
  (893, 'Wołowina - wołowe mielone 10% tłuszczu', 'meat', 'g', 176.00, 0.00, 20.00, 10.00, 0.00, true, null),
  (894, 'Wołowina - antrykot (stek)', 'meat', 'g', 271.00, 0.00, 25.40, 18.40, 0.00, true, null),
  (895, 'Wołowina - polędwica (tenderloin)', 'meat', 'g', 158.00, 0.00, 26.90, 5.00, 0.00, true, null),
  (896, 'Wołowina - rostbef', 'meat', 'g', 134.00, 0.00, 26.60, 2.60, 0.00, true, null),
  (897, 'Wieprzowina - schab', 'meat', 'g', 242.00, 0.00, 21.50, 17.00, 0.00, true, null),
  (898, 'Wieprzowina - karkówka', 'meat', 'g', 263.00, 0.00, 18.40, 20.50, 0.00, true, null),
  (899, 'Wieprzowina - boczek surowy', 'meat', 'g', 393.00, 1.40, 11.60, 38.00, 0.00, true, null),
  (900, 'Baranina - comber', 'meat', 'g', 294.00, 0.00, 16.50, 25.00, 0.00, true, null),
  (901, 'Baranina - udziec', 'meat', 'g', 240.00, 0.00, 20.00, 17.50, 0.00, true, null),
  (902, 'Szynka z indyka (bez dodatków)', 'meat', 'g', 104.00, 1.00, 17.50, 3.50, 0.00, true, null),
  (903, 'Szynka wieprzowa (bez dodatków)', 'meat', 'g', 145.00, 1.50, 21.00, 6.50, 0.00, true, null),
  (904, 'Kabanos', 'meat', 'g', 434.00, 1.90, 21.80, 37.90, 0.00, true, null),

  -- ===============================
  -- RYBY I OWOCE MORZA (FISH) - no fiber
  -- ===============================
  (905, 'Łosoś (świeży)', 'fish', 'g', 208.00, 0.00, 20.00, 13.40, 0.00, true, null),
  (906, 'Łosoś wędzony', 'fish', 'g', 117.00, 0.00, 18.30, 4.50, 0.00, true, null),
  (907, 'Makrela (świeża)', 'fish', 'g', 205.00, 0.00, 18.60, 13.90, 0.00, true, null),
  (908, 'Makrela wędzona', 'fish', 'g', 220.00, 0.00, 23.80, 13.00, 0.00, true, null),
  (909, 'Sardynki (w oleju)', 'fish', 'g', 208.00, 0.00, 24.60, 11.50, 0.00, true, null),
  (910, 'Śledź (marynowany)', 'fish', 'g', 262.00, 9.60, 14.20, 18.00, 0.00, true, null),
  (911, 'Pstrąg tęczowy', 'fish', 'g', 119.00, 0.00, 20.50, 3.50, 0.00, true, null),
  (912, 'Tuńczyk w sosie własnym', 'fish', 'g', 116.00, 0.00, 26.00, 0.80, 0.00, true, null),
  (913, 'Dorsz', 'fish', 'g', 82.00, 0.00, 17.80, 0.70, 0.00, true, null),
  (914, 'Tilapia', 'fish', 'g', 96.00, 0.00, 20.10, 1.70, 0.00, true, null),
  (915, 'Halibut', 'fish', 'g', 91.00, 0.00, 18.60, 1.30, 0.00, true, null),
  (916, 'Morszczuk', 'fish', 'g', 90.00, 0.00, 18.40, 1.30, 0.00, true, null),
  (917, 'Krewetki', 'fish', 'g', 99.00, 0.90, 20.90, 1.00, 0.00, true, null),
  (918, 'Kalmar', 'fish', 'g', 92.00, 3.10, 15.60, 1.40, 0.00, true, null),
  (919, 'Ośmiornica', 'fish', 'g', 82.00, 2.20, 14.90, 1.00, 0.00, true, null),
  (920, 'Małże', 'fish', 'g', 86.00, 3.70, 11.90, 2.20, 0.00, true, null),
  (921, 'Homary', 'fish', 'g', 89.00, 0.00, 19.00, 0.90, 0.00, true, null),

  -- ===============================
  -- WARZYWA (VEGETABLES) - HIGH FIBER - critical for net carbs!
  -- ===============================
  (922, 'Brokuły', 'vegetables', 'g', 34.00, 7.00, 2.80, 0.40, 2.60, true, null),
  (923, 'Kalafior', 'vegetables', 'g', 25.00, 5.00, 1.90, 0.30, 2.00, true, null),
  (924, 'Kapusta biała', 'vegetables', 'g', 25.00, 5.80, 1.30, 0.10, 2.50, true, null),
  (925, 'Kapusta czerwona', 'vegetables', 'g', 31.00, 7.40, 1.40, 0.20, 2.10, true, null),
  (926, 'Kapusta włoska (czarna)', 'vegetables', 'g', 25.00, 4.40, 1.30, 0.10, 2.00, true, null),
  (927, 'Brukselka', 'vegetables', 'g', 43.00, 9.00, 3.40, 0.30, 3.80, true, null),
  (928, 'Jarmuż (kale)', 'vegetables', 'g', 49.00, 8.80, 4.30, 0.90, 3.60, true, null),
  (929, 'Bok choy (kapusta chińska)', 'vegetables', 'g', 13.00, 2.20, 1.50, 0.20, 1.00, true, null),
  (930, 'Szpinak (świeży)', 'vegetables', 'g', 23.00, 3.60, 2.90, 0.40, 2.20, true, null),
  (931, 'Sałata masłowa', 'vegetables', 'g', 13.00, 2.20, 1.40, 0.20, 1.10, true, null),
  (932, 'Sałata rzymska', 'vegetables', 'g', 17.00, 3.30, 1.20, 0.30, 2.10, true, null),
  (933, 'Sałata lodowa (góra lodowa)', 'vegetables', 'g', 14.00, 3.00, 0.90, 0.10, 1.20, true, null),
  (934, 'Rukola', 'vegetables', 'g', 25.00, 3.70, 2.60, 0.70, 1.60, true, null),
  (935, 'Endywia', 'vegetables', 'g', 17.00, 3.40, 1.30, 0.20, 3.10, true, null),
  (936, 'Pak choi', 'vegetables', 'g', 13.00, 2.20, 1.50, 0.20, 1.00, true, null),
  (937, 'Pomidor', 'vegetables', 'g', 18.00, 3.90, 0.90, 0.20, 1.20, true, null),
  (938, 'Pomidory koktajlowe', 'vegetables', 'g', 18.00, 3.90, 0.90, 0.20, 1.20, true, null),
  (939, 'Pomidory suszone (w oleju)', 'vegetables', 'g', 213.00, 14.10, 4.30, 15.50, 12.30, true, null),
  (940, 'Papryka czerwona', 'vegetables', 'g', 31.00, 6.00, 1.00, 0.30, 2.10, true, null),
  (941, 'Papryka zielona', 'vegetables', 'g', 20.00, 4.60, 0.90, 0.20, 1.70, true, null),
  (942, 'Papryka żółta', 'vegetables', 'g', 27.00, 6.30, 1.00, 0.20, 0.90, true, null),
  (943, 'Cukinia', 'vegetables', 'g', 17.00, 3.10, 1.20, 0.30, 1.00, true, null),
  (944, 'Bakłażan', 'vegetables', 'g', 25.00, 5.90, 1.00, 0.20, 3.00, true, null),
  (945, 'Ogórek', 'vegetables', 'g', 15.00, 3.60, 0.70, 0.10, 0.50, true, null),
  -- AWOKADO: 8.5g carbs - 6.7g fiber = 1.8g NET CARBS! Super keto-friendly!
  (946, 'Awokado', 'vegetables', 'g', 160.00, 8.50, 2.00, 14.70, 6.70, true, null),
  (947, 'Rzodkiewka', 'vegetables', 'g', 16.00, 3.40, 0.70, 0.10, 1.60, true, null),
  (948, 'Rzodkiew biała (daikon)', 'vegetables', 'g', 18.00, 4.10, 0.60, 0.10, 1.60, true, null),
  (949, 'Seler naciowy', 'vegetables', 'g', 16.00, 3.00, 0.70, 0.20, 1.60, true, null),
  (950, 'Rzepa', 'vegetables', 'g', 28.00, 6.40, 0.90, 0.10, 1.80, true, null),
  (951, 'Pieczarki', 'vegetables', 'g', 22.00, 3.30, 3.10, 0.30, 1.00, true, null),
  (952, 'Pieczarki portobello', 'vegetables', 'g', 22.00, 3.90, 2.10, 0.40, 1.30, true, null),
  (953, 'Borowiki suszone', 'vegetables', 'g', 231.00, 48.80, 20.10, 3.50, 17.00, true, null),
  (954, 'Pieczarki shitake', 'vegetables', 'g', 34.00, 6.80, 2.20, 0.50, 2.50, true, null),
  (955, 'Szparagi', 'vegetables', 'g', 20.00, 3.90, 2.20, 0.10, 2.10, true, null),
  (956, 'Fasolka szparagowa', 'vegetables', 'g', 31.00, 7.00, 1.80, 0.10, 2.70, true, null),
  (957, 'Dynia piżmowa (butternut)', 'vegetables', 'g', 45.00, 11.70, 1.00, 0.10, 2.00, true, null),
  (958, 'Kabaczek patison', 'vegetables', 'g', 19.00, 4.30, 1.20, 0.20, 1.20, true, null),

  -- ===============================
  -- OWOCE (FRUITS) - significant fiber
  -- ===============================
  (959, 'Truskawki', 'fruits', 'g', 32.00, 7.70, 0.70, 0.30, 2.00, true, null),
  -- MALINY: 12g carbs - 6.5g fiber = 5.5g NET CARBS! Great for keto
  (960, 'Maliny', 'fruits', 'g', 52.00, 12.00, 1.20, 0.70, 6.50, true, null),
  (961, 'Borówki', 'fruits', 'g', 57.00, 14.50, 0.70, 0.30, 2.40, true, null),
  (962, 'Jagody', 'fruits', 'g', 64.00, 14.10, 1.00, 0.50, 2.40, true, null),
  (963, 'Jeżyny', 'fruits', 'g', 43.00, 9.60, 1.40, 0.50, 5.30, true, null),
  (964, 'Cytryna (sok)', 'fruits', 'ml', 22.00, 6.90, 0.40, 0.20, 0.30, true, null),
  (965, 'Limonka (sok)', 'fruits', 'ml', 25.00, 8.40, 0.40, 0.10, 0.40, true, null)

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  unit = EXCLUDED.unit,
  calories_per_100_units = EXCLUDED.calories_per_100_units,
  carbs_per_100_units = EXCLUDED.carbs_per_100_units,
  protein_per_100_units = EXCLUDED.protein_per_100_units,
  fats_per_100_units = EXCLUDED.fats_per_100_units,
  fiber_per_100_units = EXCLUDED.fiber_per_100_units,
  is_divisible = EXCLUDED.is_divisible,
  image_url = EXCLUDED.image_url;

-- =====================================================================
-- SECTION 2: UNIT CONVERSIONS (public.ingredient_unit_conversions)
-- =====================================================================

INSERT INTO public.ingredient_unit_conversions (ingredient_id, unit_name, grams_equivalent)
VALUES
  -- Jajka
  (866, 'średnie', 55.00),
  (866, 'duże', 65.00),
  (866, 'małe', 45.00),
  (867, 'białko z 1 jajka', 33.00),
  (868, 'żółtko z 1 jajka', 17.00),

  -- Awokado (edible portion only - bez pestki i skórki)
  (946, 'małe', 100.00),
  (946, 'średnie', 140.00),
  (946, 'duże', 210.00),
  (946, 'połówka', 70.00),

  -- Pomidory
  (937, 'średni', 150.00),
  (937, 'duży', 200.00),
  (937, 'mały', 100.00),

  -- Ogórki
  (945, 'średni', 200.00),
  (945, 'duży', 300.00),
  (945, 'mały', 120.00),

  -- Papryka
  (940, 'średnia', 150.00),
  (940, 'duża', 200.00),
  (941, 'średnia', 150.00),
  (942, 'średnia', 150.00),

  -- Cukinia
  (943, 'średnia', 250.00),
  (943, 'duża', 350.00),
  (943, 'mała', 150.00),

  -- Pieczarki
  (951, 'sztuka', 15.00),
  (952, 'sztuka', 80.00),

  -- Brokuły
  (922, 'różyczka mała', 15.00),
  (922, 'różyczka średnia', 25.00),
  (922, 'główka mała', 300.00),
  (922, 'główka średnia', 500.00),

  -- Kalafior
  (923, 'różyczka mała', 15.00),
  (923, 'różyczka średnia', 30.00),
  (923, 'główka mała', 400.00),
  (923, 'główka średnia', 600.00)

ON CONFLICT (ingredient_id, unit_name) DO UPDATE SET
  grams_equivalent = EXCLUDED.grams_equivalent;

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================
-- Check high-fiber ingredients with net carbs:
-- SELECT name, carbs_per_100_units as total_carbs, fiber_per_100_units as fiber,
--        (carbs_per_100_units - fiber_per_100_units) as net_carbs
-- FROM public.ingredients
-- WHERE fiber_per_100_units > 0
-- ORDER BY fiber_per_100_units DESC;
--
-- Best keto vegetables (lowest net carbs):
-- SELECT name, carbs_per_100_units as total_carbs, fiber_per_100_units as fiber,
--        (carbs_per_100_units - fiber_per_100_units) as net_carbs
-- FROM public.ingredients
-- WHERE category = 'vegetables'
-- ORDER BY (carbs_per_100_units - fiber_per_100_units) ASC;
