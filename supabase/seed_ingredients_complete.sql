-- =====================================================================
-- Seed Data for LowCarbPlaner - COMPLETE INGREDIENTS DATABASE
-- Description: Complete ingredients data including:
--              - fiber_per_100_units (for Net Carbs calculation)
--              - polyols_per_100_units (sugar alcohols)
--              - saturated_fat_per_100_units (cardiovascular health)
--              - description (clarifications like "flesh only")
--              - is_low_carb_friendly (TRUE if net carbs <= 10g/100g)
-- =====================================================================
-- IMPORTANT: This replaces previous seed files
-- Net Carbs = Total Carbs - Fiber - Polyols
-- is_low_carb_friendly = TRUE when net_carbs <= 10g per 100g
-- =====================================================================
-- Valid categories (ENUM): vegetables, fruits, meat, fish, dairy, eggs,
--                          nuts_seeds, oils_fats, spices_herbs, flours,
--                          beverages, sweeteners, condiments, other
-- =====================================================================
-- Data sources: USDA FoodData Central, Cronometer, nutritional databases
-- =====================================================================

-- Clear existing data (optional - uncomment if needed)
-- TRUNCATE public.ingredient_unit_conversions CASCADE;
-- TRUNCATE public.ingredients CASCADE;

-- =====================================================================
-- SECTION 1: SEED INGREDIENTS (public.ingredients)
-- =====================================================================

INSERT INTO public.ingredients (
  id, name, category, unit,
  calories_per_100_units, carbs_per_100_units, protein_per_100_units, fats_per_100_units,
  fiber_per_100_units, polyols_per_100_units, saturated_fat_per_100_units,
  is_divisible, image_url, description, is_low_carb_friendly
)
VALUES
  -- ===============================
  -- JAJA (EGGS) - LOW CARB ✓
  -- ===============================
  (866, 'Jajko kurze (całe)', 'eggs', 'g', 155.00, 1.10, 13.00, 11.00, 0.00, 0.00, 3.30, false, null, 'Jajko całe z żółtkiem i białkiem', true),
  (867, 'Jajko kurze (białko)', 'eggs', 'g', 52.00, 0.70, 11.00, 0.20, 0.00, 0.00, 0.00, true, null, 'Samo białko, bez żółtka', true),
  (868, 'Jajko kurze (żółtko)', 'eggs', 'g', 322.00, 3.60, 15.90, 26.50, 0.00, 0.00, 9.50, true, null, 'Samo żółtko, bez białka', true),

  -- ===============================
  -- NABIAŁ (DAIRY) - LOW CARB ✓
  -- ===============================
  (869, 'Ser feta', 'dairy', 'g', 264.00, 4.10, 14.20, 21.30, 0.00, 0.00, 14.90, true, null, 'Ser feta z mleka owczego lub mieszanego', true),
  (870, 'Ser mozzarella', 'dairy', 'g', 280.00, 2.20, 22.20, 22.40, 0.00, 0.00, 13.20, true, null, 'Mozzarella tradycyjna', true),
  (871, 'Ser parmezan', 'dairy', 'g', 431.00, 4.10, 38.50, 28.60, 0.00, 0.00, 18.50, true, null, 'Parmigiano-Reggiano, tarty lub w kawałku', true),
  (872, 'Ser cheddar', 'dairy', 'g', 403.00, 1.30, 24.90, 33.10, 0.00, 0.00, 21.10, true, null, 'Cheddar dojrzały', true),
  (873, 'Ser gouda', 'dairy', 'g', 356.00, 2.20, 24.90, 27.40, 0.00, 0.00, 17.60, true, null, null, true),
  (874, 'Ser camembert', 'dairy', 'g', 300.00, 0.50, 19.80, 24.30, 0.00, 0.00, 15.30, true, null, null, true),
  (875, 'Ser pecorino', 'dairy', 'g', 387.00, 3.60, 25.80, 29.40, 0.00, 0.00, 18.80, true, null, 'Ser owczy typu romano', true),
  (876, 'Twaróg półtłusty', 'dairy', 'g', 98.00, 3.50, 17.00, 2.00, 0.00, 0.00, 1.20, true, null, null, true),
  (877, 'Twaróg chudy', 'dairy', 'g', 72.00, 3.40, 13.50, 0.50, 0.00, 0.00, 0.30, true, null, null, true),
  (878, 'Twaróg tłusty', 'dairy', 'g', 154.00, 2.70, 15.50, 9.00, 0.00, 0.00, 5.50, true, null, null, true),
  (879, 'Ser ricotta', 'dairy', 'g', 174.00, 3.00, 11.30, 13.00, 0.00, 0.00, 8.30, true, null, null, true),
  (880, 'Serek wiejski', 'dairy', 'g', 98.00, 3.40, 11.10, 4.30, 0.00, 0.00, 1.70, true, null, 'Cottage cheese', true),
  (881, 'Masło', 'dairy', 'g', 717.00, 0.10, 0.90, 81.10, 0.00, 0.00, 51.40, true, null, 'Masło 82% tłuszczu', true),
  (882, 'Śmietana 18%', 'dairy', 'ml', 195.00, 3.30, 2.70, 18.00, 0.00, 0.00, 11.20, true, null, null, true),
  (883, 'Śmietana 30%', 'dairy', 'ml', 292.00, 3.10, 2.20, 30.00, 0.00, 0.00, 18.70, true, null, 'Śmietana kremówka', true),
  (884, 'Jogurt grecki naturalny (pełnotłusty)', 'dairy', 'g', 97.00, 3.60, 9.00, 5.00, 0.00, 0.00, 3.30, true, null, 'Jogurt grecki 10% tłuszczu', true),
  (885, 'Jogurt grecki naturalny (2% tłuszczu)', 'dairy', 'g', 73.00, 3.80, 10.00, 1.90, 0.00, 0.00, 1.20, true, null, null, true),
  (886, 'Kefir naturalny', 'dairy', 'ml', 41.00, 4.50, 2.90, 1.00, 0.00, 0.00, 0.60, true, null, null, true),
  -- Mleko - NOT LOW CARB (lactose = sugar)
  (1100, 'Mleko 3.2%', 'dairy', 'ml', 60.00, 4.80, 3.20, 3.20, 0.00, 0.00, 2.00, true, null, 'Mleko pełne', true),
  (1101, 'Mleko 2%', 'dairy', 'ml', 50.00, 4.90, 3.30, 2.00, 0.00, 0.00, 1.30, true, null, 'Mleko półtłuste', true),
  (1102, 'Mleko 0.5%', 'dairy', 'ml', 35.00, 5.00, 3.40, 0.50, 0.00, 0.00, 0.30, true, null, 'Mleko odtłuszczone', true),

  -- ===============================
  -- MIĘSO (MEAT) - LOW CARB ✓
  -- ===============================
  (887, 'Kurczak - pierś (bez skóry)', 'meat', 'g', 165.00, 0.00, 31.00, 3.60, 0.00, 0.00, 1.00, true, null, 'Pierś z kurczaka, surowa, bez skóry', true),
  (888, 'Kurczak - udko (ze skórą)', 'meat', 'g', 211.00, 0.00, 26.00, 11.00, 0.00, 0.00, 3.00, true, null, 'Udko z kurczaka, surowe, ze skórą', true),
  (889, 'Kurczak - skrzydełka (ze skórą)', 'meat', 'g', 290.00, 0.00, 27.00, 19.50, 0.00, 0.00, 5.50, true, null, null, true),
  (890, 'Indyk - pierś (bez skóry)', 'meat', 'g', 135.00, 0.00, 30.00, 1.00, 0.00, 0.00, 0.30, true, null, 'Pierś z indyka, surowa', true),
  (891, 'Indyk - udko (bez skóry)', 'meat', 'g', 144.00, 0.00, 28.60, 2.10, 0.00, 0.00, 0.70, true, null, null, true),
  (892, 'Kaczka - pierś (bez skóry)', 'meat', 'g', 123.00, 0.00, 23.50, 2.50, 0.00, 0.00, 0.90, true, null, null, true),
  (893, 'Wołowina - wołowe mielone 10% tłuszczu', 'meat', 'g', 176.00, 0.00, 20.00, 10.00, 0.00, 0.00, 4.00, true, null, 'Mięso mielone wołowe, chude', true),
  (894, 'Wołowina - antrykot (stek)', 'meat', 'g', 271.00, 0.00, 25.40, 18.40, 0.00, 0.00, 7.70, true, null, 'Ribeye steak', true),
  (895, 'Wołowina - polędwica (tenderloin)', 'meat', 'g', 158.00, 0.00, 26.90, 5.00, 0.00, 0.00, 1.90, true, null, 'Filet mignon', true),
  (896, 'Wołowina - rostbef', 'meat', 'g', 134.00, 0.00, 26.60, 2.60, 0.00, 0.00, 1.00, true, null, null, true),
  (897, 'Wieprzowina - schab', 'meat', 'g', 242.00, 0.00, 21.50, 17.00, 0.00, 0.00, 6.00, true, null, 'Schab wieprzowy, surowy', true),
  (898, 'Wieprzowina - karkówka', 'meat', 'g', 263.00, 0.00, 18.40, 20.50, 0.00, 0.00, 7.50, true, null, null, true),
  (899, 'Wieprzowina - boczek surowy', 'meat', 'g', 393.00, 1.40, 11.60, 38.00, 0.00, 0.00, 14.00, true, null, 'Boczek świeży, bez wędzenia', true),
  (900, 'Baranina - comber', 'meat', 'g', 294.00, 0.00, 16.50, 25.00, 0.00, 0.00, 11.00, true, null, null, true),
  (901, 'Baranina - udziec', 'meat', 'g', 240.00, 0.00, 20.00, 17.50, 0.00, 0.00, 7.50, true, null, null, true),
  (902, 'Szynka z indyka (bez dodatków)', 'meat', 'g', 104.00, 1.00, 17.50, 3.50, 0.00, 0.00, 1.10, true, null, 'Szynka z indyka, plastry', true),
  (903, 'Szynka wieprzowa (bez dodatków)', 'meat', 'g', 145.00, 1.50, 21.00, 6.50, 0.00, 0.00, 2.30, true, null, null, true),
  (904, 'Kabanos', 'meat', 'g', 434.00, 1.90, 21.80, 37.90, 0.00, 0.00, 14.00, true, null, 'Kabanos tradycyjny', true),

  -- ===============================
  -- RYBY I OWOCE MORZA (FISH) - LOW CARB ✓
  -- ===============================
  (905, 'Łosoś (świeży)', 'fish', 'g', 208.00, 0.00, 20.00, 13.40, 0.00, 0.00, 3.10, true, null, 'Łosoś atlantycki, surowy', true),
  (906, 'Łosoś wędzony', 'fish', 'g', 117.00, 0.00, 18.30, 4.50, 0.00, 0.00, 0.90, true, null, null, true),
  (907, 'Makrela (świeża)', 'fish', 'g', 205.00, 0.00, 18.60, 13.90, 0.00, 0.00, 3.30, true, null, null, true),
  (908, 'Makrela wędzona', 'fish', 'g', 220.00, 0.00, 23.80, 13.00, 0.00, 0.00, 3.00, true, null, null, true),
  (909, 'Sardynki (w oleju)', 'fish', 'g', 208.00, 0.00, 24.60, 11.50, 0.00, 0.00, 1.50, true, null, 'Sardynki w oleju, odsączone', true),
  (910, 'Śledź (marynowany)', 'fish', 'g', 262.00, 9.60, 14.20, 18.00, 0.00, 0.00, 2.40, true, null, null, true),
  (911, 'Pstrąg tęczowy', 'fish', 'g', 119.00, 0.00, 20.50, 3.50, 0.00, 0.00, 0.70, true, null, null, true),
  (912, 'Tuńczyk w sosie własnym', 'fish', 'g', 116.00, 0.00, 26.00, 0.80, 0.00, 0.00, 0.20, true, null, 'Tuńczyk z puszki, odsączony', true),
  (913, 'Dorsz', 'fish', 'g', 82.00, 0.00, 17.80, 0.70, 0.00, 0.00, 0.10, true, null, 'Dorsz atlantycki, surowy', true),
  (914, 'Tilapia', 'fish', 'g', 96.00, 0.00, 20.10, 1.70, 0.00, 0.00, 0.60, true, null, null, true),
  (915, 'Halibut', 'fish', 'g', 91.00, 0.00, 18.60, 1.30, 0.00, 0.00, 0.30, true, null, null, true),
  (916, 'Morszczuk', 'fish', 'g', 90.00, 0.00, 18.40, 1.30, 0.00, 0.00, 0.30, true, null, null, true),
  (917, 'Krewetki', 'fish', 'g', 99.00, 0.90, 20.90, 1.00, 0.00, 0.00, 0.20, true, null, 'Krewetki obrane, surowe', true),
  (918, 'Kalmar', 'fish', 'g', 92.00, 3.10, 15.60, 1.40, 0.00, 0.00, 0.40, true, null, null, true),
  (919, 'Ośmiornica', 'fish', 'g', 82.00, 2.20, 14.90, 1.00, 0.00, 0.00, 0.20, true, null, null, true),
  (920, 'Małże', 'fish', 'g', 86.00, 3.70, 11.90, 2.20, 0.00, 0.00, 0.40, true, null, 'Małże niebieskie, surowe', true),
  (921, 'Homary', 'fish', 'g', 89.00, 0.00, 19.00, 0.90, 0.00, 0.00, 0.20, true, null, null, true),

  -- ===============================
  -- WARZYWA LOW CARB (VEGETABLES) ✓
  -- ===============================
  (922, 'Brokuły', 'vegetables', 'g', 34.00, 7.00, 2.80, 0.40, 2.60, 0.00, 0.04, true, null, 'Brokuły świeże, surowe', true),
  (923, 'Kalafior', 'vegetables', 'g', 25.00, 5.00, 1.90, 0.30, 2.00, 0.00, 0.03, true, null, null, true),
  (924, 'Kapusta biała', 'vegetables', 'g', 25.00, 5.80, 1.30, 0.10, 2.50, 0.00, 0.01, true, null, null, true),
  (925, 'Kapusta czerwona', 'vegetables', 'g', 31.00, 7.40, 1.40, 0.20, 2.10, 0.00, 0.03, true, null, null, true),
  (926, 'Kapusta włoska (czarna)', 'vegetables', 'g', 25.00, 4.40, 1.30, 0.10, 2.00, 0.00, 0.01, true, null, 'Cavolo nero', true),
  (927, 'Brukselka', 'vegetables', 'g', 43.00, 9.00, 3.40, 0.30, 3.80, 0.00, 0.06, true, null, null, true),
  (928, 'Jarmuż (kale)', 'vegetables', 'g', 49.00, 8.80, 4.30, 0.90, 3.60, 0.00, 0.09, true, null, 'Jarmuż świeży, liście', true),
  (929, 'Bok choy (kapusta chińska)', 'vegetables', 'g', 13.00, 2.20, 1.50, 0.20, 1.00, 0.00, 0.03, true, null, null, true),
  (930, 'Szpinak (świeży)', 'vegetables', 'g', 23.00, 3.60, 2.90, 0.40, 2.20, 0.00, 0.06, true, null, 'Szpinak świeży, liście', true),
  (931, 'Sałata masłowa', 'vegetables', 'g', 13.00, 2.20, 1.40, 0.20, 1.10, 0.00, 0.03, true, null, null, true),
  (932, 'Sałata rzymska', 'vegetables', 'g', 17.00, 3.30, 1.20, 0.30, 2.10, 0.00, 0.04, true, null, null, true),
  (933, 'Sałata lodowa (góra lodowa)', 'vegetables', 'g', 14.00, 3.00, 0.90, 0.10, 1.20, 0.00, 0.01, true, null, null, true),
  (934, 'Rukola', 'vegetables', 'g', 25.00, 3.70, 2.60, 0.70, 1.60, 0.00, 0.09, true, null, null, true),
  (935, 'Endywia', 'vegetables', 'g', 17.00, 3.40, 1.30, 0.20, 3.10, 0.00, 0.02, true, null, null, true),
  (936, 'Pak choi', 'vegetables', 'g', 13.00, 2.20, 1.50, 0.20, 1.00, 0.00, 0.03, true, null, null, true),
  (937, 'Pomidor', 'vegetables', 'g', 18.00, 3.90, 0.90, 0.20, 1.20, 0.00, 0.03, true, null, 'Pomidor świeży, czerwony', true),
  (938, 'Pomidory koktajlowe', 'vegetables', 'g', 18.00, 3.90, 0.90, 0.20, 1.20, 0.00, 0.03, true, null, null, true),
  (939, 'Pomidory suszone (w oleju)', 'vegetables', 'g', 213.00, 14.10, 4.30, 15.50, 12.30, 0.00, 2.10, true, null, 'Pomidory suszone, z olejem', true),
  (940, 'Papryka czerwona', 'vegetables', 'g', 31.00, 6.00, 1.00, 0.30, 2.10, 0.00, 0.03, true, null, null, true),
  (941, 'Papryka zielona', 'vegetables', 'g', 20.00, 4.60, 0.90, 0.20, 1.70, 0.00, 0.02, true, null, null, true),
  (942, 'Papryka żółta', 'vegetables', 'g', 27.00, 6.30, 1.00, 0.20, 0.90, 0.00, 0.02, true, null, null, true),
  (943, 'Cukinia', 'vegetables', 'g', 17.00, 3.10, 1.20, 0.30, 1.00, 0.00, 0.05, true, null, null, true),
  (944, 'Bakłażan', 'vegetables', 'g', 25.00, 5.90, 1.00, 0.20, 3.00, 0.00, 0.03, true, null, null, true),
  (945, 'Ogórek', 'vegetables', 'g', 15.00, 3.60, 0.70, 0.10, 0.50, 0.00, 0.02, true, null, 'Ogórek świeży, ze skórką', true),
  -- AWOKADO: 8.5g carbs - 6.7g fiber = 1.8g NET CARBS!
  (946, 'Awokado', 'vegetables', 'g', 160.00, 8.50, 2.00, 14.70, 6.70, 0.00, 2.10, true, null, 'Tylko miąższ, bez pestki i skórki', true),
  (947, 'Rzodkiewka', 'vegetables', 'g', 16.00, 3.40, 0.70, 0.10, 1.60, 0.00, 0.01, true, null, null, true),
  (948, 'Rzodkiew biała (daikon)', 'vegetables', 'g', 18.00, 4.10, 0.60, 0.10, 1.60, 0.00, 0.01, true, null, null, true),
  (949, 'Seler naciowy', 'vegetables', 'g', 16.00, 3.00, 0.70, 0.20, 1.60, 0.00, 0.04, true, null, 'Łodygi selerowe', true),
  (950, 'Rzepa', 'vegetables', 'g', 28.00, 6.40, 0.90, 0.10, 1.80, 0.00, 0.01, true, null, null, true),
  (951, 'Pieczarki', 'vegetables', 'g', 22.00, 3.30, 3.10, 0.30, 1.00, 0.00, 0.05, true, null, 'Pieczarki białe, świeże', true),
  (952, 'Pieczarki portobello', 'vegetables', 'g', 22.00, 3.90, 2.10, 0.40, 1.30, 0.00, 0.06, true, null, null, true),
  (953, 'Borowiki suszone', 'vegetables', 'g', 231.00, 48.80, 20.10, 3.50, 17.00, 0.00, 0.50, true, null, null, false),
  (954, 'Pieczarki shitake', 'vegetables', 'g', 34.00, 6.80, 2.20, 0.50, 2.50, 0.00, 0.10, true, null, null, true),
  (955, 'Szparagi', 'vegetables', 'g', 20.00, 3.90, 2.20, 0.10, 2.10, 0.00, 0.02, true, null, 'Szparagi zielone, świeże', true),
  (956, 'Fasolka szparagowa', 'vegetables', 'g', 31.00, 7.00, 1.80, 0.10, 2.70, 0.00, 0.02, true, null, null, true),
  (957, 'Dynia piżmowa (butternut)', 'vegetables', 'g', 45.00, 11.70, 1.00, 0.10, 2.00, 0.00, 0.02, true, null, 'Dynia maślana, miąższ', true),
  (958, 'Kabaczek patison', 'vegetables', 'g', 19.00, 4.30, 1.20, 0.20, 1.20, 0.00, 0.04, true, null, null, true),

  -- Cebulowe
  (966, 'Cebula biała', 'vegetables', 'g', 40.00, 9.30, 1.10, 0.10, 1.70, 0.00, 0.02, true, null, null, true),
  (967, 'Cebula czerwona', 'vegetables', 'g', 40.00, 9.30, 1.10, 0.10, 1.70, 0.00, 0.02, true, null, null, true),
  (968, 'Dymka (cebula zielona)', 'vegetables', 'g', 32.00, 7.30, 1.80, 0.20, 2.60, 0.00, 0.03, true, null, 'Szczypiorek cebulowy', true),
  (969, 'Czosnek', 'vegetables', 'g', 149.00, 33.10, 6.40, 0.50, 2.10, 0.00, 0.09, true, null, 'Ząbki czosnku, obrane', false),
  (970, 'Por', 'vegetables', 'g', 61.00, 14.20, 1.50, 0.30, 1.80, 0.00, 0.04, true, null, 'Biała i jasnozielona część', false),

  -- ===============================
  -- WARZYWA HIGH CARB (NOT LOW CARB) ✗
  -- ===============================
  (1010, 'Ziemniak', 'vegetables', 'g', 77.00, 17.50, 2.00, 0.10, 2.20, 0.00, 0.03, true, null, 'Ziemniak surowy, ze skórką', false),
  (1011, 'Ziemniak (gotowany)', 'vegetables', 'g', 87.00, 20.10, 1.90, 0.10, 1.80, 0.00, 0.03, true, null, 'Ziemniak gotowany, bez skórki', false),
  (1012, 'Bataty (słodkie ziemniaki)', 'vegetables', 'g', 86.00, 20.10, 1.60, 0.10, 3.00, 0.00, 0.02, true, null, 'Bataty surowe', false),
  (1013, 'Marchewka', 'vegetables', 'g', 41.00, 9.60, 0.90, 0.20, 2.80, 0.00, 0.03, true, null, null, true),
  (1014, 'Burak', 'vegetables', 'g', 43.00, 9.60, 1.60, 0.20, 2.80, 0.00, 0.03, true, null, 'Burak czerwony, surowy', true),
  (1015, 'Kukurydza (konserwowa)', 'vegetables', 'g', 86.00, 18.70, 2.90, 1.20, 2.00, 0.00, 0.18, true, null, null, false),
  (1016, 'Kukurydza (kolba)', 'vegetables', 'g', 96.00, 21.00, 3.40, 1.50, 2.40, 0.00, 0.20, false, null, 'Kukurydza świeża, 1 kolba ≈ 90g', false),
  (1017, 'Groszek zielony', 'vegetables', 'g', 81.00, 14.40, 5.40, 0.40, 5.70, 0.00, 0.07, true, null, null, true),
  (1018, 'Seler korzeniowy', 'vegetables', 'g', 42.00, 9.20, 1.50, 0.30, 1.80, 0.00, 0.04, true, null, null, true),
  (1019, 'Pietruszka korzeń', 'vegetables', 'g', 36.00, 7.90, 1.50, 0.50, 3.30, 0.00, 0.08, true, null, null, true),

  -- ===============================
  -- OWOCE LOW CARB (FRUITS) ✓
  -- ===============================
  (959, 'Truskawki', 'fruits', 'g', 32.00, 7.70, 0.70, 0.30, 2.00, 0.00, 0.02, true, null, 'Truskawki świeże, bez szypułek', true),
  (960, 'Maliny', 'fruits', 'g', 52.00, 12.00, 1.20, 0.70, 6.50, 0.00, 0.02, true, null, null, true),
  (961, 'Borówki', 'fruits', 'g', 57.00, 14.50, 0.70, 0.30, 2.40, 0.00, 0.02, true, null, 'Borówki amerykańskie', false),
  (962, 'Jagody', 'fruits', 'g', 64.00, 14.10, 1.00, 0.50, 2.40, 0.00, 0.03, true, null, 'Jagody leśne/ogrodowe', false),
  (963, 'Jeżyny', 'fruits', 'g', 43.00, 9.60, 1.40, 0.50, 5.30, 0.00, 0.02, true, null, null, true),
  (964, 'Cytryna (sok)', 'fruits', 'ml', 22.00, 6.90, 0.40, 0.20, 0.30, 0.00, 0.02, true, null, 'Świeżo wyciśnięty sok', true),
  (965, 'Limonka (sok)', 'fruits', 'ml', 25.00, 8.40, 0.40, 0.10, 0.40, 0.00, 0.01, true, null, 'Świeżo wyciśnięty sok', true),

  -- ===============================
  -- OWOCE HIGH CARB (NOT LOW CARB) ✗
  -- ===============================
  (1020, 'Jabłko', 'fruits', 'g', 52.00, 13.80, 0.30, 0.20, 2.40, 0.00, 0.03, true, null, 'Jabłko ze skórką', false),
  (1021, 'Gruszka', 'fruits', 'g', 57.00, 15.20, 0.40, 0.10, 3.10, 0.00, 0.01, true, null, null, false),
  (1022, 'Banan', 'fruits', 'g', 89.00, 22.80, 1.10, 0.30, 2.60, 0.00, 0.11, true, null, 'Banan dojrzały, tylko miąższ', false),
  (1023, 'Pomarańcza', 'fruits', 'g', 47.00, 11.80, 0.90, 0.10, 2.40, 0.00, 0.01, true, null, 'Pomarańcza, tylko miąższ', true),
  (1024, 'Mandarynka', 'fruits', 'g', 53.00, 13.30, 0.80, 0.30, 1.80, 0.00, 0.04, true, null, null, false),
  (1025, 'Grejpfrut', 'fruits', 'g', 42.00, 10.70, 0.80, 0.10, 1.60, 0.00, 0.01, true, null, null, true),
  (1026, 'Winogrona', 'fruits', 'g', 69.00, 18.10, 0.70, 0.20, 0.90, 0.00, 0.07, true, null, null, false),
  (1027, 'Arbuz', 'fruits', 'g', 30.00, 7.60, 0.60, 0.20, 0.40, 0.00, 0.02, true, null, 'Tylko miąższ, bez pestek', true),
  (1028, 'Melon miodowy', 'fruits', 'g', 36.00, 9.10, 0.50, 0.10, 0.80, 0.00, 0.01, true, null, null, true),
  (1029, 'Ananas', 'fruits', 'g', 50.00, 13.10, 0.50, 0.10, 1.40, 0.00, 0.01, true, null, 'Ananas świeży, tylko miąższ', false),
  (1030, 'Mango', 'fruits', 'g', 60.00, 15.00, 0.80, 0.40, 1.60, 0.00, 0.09, true, null, 'Tylko miąższ', false),
  (1031, 'Kiwi', 'fruits', 'g', 61.00, 14.70, 1.10, 0.50, 3.00, 0.00, 0.03, true, null, null, false),
  (1032, 'Brzoskwinia', 'fruits', 'g', 39.00, 9.50, 0.90, 0.30, 1.50, 0.00, 0.02, true, null, null, true),
  (1033, 'Nektarynka', 'fruits', 'g', 44.00, 10.60, 1.10, 0.30, 1.70, 0.00, 0.02, true, null, null, true),
  (1034, 'Śliwka', 'fruits', 'g', 46.00, 11.40, 0.70, 0.30, 1.40, 0.00, 0.02, true, null, null, false),
  (1035, 'Wiśnie', 'fruits', 'g', 63.00, 16.00, 1.10, 0.20, 2.10, 0.00, 0.04, true, null, null, false),
  (1036, 'Czereśnie', 'fruits', 'g', 63.00, 16.00, 1.10, 0.20, 2.10, 0.00, 0.04, true, null, null, false),
  (1037, 'Suszone daktyle', 'fruits', 'g', 277.00, 75.00, 1.80, 0.20, 6.70, 0.00, 0.03, true, null, 'Daktyle suszone bez pestek', false),
  (1038, 'Rodzynki', 'fruits', 'g', 299.00, 79.20, 3.10, 0.50, 3.70, 0.00, 0.06, true, null, null, false),

  -- ===============================
  -- ORZECHY I NASIONA (NUTS_SEEDS) - mostly low carb ✓
  -- ===============================
  (971, 'Migdały', 'nuts_seeds', 'g', 579.00, 21.60, 21.20, 49.90, 12.50, 0.00, 3.70, true, null, 'Migdały surowe, bez skórki', true),
  (972, 'Orzechy włoskie', 'nuts_seeds', 'g', 654.00, 13.70, 15.20, 65.20, 6.70, 0.00, 6.10, true, null, 'Tylko jądra', true),
  (973, 'Orzechy laskowe', 'nuts_seeds', 'g', 628.00, 16.70, 15.00, 60.80, 9.70, 0.00, 4.50, true, null, null, true),
  (974, 'Orzechy pekan', 'nuts_seeds', 'g', 691.00, 13.90, 9.20, 72.00, 9.60, 0.00, 6.20, true, null, null, true),
  (975, 'Orzechy makadamia', 'nuts_seeds', 'g', 718.00, 13.80, 7.90, 75.80, 8.60, 0.00, 12.10, true, null, 'Wysokie tłuszcze nasycone!', true),
  (976, 'Orzechy nerkowca', 'nuts_seeds', 'g', 553.00, 30.20, 18.20, 43.90, 3.30, 0.00, 7.80, true, null, null, false),
  (977, 'Orzechy brazylijskie', 'nuts_seeds', 'g', 656.00, 12.30, 14.30, 66.40, 7.50, 0.00, 15.10, true, null, 'Bogate w selen', true),
  (978, 'Pestki dyni', 'nuts_seeds', 'g', 559.00, 10.70, 30.20, 49.10, 6.00, 0.00, 8.70, true, null, 'Pestki łuskane', true),
  (979, 'Pestki słonecznika', 'nuts_seeds', 'g', 584.00, 20.00, 20.80, 51.50, 8.60, 0.00, 4.50, true, null, 'Pestki łuskane', false),
  (980, 'Nasiona chia', 'nuts_seeds', 'g', 486.00, 42.10, 16.50, 30.70, 34.40, 0.00, 3.30, true, null, 'Ekstremalnie wysokie błonnik!', true),
  (981, 'Siemię lniane', 'nuts_seeds', 'g', 534.00, 28.90, 18.30, 42.20, 27.30, 0.00, 3.70, true, null, 'Mielone lub całe', true),
  (982, 'Nasiona sezamu', 'nuts_seeds', 'g', 573.00, 23.50, 17.70, 49.70, 11.80, 0.00, 7.00, true, null, null, false),
  (983, 'Wiórki kokosowe', 'nuts_seeds', 'g', 660.00, 23.70, 6.90, 64.50, 16.30, 0.00, 57.20, true, null, 'Bardzo wysokie tłuszcze nasycone!', true),
  (1039, 'Orzechy ziemne (arachidowe)', 'nuts_seeds', 'g', 567.00, 16.10, 25.80, 49.20, 8.50, 0.00, 6.80, true, null, null, true),
  (1040, 'Masło orzechowe', 'nuts_seeds', 'g', 588.00, 20.00, 25.00, 50.00, 6.00, 0.00, 10.30, true, null, 'Masło z orzechów ziemnych, bez dodatków', false),
  (1041, 'Tahini (pasta sezamowa)', 'nuts_seeds', 'g', 595.00, 21.20, 17.00, 53.80, 9.30, 0.00, 7.50, true, null, null, false),

  -- ===============================
  -- TŁUSZCZE I OLEJE (OILS_FATS) - LOW CARB ✓
  -- ===============================
  (984, 'Oliwa z oliwek extra virgin', 'oils_fats', 'ml', 884.00, 0.00, 0.00, 100.00, 0.00, 0.00, 13.80, true, null, 'Oliwa z pierwszego tłoczenia', true),
  (985, 'Olej kokosowy', 'oils_fats', 'ml', 862.00, 0.00, 0.00, 100.00, 0.00, 0.00, 82.50, true, null, 'Bardzo wysokie tłuszcze nasycone!', true),
  (986, 'Olej MCT', 'oils_fats', 'ml', 864.00, 0.00, 0.00, 100.00, 0.00, 0.00, 97.00, true, null, 'Triglicerydy średniołańcuchowe', true),
  (987, 'Olej awokado', 'oils_fats', 'ml', 884.00, 0.00, 0.00, 100.00, 0.00, 0.00, 11.60, true, null, null, true),
  (988, 'Olej rzepakowy', 'oils_fats', 'ml', 884.00, 0.00, 0.00, 100.00, 0.00, 0.00, 7.40, true, null, null, true),
  (989, 'Smalec', 'oils_fats', 'g', 902.00, 0.00, 0.00, 100.00, 0.00, 0.00, 39.20, true, null, 'Tłuszcz wieprzowy topiony', true),
  (990, 'Ghee (masło klarowane)', 'oils_fats', 'g', 900.00, 0.00, 0.00, 100.00, 0.00, 0.00, 61.90, true, null, 'Wysokie tłuszcze nasycone', true),
  (1042, 'Olej słonecznikowy', 'oils_fats', 'ml', 884.00, 0.00, 0.00, 100.00, 0.00, 0.00, 10.30, true, null, null, true),
  (1043, 'Olej lniany', 'oils_fats', 'ml', 884.00, 0.00, 0.00, 100.00, 0.00, 0.00, 9.40, true, null, 'Zimnotłoczony, bogaty w omega-3', true),
  (1044, 'Olej sezamowy', 'oils_fats', 'ml', 884.00, 0.00, 0.00, 100.00, 0.00, 0.00, 14.20, true, null, null, true),

  -- ===============================
  -- SŁODZIKI (SWEETENERS) - polyols = LOW CARB ✓
  -- ===============================
  (991, 'Erytrytol', 'sweeteners', 'g', 0.00, 100.00, 0.00, 0.00, 0.00, 100.00, 0.00, true, null, '0 kcal, 100% polyoli = 0 net carbs', true),
  (992, 'Ksylitol', 'sweeteners', 'g', 240.00, 100.00, 0.00, 0.00, 0.00, 100.00, 0.00, true, null, '2.4 kcal/g, 100% polyoli = 0 net carbs', true),
  (993, 'Stewia (ekstrakt)', 'sweeteners', 'g', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Steviol glycosides, 0 kcal', true),
  (994, 'Monk fruit (lo han guo)', 'sweeteners', 'g', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Ekstrakt z owocu mniszka, 0 kcal', true),
  (995, 'Maltitol', 'sweeteners', 'g', 210.00, 100.00, 0.00, 0.00, 0.00, 100.00, 0.00, true, null, 'Uwaga: może powodować efekt przeczyszczający', true),
  (996, 'Sorbitol', 'sweeteners', 'g', 260.00, 100.00, 0.00, 0.00, 0.00, 100.00, 0.00, true, null, null, true),
  -- Regular sweeteners - NOT LOW CARB
  (1045, 'Cukier biały', 'sweeteners', 'g', 387.00, 100.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Cukier rafinowany', false),
  (1046, 'Cukier brązowy', 'sweeteners', 'g', 380.00, 98.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, null, false),
  (1047, 'Miód naturalny', 'sweeteners', 'g', 304.00, 82.40, 0.30, 0.00, 0.20, 0.00, 0.00, true, null, null, false),
  (1048, 'Syrop klonowy', 'sweeteners', 'ml', 260.00, 67.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Syrop klonowy czysty', false),
  (1049, 'Agawa (syrop)', 'sweeteners', 'ml', 310.00, 76.00, 0.00, 0.00, 0.20, 0.00, 0.00, true, null, null, false),

  -- ===============================
  -- MĄKI I PRODUKTY ZBOŻOWE - mostly NOT LOW CARB ✗
  -- ===============================
  (1050, 'Mąka pszenna', 'flours', 'g', 364.00, 76.30, 10.30, 1.00, 2.70, 0.00, 0.15, true, null, 'Mąka pszenna typ 500', false),
  (1051, 'Mąka migdałowa', 'flours', 'g', 571.00, 21.40, 21.40, 50.00, 10.70, 0.00, 3.90, true, null, 'Mąka z mielonych migdałów - LOW CARB', true),
  (1052, 'Mąka kokosowa', 'flours', 'g', 443.00, 60.00, 19.30, 14.30, 39.00, 0.00, 11.80, true, null, 'Bardzo wysokie błonnik - LOW CARB', false),
  (1053, 'Mąka żytnia', 'flours', 'g', 335.00, 75.40, 8.50, 1.40, 11.80, 0.00, 0.17, true, null, null, false),
  (1054, 'Płatki owsiane', 'flours', 'g', 389.00, 66.30, 16.90, 6.90, 10.60, 0.00, 1.22, true, null, null, false),
  (1055, 'Ryż biały (surowy)', 'flours', 'g', 365.00, 80.00, 7.10, 0.70, 1.30, 0.00, 0.17, true, null, null, false),
  (1056, 'Ryż brązowy (surowy)', 'flours', 'g', 370.00, 77.20, 7.90, 2.90, 3.50, 0.00, 0.58, true, null, null, false),
  (1057, 'Kasza gryczana', 'flours', 'g', 343.00, 71.50, 13.30, 3.40, 10.00, 0.00, 0.74, true, null, null, false),
  (1058, 'Kasza jaglana', 'flours', 'g', 378.00, 72.80, 11.00, 4.20, 8.50, 0.00, 0.72, true, null, null, false),
  (1059, 'Komosa ryżowa (quinoa)', 'flours', 'g', 368.00, 64.20, 14.10, 6.10, 7.00, 0.00, 0.71, true, null, null, false),
  (1060, 'Makaron pszenny (surowy)', 'flours', 'g', 371.00, 74.70, 13.00, 1.50, 3.20, 0.00, 0.28, true, null, null, false),
  (1061, 'Chleb pszenny', 'flours', 'g', 265.00, 49.00, 9.00, 3.20, 2.70, 0.00, 0.70, true, null, 'Chleb biały', false),
  (1062, 'Chleb żytni razowy', 'flours', 'g', 250.00, 48.00, 8.50, 3.30, 5.80, 0.00, 0.50, true, null, null, false),
  (1063, 'Bułka pszenna', 'flours', 'g', 276.00, 53.00, 9.00, 3.50, 2.50, 0.00, 0.80, false, null, null, false),
  (1064, 'Tortilla pszenna', 'flours', 'g', 312.00, 52.00, 8.00, 8.00, 2.20, 0.00, 2.50, false, null, null, false),

  -- ===============================
  -- ROŚLINY STRĄCZKOWE (LEGUMES) - NOT LOW CARB ✗
  -- ===============================
  (1070, 'Fasola biała (gotowana)', 'vegetables', 'g', 139.00, 25.10, 9.70, 0.50, 6.30, 0.00, 0.13, true, null, null, false),
  (1071, 'Fasola czerwona (gotowana)', 'vegetables', 'g', 127.00, 22.80, 8.70, 0.50, 6.40, 0.00, 0.07, true, null, null, false),
  (1072, 'Ciecierzyca (gotowana)', 'vegetables', 'g', 164.00, 27.40, 8.90, 2.60, 7.60, 0.00, 0.27, true, null, 'Chickpeas', false),
  (1073, 'Soczewica zielona (gotowana)', 'vegetables', 'g', 116.00, 20.10, 9.00, 0.40, 7.90, 0.00, 0.05, true, null, null, false),
  (1074, 'Soczewica czerwona (gotowana)', 'vegetables', 'g', 116.00, 20.10, 9.00, 0.40, 7.90, 0.00, 0.05, true, null, null, false),
  (1075, 'Edamame (gotowane)', 'vegetables', 'g', 122.00, 9.90, 11.90, 5.20, 5.20, 0.00, 0.62, true, null, 'Zielona soja - moderately low carb', true),
  (1076, 'Tofu twarde', 'other', 'g', 144.00, 2.80, 17.30, 8.70, 2.30, 0.00, 1.26, true, null, 'Ser sojowy - LOW CARB', true),
  (1077, 'Tempeh', 'other', 'g', 192.00, 7.60, 20.30, 10.80, 0.00, 0.00, 2.54, true, null, 'Fermentowana soja', true),

  -- ===============================
  -- PRZYPRAWY I ZIOŁA (SPICES_HERBS) - LOW CARB ✓
  -- ===============================
  (997, 'Sól', 'spices_herbs', 'g', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, null, true),
  (998, 'Pieprz czarny (mielony)', 'spices_herbs', 'g', 251.00, 63.90, 10.40, 3.30, 25.30, 0.00, 0.98, true, null, null, true),
  (999, 'Papryka słodka (mielona)', 'spices_herbs', 'g', 282.00, 53.90, 14.10, 12.90, 34.90, 0.00, 2.14, true, null, null, true),
  (1000, 'Kurkuma (mielona)', 'spices_herbs', 'g', 312.00, 67.10, 9.70, 3.30, 22.70, 0.00, 1.84, true, null, null, true),
  (1001, 'Cynamon (mielony)', 'spices_herbs', 'g', 247.00, 80.60, 4.00, 1.20, 53.10, 0.00, 0.35, true, null, null, true),
  (1002, 'Imbir (mielony)', 'spices_herbs', 'g', 335.00, 71.60, 8.98, 4.24, 14.10, 0.00, 2.60, true, null, null, true),
  (1003, 'Oregano (suszone)', 'spices_herbs', 'g', 265.00, 68.90, 9.00, 4.30, 42.50, 0.00, 1.55, true, null, null, true),
  (1004, 'Bazylia (świeża)', 'spices_herbs', 'g', 23.00, 2.70, 3.15, 0.64, 1.60, 0.00, 0.04, true, null, 'Liście świeże', true),
  (1005, 'Natka pietruszki (świeża)', 'spices_herbs', 'g', 36.00, 6.30, 2.97, 0.79, 3.30, 0.00, 0.13, true, null, null, true),
  (1006, 'Koperek (świeży)', 'spices_herbs', 'g', 43.00, 7.00, 3.46, 1.12, 2.10, 0.00, 0.06, true, null, null, true),
  (1007, 'Rozmaryn (świeży)', 'spices_herbs', 'g', 131.00, 20.70, 3.31, 5.86, 14.10, 0.00, 2.84, true, null, null, true),
  (1008, 'Tymianek (świeży)', 'spices_herbs', 'g', 101.00, 24.40, 5.56, 1.68, 14.00, 0.00, 0.47, true, null, null, true),

  -- ===============================
  -- NAPOJE (BEVERAGES) - variable
  -- ===============================
  (1080, 'Kawa czarna', 'beverages', 'ml', 2.00, 0.00, 0.30, 0.00, 0.00, 0.00, 0.00, true, null, 'Kawa bez dodatków', true),
  (1081, 'Herbata zielona', 'beverages', 'ml', 1.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Herbata bez dodatków', true),
  (1082, 'Herbata czarna', 'beverages', 'ml', 1.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Herbata bez dodatków', true),
  (1083, 'Mleko kokosowe (puszka)', 'beverages', 'ml', 197.00, 2.80, 2.00, 21.30, 0.00, 0.00, 18.90, true, null, 'Gęste mleko kokosowe', true),
  (1084, 'Mleko migdałowe (niesłodzone)', 'beverages', 'ml', 13.00, 0.30, 0.40, 1.10, 0.00, 0.00, 0.09, true, null, null, true),
  (1085, 'Sok pomarańczowy', 'beverages', 'ml', 45.00, 10.40, 0.70, 0.20, 0.20, 0.00, 0.02, true, null, 'Świeżo wyciskany', false),
  (1086, 'Sok jabłkowy', 'beverages', 'ml', 46.00, 11.30, 0.10, 0.10, 0.20, 0.00, 0.02, true, null, null, false),
  (1087, 'Wino czerwone (wytrawne)', 'beverages', 'ml', 85.00, 2.60, 0.10, 0.00, 0.00, 0.00, 0.00, true, null, null, true),
  (1088, 'Wino białe (wytrawne)', 'beverages', 'ml', 82.00, 2.60, 0.10, 0.00, 0.00, 0.00, 0.00, true, null, null, true),
  (1089, 'Piwo jasne', 'beverages', 'ml', 43.00, 3.60, 0.50, 0.00, 0.00, 0.00, 0.00, true, null, null, true),

  -- ===============================
  -- SOSY I PRZYPRAWY (CONDIMENTS) - variable
  -- ===============================
  (1090, 'Majonez', 'condiments', 'g', 680.00, 0.60, 1.00, 75.00, 0.00, 0.00, 11.80, true, null, 'Majonez pełnotłusty', true),
  (1091, 'Musztarda', 'condiments', 'g', 66.00, 5.80, 4.40, 3.60, 3.30, 0.00, 0.25, true, null, null, true),
  (1092, 'Ketchup', 'condiments', 'g', 112.00, 27.40, 1.70, 0.10, 0.30, 0.00, 0.02, true, null, 'Uwaga: dużo cukru!', false),
  (1093, 'Sos sojowy', 'condiments', 'ml', 53.00, 5.60, 8.10, 0.00, 0.00, 0.00, 0.00, true, null, null, true),
  (1094, 'Ocet jabłkowy', 'condiments', 'ml', 21.00, 0.90, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, null, true),
  (1095, 'Ocet balsamiczny', 'condiments', 'ml', 88.00, 17.00, 0.50, 0.00, 0.00, 0.00, 0.00, true, null, null, false),
  (1096, 'Pesto bazyliowe', 'condiments', 'g', 387.00, 4.00, 5.00, 39.00, 1.50, 0.00, 6.80, true, null, null, true),
  (1097, 'Hummus', 'condiments', 'g', 166.00, 14.30, 7.90, 9.60, 6.00, 0.00, 1.44, true, null, null, true),
  (1098, 'Guacamole', 'condiments', 'g', 157.00, 8.50, 2.00, 14.00, 6.00, 0.00, 2.00, true, null, null, true),

  -- ===============================
  -- DODATKOWE OWOCE (MORE FRUITS) - NOT LOW CARB ✗
  -- ===============================
  -- Owoce tropikalne
  (1200, 'Papaja', 'fruits', 'g', 43.00, 10.80, 0.50, 0.30, 1.70, 0.00, 0.08, true, null, 'Tylko miąższ, bez pestek', false),
  (1201, 'Marakuja (passion fruit)', 'fruits', 'g', 97.00, 23.40, 2.20, 0.70, 10.40, 0.00, 0.06, true, null, 'Miąższ z pestkami', false),
  (1202, 'Granat', 'fruits', 'g', 83.00, 18.70, 1.70, 1.20, 4.00, 0.00, 0.12, true, null, 'Pestki z miąższem', false),
  (1203, 'Liczi', 'fruits', 'g', 66.00, 16.50, 0.80, 0.40, 1.30, 0.00, 0.10, true, null, 'Tylko miąższ', false),
  (1204, 'Smocze oko (longan)', 'fruits', 'g', 60.00, 15.10, 1.30, 0.10, 1.10, 0.00, 0.05, true, null, null, false),
  (1205, 'Karambola (starfruit)', 'fruits', 'g', 31.00, 6.70, 1.00, 0.30, 2.80, 0.00, 0.02, true, null, null, true),
  (1206, 'Jackfruit (chlebowiec)', 'fruits', 'g', 95.00, 23.20, 1.70, 0.60, 1.50, 0.00, 0.20, true, null, null, false),
  (1207, 'Durian', 'fruits', 'g', 147.00, 27.10, 1.50, 5.30, 3.80, 0.00, 1.60, true, null, 'Owoce o intensywnym zapachu', false),
  (1208, 'Guawa', 'fruits', 'g', 68.00, 14.30, 2.60, 1.00, 5.40, 0.00, 0.29, true, null, null, false),
  (1209, 'Persymona (kaki)', 'fruits', 'g', 70.00, 18.60, 0.60, 0.20, 3.60, 0.00, 0.02, true, null, 'Owoc dojrzały, bez skórki', false),

  -- Owoce cytrusowe
  (1210, 'Cytryna', 'fruits', 'g', 29.00, 9.30, 1.10, 0.30, 2.80, 0.00, 0.04, true, null, 'Ze skórką lub bez', true),
  (1211, 'Limonka', 'fruits', 'g', 30.00, 10.50, 0.70, 0.20, 2.80, 0.00, 0.02, true, null, null, true),
  (1212, 'Pomelo', 'fruits', 'g', 38.00, 9.60, 0.80, 0.00, 1.00, 0.00, 0.01, true, null, null, true),
  (1213, 'Kumkwat', 'fruits', 'g', 71.00, 15.90, 1.90, 0.90, 6.50, 0.00, 0.10, true, null, 'Jedzony ze skórką', false),
  (1214, 'Klementynka', 'fruits', 'g', 47.00, 12.00, 0.90, 0.20, 1.70, 0.00, 0.02, true, null, null, false),

  -- Owoce pestkowe i jagodowe
  (1215, 'Morela', 'fruits', 'g', 48.00, 11.10, 1.40, 0.40, 2.00, 0.00, 0.03, true, null, null, false),
  (1216, 'Morela suszona', 'fruits', 'g', 241.00, 62.60, 3.40, 0.50, 7.30, 0.00, 0.02, true, null, null, false),
  (1217, 'Śliwka suszona (suszone śliwki)', 'fruits', 'g', 240.00, 63.90, 2.20, 0.40, 7.10, 0.00, 0.09, true, null, 'Suszone śliwki bez pestek', false),
  (1218, 'Figa świeża', 'fruits', 'g', 74.00, 19.20, 0.80, 0.30, 2.90, 0.00, 0.06, true, null, null, false),
  (1219, 'Figa suszona', 'fruits', 'g', 249.00, 63.90, 3.30, 0.90, 9.80, 0.00, 0.14, true, null, null, false),
  (1220, 'Żurawina świeża', 'fruits', 'g', 46.00, 12.20, 0.40, 0.10, 4.60, 0.00, 0.01, true, null, null, true),
  (1221, 'Żurawina suszona', 'fruits', 'g', 308.00, 82.40, 0.10, 1.40, 5.70, 0.00, 0.10, true, null, 'Często słodzona', false),
  (1222, 'Agrest', 'fruits', 'g', 44.00, 10.20, 0.90, 0.60, 4.30, 0.00, 0.03, true, null, null, true),
  -- (1223, 'Jeżyny' - DUPLIKAT, użyj ID 963)
  (1224, 'Porzeczki czarne', 'fruits', 'g', 63.00, 15.40, 1.40, 0.40, 0.00, 0.00, 0.03, true, null, null, false),
  (1225, 'Porzeczki czerwone', 'fruits', 'g', 56.00, 13.80, 1.40, 0.20, 4.30, 0.00, 0.02, true, null, null, false),
  (1226, 'Agrest indyjski (amla)', 'fruits', 'g', 44.00, 10.20, 0.90, 0.60, 4.30, 0.00, 0.03, true, null, 'Bogaty w witaminę C', true),

  -- Owoce egzotyczne
  (1227, 'Pitaja (smoczy owoc)', 'fruits', 'g', 50.00, 11.00, 1.10, 0.40, 3.00, 0.00, 0.04, true, null, 'Dragon fruit', false),
  (1228, 'Mangosteen', 'fruits', 'g', 73.00, 18.00, 0.40, 0.60, 1.80, 0.00, 0.05, true, null, 'Mangostana, tylko miąższ', false),
  (1229, 'Rambutan', 'fruits', 'g', 82.00, 20.90, 0.70, 0.20, 0.90, 0.00, 0.07, true, null, 'Tylko miąższ', false),
  (1230, 'Tamaryndowiec', 'fruits', 'g', 239.00, 62.50, 2.80, 0.60, 5.10, 0.00, 0.27, true, null, 'Pasta tamaryndowa', false),
  (1231, 'Cukinia żółta (golden squash)', 'fruits', 'g', 21.00, 4.90, 1.00, 0.40, 1.10, 0.00, 0.10, true, null, null, true),

  -- ===============================
  -- DODATKOWE WARZYWA (MORE VEGETABLES) - NOT LOW CARB ✗
  -- ===============================
  -- Warzywa skrobiowe
  (1240, 'Dynia hokkaido', 'vegetables', 'g', 34.00, 8.10, 0.90, 0.10, 1.50, 0.00, 0.05, true, null, 'Dynia pomarańczowa, jadalna skórka', true),
  -- DUPLIKAT USUNIETY:   (1241, 'Dynia piżmowa (butternut)', 'vegetables', 'g', 45.00, 11.70, 1.00, 0.10, 2.00, 0.00, 0.02, true, null, null, false),
  (1242, 'Dynia zwykła', 'vegetables', 'g', 26.00, 6.50, 1.00, 0.10, 0.50, 0.00, 0.06, true, null, null, true),
  (1243, 'Pasternak', 'vegetables', 'g', 75.00, 18.00, 1.20, 0.30, 4.90, 0.00, 0.05, true, null, null, false),
  (1244, 'Topinambur', 'vegetables', 'g', 73.00, 17.40, 2.00, 0.00, 1.60, 0.00, 0.01, true, null, 'Słonecznik bulwiasty', false),
  (1245, 'Korzeni lotosu', 'vegetables', 'g', 74.00, 17.20, 2.60, 0.10, 4.90, 0.00, 0.03, true, null, null, false),
  (1246, 'Maniok (kassawa)', 'vegetables', 'g', 160.00, 38.10, 1.40, 0.30, 1.80, 0.00, 0.07, true, null, 'Korzeń, gotowany', false),
  (1247, 'Taro', 'vegetables', 'g', 112.00, 26.50, 1.50, 0.10, 4.10, 0.00, 0.03, true, null, 'Korzeń, gotowany', false),
  (1248, 'Jam (pochrzyn)', 'vegetables', 'g', 118.00, 27.90, 1.50, 0.20, 4.10, 0.00, 0.04, true, null, 'Gotowany', false),

  -- Warzywa liściaste i inne low-carb
  (1250, 'Jarmuż', 'vegetables', 'g', 49.00, 8.80, 4.30, 0.90, 3.60, 0.00, 0.09, true, null, 'Kale', true),
  (1251, 'Boćwina (liście buraka)', 'vegetables', 'g', 19.00, 3.70, 1.80, 0.20, 1.60, 0.00, 0.03, true, null, null, true),
  -- DUPLIKAT USUNIETY:   (1252, 'Rukola', 'vegetables', 'g', 25.00, 3.70, 2.60, 0.70, 1.60, 0.00, 0.09, true, null, null, true),
  -- DUPLIKAT USUNIETY:   (1253, 'Endywia', 'vegetables', 'g', 17.00, 3.40, 1.30, 0.20, 3.10, 0.00, 0.05, true, null, null, true),
  (1254, 'Radicchio', 'vegetables', 'g', 23.00, 4.50, 1.40, 0.30, 0.90, 0.00, 0.04, true, null, 'Cykoria liściasta czerwona', true),
  -- DUPLIKAT USUNIETY:   (1255, 'Sałata rzymska', 'vegetables', 'g', 17.00, 3.30, 1.20, 0.30, 2.10, 0.00, 0.02, true, null, 'Romaine lettuce', true),
  -- DUPLIKAT USUNIETY:   (1256, 'Sałata masłowa', 'vegetables', 'g', 13.00, 2.20, 1.40, 0.20, 1.10, 0.00, 0.03, true, null, 'Butterhead lettuce', true),
  (1257, 'Sałata lodowa', 'vegetables', 'g', 14.00, 3.00, 0.90, 0.10, 1.20, 0.00, 0.01, true, null, 'Iceberg lettuce', true),
  -- DUPLIKAT USUNIETY:   (1258, 'Pak choi', 'vegetables', 'g', 13.00, 2.20, 1.50, 0.20, 1.00, 0.00, 0.03, true, null, 'Bok choy', true),
  (1259, 'Kapusta pekińska', 'vegetables', 'g', 12.00, 2.20, 1.20, 0.20, 1.20, 0.00, 0.02, true, null, 'Napa cabbage', true),
  (1260, 'Kapusta włoska', 'vegetables', 'g', 31.00, 7.40, 2.00, 0.10, 2.50, 0.00, 0.02, true, null, 'Savoy cabbage', true),
  -- DUPLIKAT USUNIETY:   (1261, 'Kapusta czerwona', 'vegetables', 'g', 31.00, 7.40, 1.40, 0.20, 2.10, 0.00, 0.03, true, null, null, true),
  -- Cebule i korzenie
  (1262, 'Szalotka', 'vegetables', 'g', 72.00, 16.80, 2.50, 0.10, 3.20, 0.00, 0.02, true, null, null, false),
  (1263, 'Dymka (cebula szczypiorowa)', 'vegetables', 'g', 32.00, 7.30, 1.80, 0.20, 2.60, 0.00, 0.04, true, null, null, true),
  (1264, 'Szczypiorek', 'vegetables', 'g', 30.00, 4.40, 3.30, 0.70, 2.50, 0.00, 0.15, true, null, null, true),
  -- DUPLIKAT USUNIETY:   (1265, 'Rzepa', 'vegetables', 'g', 28.00, 6.40, 0.90, 0.10, 1.80, 0.00, 0.01, true, null, null, true),
  (1266, 'Brukiew', 'vegetables', 'g', 37.00, 8.60, 1.10, 0.20, 2.30, 0.00, 0.03, true, null, 'Kalarépa', true),
  (1267, 'Kalarepa', 'vegetables', 'g', 27.00, 6.20, 1.70, 0.10, 3.60, 0.00, 0.01, true, null, null, true),
  (1268, 'Chrzan', 'vegetables', 'g', 48.00, 11.30, 1.20, 0.70, 3.30, 0.00, 0.03, true, null, 'Korzeń tarty', false),
  (1269, 'Imbir świeży', 'vegetables', 'g', 80.00, 17.80, 1.80, 0.80, 2.00, 0.00, 0.20, true, null, 'Korzeń imbiru', false),

  -- Warzywa kapustne
  -- DUPLIKAT USUNIETY:   (1270, 'Brukselka', 'vegetables', 'g', 43.00, 9.00, 3.40, 0.30, 3.80, 0.00, 0.06, true, null, 'Brussels sprouts', true),
  (1271, 'Kapusta włoska (savoy)', 'vegetables', 'g', 27.00, 6.10, 2.00, 0.10, 3.10, 0.00, 0.02, true, null, null, true),
  (1272, 'Brokułki baby', 'vegetables', 'g', 34.00, 7.20, 2.80, 0.40, 2.60, 0.00, 0.04, true, null, 'Tenderstem broccoli', true),
  (1273, 'Bimi (broccolini)', 'vegetables', 'g', 34.00, 6.00, 3.00, 0.40, 3.50, 0.00, 0.05, true, null, null, true),

  -- ===============================
  -- DODATKOWE PRODUKTY ZBOŻOWE I MĄCZNE (MORE GRAINS) - NOT LOW CARB ✗
  -- ===============================
  (1280, 'Kasza pęczak (jęczmienna)', 'flours', 'g', 352.00, 73.50, 9.90, 2.30, 15.60, 0.00, 0.48, true, null, null, false),
  (1281, 'Kasza kuskus', 'flours', 'g', 376.00, 77.40, 12.80, 0.60, 5.00, 0.00, 0.10, true, null, null, false),
  (1282, 'Kasza bulgur', 'flours', 'g', 342.00, 75.90, 12.30, 1.30, 12.50, 0.00, 0.23, true, null, null, false),
  (1283, 'Kasza manna', 'flours', 'g', 360.00, 72.80, 12.70, 1.10, 3.90, 0.00, 0.15, true, null, null, false),
  (1284, 'Orkisz (ziarno)', 'flours', 'g', 338.00, 70.20, 14.60, 2.40, 10.70, 0.00, 0.41, true, null, null, false),
  (1285, 'Amarantus (ziarno)', 'flours', 'g', 371.00, 65.30, 13.60, 7.00, 6.70, 0.00, 1.46, true, null, null, false),
  (1286, 'Proso (ziarno millet)', 'flours', 'g', 378.00, 72.80, 11.00, 4.20, 8.50, 0.00, 0.72, true, null, null, false),
  (1287, 'Sorgo (ziarno)', 'flours', 'g', 329.00, 72.10, 10.60, 3.50, 6.70, 0.00, 0.61, true, null, null, false),
  (1288, 'Teff (ziarno)', 'flours', 'g', 367.00, 73.10, 13.30, 2.40, 8.00, 0.00, 0.45, true, null, 'Etiopskie zboże bezglutenowe', false),

  -- Makarony i produkty pszenne
  (1290, 'Makaron ryżowy', 'flours', 'g', 360.00, 83.20, 3.40, 0.60, 1.60, 0.00, 0.15, true, null, null, false),
  (1291, 'Makaron soba (gryczany)', 'flours', 'g', 336.00, 74.60, 14.40, 0.70, 3.00, 0.00, 0.12, true, null, null, false),
  (1292, 'Makaron udon', 'flours', 'g', 337.00, 73.50, 8.60, 0.60, 2.40, 0.00, 0.10, true, null, null, false),
  (1293, 'Makaron ramen', 'flours', 'g', 436.00, 64.30, 10.00, 16.00, 2.00, 0.00, 6.50, true, null, 'Z jajkiem, smażony', false),
  (1294, 'Makaron jajeczny', 'flours', 'g', 384.00, 71.30, 14.20, 4.40, 3.30, 0.00, 0.95, true, null, null, false),
  (1295, 'Lasagne (płaty suche)', 'flours', 'g', 371.00, 74.70, 13.00, 1.50, 3.20, 0.00, 0.28, true, null, null, false),
  (1296, 'Pierogi ruskie (gotowe)', 'flours', 'g', 210.00, 35.00, 7.00, 5.00, 2.00, 0.00, 2.20, true, null, 'Z serem i ziemniakami', false),
  (1297, 'Kluski śląskie', 'flours', 'g', 150.00, 32.00, 3.00, 0.50, 1.50, 0.00, 0.15, true, null, null, false),
  (1298, 'Kopytka', 'flours', 'g', 160.00, 33.00, 4.00, 1.00, 1.80, 0.00, 0.30, true, null, null, false),

  -- Chleby i wypieki
  (1300, 'Chleb tostowy', 'flours', 'g', 261.00, 48.00, 9.00, 4.00, 2.40, 0.00, 0.85, true, null, null, false),
  (1301, 'Chleb pumpernikiel', 'flours', 'g', 250.00, 47.50, 8.70, 3.30, 6.50, 0.00, 0.50, true, null, 'Chleb westfalski', false),
  (1302, 'Chleb graham', 'flours', 'g', 254.00, 48.00, 10.00, 2.50, 4.00, 0.00, 0.45, true, null, null, false),
  (1303, 'Chleb wieloziarnisty', 'flours', 'g', 250.00, 45.00, 10.50, 4.50, 5.50, 0.00, 0.65, true, null, null, false),
  (1304, 'Bagietka', 'flours', 'g', 274.00, 55.40, 10.30, 1.40, 2.40, 0.00, 0.30, true, null, 'Chleb francuski', false),
  (1305, 'Ciabatta', 'flours', 'g', 271.00, 55.00, 9.00, 2.50, 2.50, 0.00, 0.55, true, null, null, false),
  (1306, 'Focaccia', 'flours', 'g', 271.00, 44.00, 8.00, 8.00, 2.20, 0.00, 1.20, true, null, 'Z oliwą', false),
  (1307, 'Pita', 'flours', 'g', 275.00, 55.70, 9.10, 1.20, 2.20, 0.00, 0.17, false, null, 'Chleb arabski', false),
  (1308, 'Naan', 'flours', 'g', 291.00, 50.60, 9.60, 5.40, 2.10, 0.00, 1.20, false, null, 'Chleb indyjski', false),
  (1309, 'Lavash', 'flours', 'g', 275.00, 56.00, 9.50, 1.40, 2.00, 0.00, 0.20, false, null, 'Chleb ormiański', false),
  (1310, 'Chapati', 'flours', 'g', 297.00, 58.60, 8.80, 3.60, 4.00, 0.00, 0.70, false, null, 'Chleb indyjski pełnoziarnisty', false),

  -- Płatki śniadaniowe
  (1315, 'Cornflakes', 'flours', 'g', 378.00, 84.00, 7.00, 0.90, 3.30, 0.00, 0.18, true, null, 'Płatki kukurydziane', false),
  (1316, 'Musli (bez cukru)', 'flours', 'g', 367.00, 66.00, 9.50, 8.00, 8.00, 0.00, 1.30, true, null, null, false),
  (1317, 'Granola', 'flours', 'g', 471.00, 64.40, 10.30, 20.30, 5.30, 0.00, 3.20, true, null, 'Z miodem i orzechami', false),
  (1318, 'Otręby pszenne', 'flours', 'g', 216.00, 64.50, 15.60, 4.30, 42.80, 0.00, 0.63, true, null, 'Wysokie błonnik', false),
  (1319, 'Otręby owsiane', 'flours', 'g', 246.00, 66.20, 17.30, 7.00, 15.40, 0.00, 1.30, true, null, null, false),

  -- ===============================
  -- SŁODYCZE I PRZEKĄSKI (SWEETS & SNACKS) - NOT LOW CARB ✗
  -- ===============================
  (1330, 'Czekolada mleczna', 'sweeteners', 'g', 535.00, 59.40, 7.60, 29.70, 2.30, 0.00, 18.50, true, null, null, false),
  (1331, 'Czekolada gorzka 70%', 'sweeteners', 'g', 598.00, 45.90, 7.80, 42.60, 10.90, 0.00, 24.50, true, null, 'Może być low-carb przy małych ilościach', false),
  (1332, 'Czekolada biała', 'sweeteners', 'g', 539.00, 59.20, 5.90, 32.10, 0.00, 0.00, 19.40, true, null, null, false),
  (1333, 'Lody waniliowe', 'dairy', 'g', 207.00, 23.60, 3.50, 11.00, 0.70, 0.00, 6.80, true, null, null, false),
  (1334, 'Lody czekoladowe', 'dairy', 'g', 216.00, 28.20, 3.80, 11.00, 1.80, 0.00, 6.80, true, null, null, false),
  (1335, 'Sorbet owocowy', 'sweeteners', 'g', 97.00, 25.00, 0.20, 0.00, 0.40, 0.00, 0.00, true, null, null, false),
  (1336, 'Biszkopty', 'flours', 'g', 353.00, 79.00, 7.00, 1.50, 1.00, 0.00, 0.50, true, null, null, false),
  (1337, 'Herbatniki', 'flours', 'g', 455.00, 69.60, 6.80, 17.00, 2.20, 0.00, 8.50, true, null, null, false),
  (1338, 'Ciastka owsiane', 'flours', 'g', 450.00, 65.00, 7.00, 18.50, 3.50, 0.00, 4.50, true, null, null, false),
  (1339, 'Wafle ryżowe', 'flours', 'g', 387.00, 81.50, 8.00, 3.50, 4.20, 0.00, 0.70, true, null, null, false),
  (1340, 'Paluszki (słone)', 'flours', 'g', 381.00, 75.20, 10.00, 4.20, 2.70, 0.00, 1.80, true, null, null, false),
  (1341, 'Krakersy', 'flours', 'g', 492.00, 60.20, 8.50, 24.00, 2.50, 0.00, 5.50, true, null, null, false),
  (1342, 'Popcorn (bez masła)', 'flours', 'g', 387.00, 77.80, 12.90, 4.50, 14.50, 0.00, 0.64, true, null, null, false),
  (1343, 'Chipsy ziemniaczane', 'other', 'g', 536.00, 52.90, 7.00, 34.60, 4.80, 0.00, 3.10, true, null, 'Smażone na oleju', false),
  (1344, 'Nachos (chipsy kukurydziane)', 'other', 'g', 489.00, 60.90, 7.40, 25.60, 5.20, 0.00, 3.80, true, null, null, false),
  (1345, 'Ptysie z kremem', 'other', 'g', 334.00, 26.00, 7.00, 22.00, 0.50, 0.00, 13.00, true, null, null, false),
  (1346, 'Pączek z lukrem', 'other', 'g', 421.00, 48.00, 6.00, 23.00, 1.50, 0.00, 11.00, false, null, null, false),
  (1347, 'Drożdżówka z serem', 'other', 'g', 330.00, 42.00, 8.00, 14.00, 1.20, 0.00, 7.50, false, null, null, false),
  (1348, 'Rogalik croissant', 'flours', 'g', 406.00, 45.80, 8.20, 21.00, 2.60, 0.00, 11.80, false, null, 'Z masłem', false),

  -- Desery i ciasta
  (1350, 'Sernik', 'dairy', 'g', 321.00, 25.00, 6.00, 22.00, 0.50, 0.00, 12.00, true, null, 'Tradycyjny', false),
  (1351, 'Szarlotka', 'other', 'g', 265.00, 42.00, 3.00, 10.00, 1.80, 0.00, 4.50, true, null, 'Z jabłkami', false),
  (1352, 'Brownie', 'other', 'g', 466.00, 54.00, 5.80, 26.00, 2.80, 0.00, 14.00, true, null, 'Czekoladowe', false),
  (1353, 'Tiramisu', 'dairy', 'g', 283.00, 29.00, 5.00, 16.00, 0.50, 0.00, 9.50, true, null, null, false),
  (1354, 'Panna cotta', 'dairy', 'g', 240.00, 23.00, 3.50, 15.00, 0.00, 0.00, 9.30, true, null, 'Z bitą śmietaną', false),
  (1355, 'Budyń waniliowy', 'dairy', 'g', 110.00, 18.00, 3.00, 3.00, 0.00, 0.00, 1.80, true, null, 'Gotowy', false),
  (1356, 'Galaretka owocowa', 'sweeteners', 'g', 62.00, 15.40, 1.70, 0.00, 0.00, 0.00, 0.00, true, null, 'Z cukrem', false),

  -- ===============================
  -- NAPOJE SŁODKIE (SWEET BEVERAGES) - NOT LOW CARB ✗
  -- ===============================
  (1360, 'Coca-Cola', 'beverages', 'ml', 42.00, 10.60, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Napój gazowany', false),
  (1361, 'Pepsi', 'beverages', 'ml', 43.00, 11.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, null, false),
  (1362, 'Fanta', 'beverages', 'ml', 39.00, 10.30, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, null, false),
  (1363, 'Sprite', 'beverages', 'ml', 41.00, 10.20, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, null, false),
  (1364, 'Red Bull', 'beverages', 'ml', 45.00, 11.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Energy drink', false),
  (1365, 'Monster Energy', 'beverages', 'ml', 47.00, 11.50, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, null, false),
  (1366, 'Nektar wieloowocowy', 'beverages', 'ml', 54.00, 13.00, 0.30, 0.10, 0.30, 0.00, 0.01, true, null, 'Z cukrem', false),
  (1367, 'Sok winogronowy', 'beverages', 'ml', 60.00, 15.00, 0.40, 0.10, 0.20, 0.00, 0.02, true, null, null, false),
  (1368, 'Sok grejpfrutowy', 'beverages', 'ml', 39.00, 9.00, 0.50, 0.10, 0.10, 0.00, 0.01, true, null, null, true),
  (1369, 'Sok ananasowy', 'beverages', 'ml', 53.00, 12.90, 0.40, 0.10, 0.20, 0.00, 0.01, true, null, null, false),
  (1370, 'Sok marchewkowy', 'beverages', 'ml', 40.00, 9.30, 0.90, 0.10, 0.80, 0.00, 0.02, true, null, null, true),
  (1371, 'Sok pomidorowy', 'beverages', 'ml', 17.00, 3.50, 0.80, 0.10, 0.40, 0.00, 0.01, true, null, null, true),
  (1372, 'Smoothie bananowe', 'beverages', 'ml', 89.00, 21.00, 1.50, 0.40, 1.80, 0.00, 0.15, true, null, 'Z mlekiem', false),
  (1373, 'Shake proteinowy (gotowy)', 'beverages', 'ml', 70.00, 5.00, 10.00, 1.50, 0.50, 0.00, 0.50, true, null, 'Zależy od marki', true),
  (1374, 'Mleko czekoladowe', 'dairy', 'ml', 83.00, 10.40, 3.40, 3.40, 0.50, 0.00, 2.10, true, null, null, false),
  (1375, 'Kawa latte (z cukrem)', 'beverages', 'ml', 56.00, 8.00, 2.50, 2.00, 0.00, 0.00, 1.20, true, null, 'Ze słodzonym mlekiem', true),
  (1376, 'Cappuccino (z cukrem)', 'beverages', 'ml', 45.00, 6.00, 2.00, 1.80, 0.00, 0.00, 1.10, true, null, null, true),
  (1377, 'Herbata z miodem', 'beverages', 'ml', 32.00, 8.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, '1 łyżeczka miodu na 200ml', true),
  (1378, 'Lemoniada domowa', 'beverages', 'ml', 40.00, 10.50, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Z cukrem', false),
  (1379, 'Oranżada', 'beverages', 'ml', 39.00, 9.80, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, null, true),

  -- ===============================
  -- DODATKOWE ROŚLINY STRĄCZKOWE (MORE LEGUMES) - NOT LOW CARB ✗
  -- ===============================
  (1380, 'Fasola czarna (gotowana)', 'vegetables', 'g', 132.00, 23.70, 8.90, 0.50, 8.70, 0.00, 0.13, true, null, null, false),
  (1381, 'Fasola pinto (gotowana)', 'vegetables', 'g', 143.00, 26.20, 9.00, 0.60, 9.00, 0.00, 0.12, true, null, 'Fasola meksykańska', false),
  (1382, 'Fasola lima (gotowana)', 'vegetables', 'g', 115.00, 20.90, 7.80, 0.40, 7.00, 0.00, 0.09, true, null, null, false),
  (1383, 'Fasola adzuki (gotowana)', 'vegetables', 'g', 128.00, 24.80, 7.50, 0.10, 7.30, 0.00, 0.03, true, null, 'Fasola japońska', false),
  (1384, 'Fasola mung (gotowana)', 'vegetables', 'g', 105.00, 19.10, 7.00, 0.40, 7.60, 0.00, 0.11, true, null, 'Fasolka złota', false),
  (1385, 'Groch łuskany (gotowany)', 'vegetables', 'g', 118.00, 21.10, 8.30, 0.40, 8.30, 0.00, 0.06, true, null, null, false),
  (1386, 'Bób (gotowany)', 'vegetables', 'g', 110.00, 19.70, 7.60, 0.40, 5.40, 0.00, 0.07, true, null, null, false),
  (1387, 'Lupinus (łubin, gotowany)', 'vegetables', 'g', 119.00, 9.90, 15.60, 2.90, 2.80, 0.00, 0.35, true, null, 'Relatywnie low-carb', true),

  -- ===============================
  -- PRZETWORY I KONSERWY (PROCESSED & CANNED) - variable
  -- ===============================
  (1390, 'Kukurydza konserwowa (słodka)', 'vegetables', 'g', 79.00, 17.10, 2.50, 1.00, 2.00, 0.00, 0.15, true, null, null, false),
  (1391, 'Groszek konserwowy', 'vegetables', 'g', 69.00, 12.60, 4.40, 0.30, 4.10, 0.00, 0.05, true, null, null, true),
  (1392, 'Fasola konserwowa (w sosie pomidorowym)', 'vegetables', 'g', 94.00, 17.80, 5.20, 0.50, 5.50, 0.00, 0.08, true, null, 'Baked beans', false),
  (1393, 'Ogórki konserwowe', 'vegetables', 'g', 11.00, 2.30, 0.30, 0.10, 0.50, 0.00, 0.02, true, null, null, true),
  (1394, 'Kapusta kiszona', 'vegetables', 'g', 19.00, 4.30, 0.90, 0.10, 2.90, 0.00, 0.03, true, null, 'Probiotyk', true),
  (1395, 'Kimchi', 'vegetables', 'g', 15.00, 2.40, 1.10, 0.50, 1.60, 0.00, 0.07, true, null, 'Kapusta koreańska', true),
  (1396, 'Oliwki zielone', 'vegetables', 'g', 145.00, 3.80, 1.00, 15.30, 3.30, 0.00, 2.00, true, null, null, true),
  (1397, 'Oliwki czarne', 'vegetables', 'g', 115.00, 6.30, 0.80, 10.70, 3.20, 0.00, 1.40, true, null, null, true),
  (1398, 'Kapary', 'vegetables', 'g', 23.00, 4.90, 2.40, 0.90, 3.20, 0.00, 0.23, true, null, null, true),
  (1399, 'Korniszony', 'vegetables', 'g', 11.00, 2.30, 0.30, 0.20, 1.20, 0.00, 0.05, true, null, null, true),

  -- Pomidory przetworzone
  (1400, 'Pomidory krojone (puszka)', 'vegetables', 'g', 21.00, 4.00, 1.00, 0.20, 1.00, 0.00, 0.03, true, null, null, true),
  (1401, 'Passata (przecier pomidorowy)', 'vegetables', 'g', 24.00, 4.50, 1.20, 0.10, 1.30, 0.00, 0.02, true, null, null, true),
  (1402, 'Koncentrat pomidorowy', 'vegetables', 'g', 82.00, 18.90, 4.30, 0.50, 4.10, 0.00, 0.07, true, null, null, false),
  (1403, 'Suszone pomidory (w oleju)', 'vegetables', 'g', 213.00, 23.30, 5.10, 14.00, 5.80, 0.00, 2.00, true, null, null, false),

  -- ===============================
  -- DANIA GOTOWE I FAST FOOD - NOT LOW CARB ✗
  -- ===============================
  (1410, 'Pizza margherita', 'other', 'g', 266.00, 33.00, 11.00, 10.00, 2.30, 0.00, 4.50, true, null, 'Średnia wartość', false),
  (1411, 'Burger wołowy (bułka + mięso)', 'other', 'g', 250.00, 24.00, 13.00, 12.00, 1.50, 0.00, 4.80, false, null, null, false),
  (1412, 'Hot dog', 'other', 'g', 290.00, 24.00, 11.00, 17.00, 1.00, 0.00, 6.50, false, null, 'Z bułką i parówką', false),
  (1413, 'Frytki', 'other', 'g', 312.00, 41.40, 3.40, 14.70, 3.80, 0.00, 2.30, true, null, 'Smażone na oleju', false),
  (1414, 'Nuggetsy z kurczaka', 'meat', 'g', 296.00, 16.00, 15.00, 19.00, 0.80, 0.00, 4.20, true, null, 'W panierce', false),
  (1415, 'Kebab w picie', 'other', 'g', 215.00, 22.00, 12.00, 9.00, 1.50, 0.00, 3.50, true, null, null, false),
  (1416, 'Sushi maki (ryż + ryba)', 'other', 'g', 145.00, 28.00, 5.50, 0.80, 0.60, 0.00, 0.15, true, null, 'Z ryżem', false),
  (1417, 'Spring rolls (sajgonki)', 'other', 'g', 210.00, 25.00, 5.00, 10.00, 1.50, 0.00, 2.50, true, null, 'Smażone', false),
  (1418, 'Pad thai', 'other', 'g', 150.00, 20.00, 8.00, 5.00, 1.20, 0.00, 0.90, true, null, 'Makaron ryżowy z kurczakiem', false),
  (1419, 'Fried rice (smażony ryż)', 'other', 'g', 163.00, 24.00, 4.50, 5.50, 0.80, 0.00, 1.00, true, null, null, false),
  (1420, 'Naleśniki z serem', 'other', 'g', 196.00, 23.00, 9.00, 8.00, 0.70, 0.00, 4.50, true, null, null, false),
  (1421, 'Racuchy z jabłkami', 'other', 'g', 220.00, 32.00, 5.00, 8.00, 1.20, 0.00, 2.00, true, null, null, false),
  (1422, 'Zapiekanka', 'other', 'g', 180.00, 22.00, 7.00, 7.00, 1.50, 0.00, 3.20, true, null, 'Polska przekąska', false),

  -- ===============================
  -- PRODUKTY MLECZNE SŁODKIE - NOT LOW CARB ✗
  -- ===============================
  (1430, 'Jogurt owocowy', 'dairy', 'g', 95.00, 15.00, 4.00, 2.50, 0.30, 0.00, 1.60, true, null, 'Z cukrem i owocami', false),
  (1431, 'Serek waniliowy (Danio)', 'dairy', 'g', 130.00, 14.00, 7.50, 5.00, 0.00, 0.00, 3.20, true, null, null, false),
  (1432, 'Monte (serek)', 'dairy', 'g', 140.00, 15.00, 4.00, 7.50, 0.30, 0.00, 4.80, true, null, 'Serek czekoladowo-orzechowy', false),
  (1433, 'Śmietanka do kawy (słodzona)', 'dairy', 'ml', 195.00, 15.00, 2.00, 14.00, 0.00, 0.00, 8.80, true, null, null, false),
  (1434, 'Krem mascarpone', 'dairy', 'g', 429.00, 3.20, 4.80, 44.80, 0.00, 0.00, 28.00, true, null, 'Do tiramisu', true),
  (1435, 'Mleko skondensowane (słodzone)', 'dairy', 'g', 321.00, 54.40, 7.90, 8.70, 0.00, 0.00, 5.50, true, null, null, false),
  (1436, 'Mleko w proszku', 'dairy', 'g', 496.00, 38.40, 26.30, 26.70, 0.00, 0.00, 16.70, true, null, 'Pełne', false),

  -- ===============================
  -- SOSY I DRESSINGI - variable
  -- ===============================
  (1440, 'Sos barbecue', 'condiments', 'g', 172.00, 41.00, 1.00, 0.60, 0.50, 0.00, 0.10, true, null, null, false),
  (1441, 'Sos słodko-kwaśny', 'condiments', 'g', 150.00, 37.00, 0.30, 0.10, 0.30, 0.00, 0.02, true, null, null, false),
  (1442, 'Sos teriyaki', 'condiments', 'ml', 89.00, 16.00, 5.90, 0.00, 0.10, 0.00, 0.00, true, null, null, false),
  (1443, 'Sos hoisin', 'condiments', 'g', 220.00, 44.00, 3.20, 3.40, 1.70, 0.00, 0.55, true, null, 'Sos chiński', false),
  (1444, 'Sos ostrygowy', 'condiments', 'ml', 51.00, 11.00, 1.40, 0.00, 0.00, 0.00, 0.00, true, null, null, false),
  (1445, 'Dressing caesar', 'condiments', 'g', 350.00, 4.00, 2.50, 36.00, 0.20, 0.00, 5.50, true, null, null, true),
  (1446, 'Dressing winegret', 'condiments', 'ml', 280.00, 8.00, 0.30, 28.00, 0.00, 0.00, 3.80, true, null, null, true),
  (1447, 'Sos ranch', 'condiments', 'g', 340.00, 6.00, 1.50, 35.00, 0.30, 0.00, 5.30, true, null, null, true),
  (1448, 'Sos tysiąca wysp', 'condiments', 'g', 320.00, 15.00, 1.00, 29.00, 0.50, 0.00, 4.50, true, null, null, false),
  (1449, 'Ajvar', 'condiments', 'g', 73.00, 8.00, 1.00, 4.00, 1.50, 0.00, 0.50, true, null, 'Pasta paprykowa', true),
  (1450, 'Harissa', 'condiments', 'g', 83.00, 9.00, 2.00, 4.50, 3.00, 0.00, 0.60, true, null, 'Pasta chili', true),

  -- ===============================
  -- NAPOJE ZERO/LIGHT - low-carb friendly
  -- ===============================
  (1500, 'Cola zero/light (generyczna)', 'beverages', 'ml', 0.40, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Napój gazowany bez cukru', true),
  (1501, 'Napój energetyczny zero', 'beverages', 'ml', 3.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Monster Zero, Red Bull Zero itp.', true),
  (1502, 'Woda smakowa zero', 'beverages', 'ml', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Woda z aromatem bez kalorii', true),
  (1503, 'Herbata mrożona zero', 'beverages', 'ml', 1.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Bez cukru', true),
  (1504, 'Lemoniada zero', 'beverages', 'ml', 2.00, 0.30, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Lemoniada ze słodzikami', true),
  (1505, 'Napój izotoniczny zero', 'beverages', 'ml', 5.00, 1.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Powerade Zero, Gatorade Zero', true),
  (1506, 'Tonik zero/light', 'beverages', 'ml', 1.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Schweppes Zero itp.', true),
  (1507, 'Sprite/7Up zero', 'beverages', 'ml', 0.40, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Napój cytrynowy bez cukru', true),

  -- ===============================
  -- NABIAŁ WYSOKOBIAŁKOWY - dairy
  -- ===============================
  (1510, 'Jogurt proteinowy (generyczny)', 'dairy', 'g', 55.00, 4.00, 10.00, 0.10, 0.00, 0.00, 0.05, true, null, 'Skyr, jogurt wysokobiałkowy', true),
  (1511, 'Serek wysokobiałkowy', 'dairy', 'g', 70.00, 3.50, 12.00, 0.50, 0.00, 0.00, 0.30, true, null, 'Typu Pilos Protein, Lidl', true),
  (1512, 'Twaróg ziarnisty light', 'dairy', 'g', 52.00, 1.80, 10.00, 0.50, 0.00, 0.00, 0.30, true, null, 'Cottage cheese niskotłuszczowy', true),
  (1513, 'Mleko proteinowe', 'beverages', 'ml', 50.00, 3.00, 6.00, 1.50, 0.00, 0.00, 1.00, true, null, 'Mleko z dodatkiem białka', true),
  (1514, 'Pudding proteinowy', 'dairy', 'g', 75.00, 8.00, 10.00, 1.00, 0.50, 0.00, 0.60, true, null, 'Gotowy pudding wysokobiałkowy', true),
  (1515, 'Deser proteinowy', 'dairy', 'g', 90.00, 10.00, 8.00, 2.50, 0.30, 0.00, 1.50, true, null, 'Mus proteinowy, krem', true),
  (1516, 'Kefir proteinowy', 'dairy', 'ml', 45.00, 3.50, 8.00, 0.10, 0.00, 0.00, 0.05, true, null, 'Kefir z dodatkiem białka', true),
  (1517, 'Maślanka proteinowa', 'dairy', 'ml', 40.00, 4.00, 6.00, 0.10, 0.00, 0.00, 0.05, true, null, 'Maślanka wysokobiałkowa', true),
  (1518, 'Ser topiony light', 'dairy', 'g', 150.00, 5.00, 12.00, 10.00, 0.00, 0.00, 6.50, true, null, 'Kremowy ser niskotłuszczowy', true),

  -- ===============================
  -- SUPLEMENTY I PRODUKTY PROTEINOWE - other
  -- ===============================
  (1530, 'Białko serwatkowe WPC (generyczne)', 'other', 'g', 380.00, 4.00, 80.00, 5.00, 0.00, 0.00, 2.00, true, null, 'Koncentrat białka serwatkowego', true),
  (1531, 'Białko serwatkowe WPI (generyczne)', 'other', 'g', 370.00, 1.50, 90.00, 0.50, 0.00, 0.00, 0.20, true, null, 'Izolat białka serwatkowego', true),
  (1532, 'Kazeina (generyczna)', 'other', 'g', 370.00, 3.00, 85.00, 1.50, 0.00, 0.00, 0.80, true, null, 'Białko kazeinowe', true),
  (1533, 'Baton proteinowy (generyczny)', 'other', 'g', 350.00, 25.00, 30.00, 12.00, 3.00, 8.00, 5.00, true, null, 'Średnia wartość batonów protein', true),
  (1534, 'Baton proteinowy keto', 'other', 'g', 380.00, 8.00, 25.00, 25.00, 4.00, 5.00, 8.00, true, null, 'Baton niskowęglowodanowy', true),
  (1535, 'Kolagen w proszku', 'other', 'g', 340.00, 0.00, 85.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Hydrolizat kolagenu', true),
  (1536, 'BCAA w proszku', 'other', 'g', 0.00, 0.00, 100.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Aminokwasy rozgałęzione', true),

  -- ===============================
  -- PRODUKTY WEGAŃSKIE/ROŚLINNE - variable
  -- ===============================
  (1540, 'Tofu wędzone', 'other', 'g', 170.00, 1.50, 17.00, 11.00, 0.50, 0.00, 1.60, true, null, 'Tofu wędzony blok', true),
  -- DUPLIKAT USUNIETY:   (1541, 'Tempeh', 'other', 'g', 195.00, 7.60, 20.00, 11.00, 0.00, 0.00, 2.50, true, null, 'Fermentowana soja', true),
  (1542, 'Seitan', 'other', 'g', 370.00, 14.00, 75.00, 1.90, 0.60, 0.00, 0.30, true, null, 'Gluten pszenny, białko roślinne', false),
  (1543, 'Mleko migdałowe bez cukru', 'beverages', 'ml', 13.00, 0.00, 0.40, 1.10, 0.00, 0.00, 0.10, true, null, 'Napój migdałowy unsweetened', true),
  (1544, 'Mleko kokosowe (do picia)', 'beverages', 'ml', 20.00, 0.00, 0.20, 2.00, 0.00, 0.00, 1.80, true, null, 'Napój kokosowy bez cukru', true),
  (1545, 'Mleko sojowe bez cukru', 'beverages', 'ml', 33.00, 0.50, 3.30, 1.80, 0.40, 0.00, 0.30, true, null, 'Napój sojowy unsweetened', true),
  (1546, 'Jogurt kokosowy', 'dairy', 'g', 185.00, 6.00, 1.50, 18.00, 0.30, 0.00, 16.00, true, null, 'Na bazie mleczka kokosowego', true),
  (1547, 'Kotlet sojowy (generyczny)', 'other', 'g', 200.00, 10.00, 18.00, 10.00, 3.00, 0.00, 1.50, true, null, 'Burger roślinny', true),
  (1548, 'Kiełbasa wegetariańska', 'other', 'g', 180.00, 8.00, 16.00, 10.00, 2.00, 0.00, 1.20, true, null, 'Na bazie białka roślinnego', true),

  -- ===============================
  -- PIECZYWO I MAKARONY FIT - flours
  -- ===============================
  (1550, 'Chleb keto (generyczny)', 'flours', 'g', 200.00, 5.00, 12.00, 14.00, 8.00, 0.00, 2.00, true, null, 'Chleb niskowęglowodanowy', true),
  (1551, 'Chleb proteinowy', 'flours', 'g', 250.00, 15.00, 25.00, 8.00, 6.00, 0.00, 1.50, true, null, 'Pieczywo wysokobiałkowe', true),
  (1552, 'Tortilla niskowęglowodanowa', 'flours', 'g', 180.00, 8.00, 10.00, 8.00, 15.00, 0.00, 1.00, true, null, 'Wrap low-carb', true),
  (1553, 'Makaron konjac (shirataki)', 'flours', 'g', 10.00, 0.00, 0.00, 0.00, 3.00, 0.00, 0.00, true, null, 'Makaron z glucomannan', true),
  (1554, 'Makaron z soczewicy', 'flours', 'g', 344.00, 52.00, 26.00, 1.40, 8.00, 0.00, 0.20, true, null, 'Makaron z mąki soczewicowej', false),
  (1555, 'Makaron z ciecierzycy', 'flours', 'g', 350.00, 55.00, 19.00, 5.50, 10.00, 0.00, 0.80, true, null, 'Pasta z mąki z ciecierzycy', false),
  (1556, 'Bułka keto', 'flours', 'g', 220.00, 4.00, 14.00, 16.00, 10.00, 0.00, 2.50, true, null, 'Bułka niskowęglowodanowa', true),
  (1557, 'Chleb bezglutenowy', 'flours', 'g', 240.00, 48.00, 3.50, 3.00, 3.50, 0.00, 0.50, true, null, 'Pieczywo bez glutenu', false),
  (1558, 'Chleb orkiszowy', 'flours', 'g', 235.00, 45.00, 9.00, 1.50, 4.00, 0.00, 0.30, true, null, 'Pieczywo z mąki orkiszowej', false),

  -- ===============================
  -- SOSY FIT - condiments
  -- ===============================
  (1560, 'Sos zero kalorii (generyczny)', 'condiments', 'ml', 5.00, 1.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Syrop/sos bez kalorii', true),
  (1561, 'Dressing zero kalorii', 'condiments', 'ml', 8.00, 2.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Sos sałatkowy bez kalorii', true),
  (1562, 'Ketchup zero', 'condiments', 'g', 20.00, 4.00, 0.50, 0.10, 0.30, 0.00, 0.02, true, null, 'Ketchup bez cukru', true),
  (1563, 'Syrop klonowy zero', 'condiments', 'ml', 5.00, 0.00, 0.00, 0.00, 0.00, 4.00, 0.00, true, null, 'Bez cukru, z erytrytolem', true),
  (1564, 'Syrop czekoladowy zero', 'condiments', 'ml', 10.00, 2.00, 1.00, 0.50, 1.00, 3.00, 0.30, true, null, 'Polewa bez cukru', true),
  (1565, 'Dżem zero kalorii', 'condiments', 'g', 15.00, 3.00, 0.20, 0.00, 0.50, 2.00, 0.00, true, null, 'Dżem ze słodzikami', true),
  (1566, 'Majonez light', 'condiments', 'g', 350.00, 5.00, 1.00, 36.00, 0.00, 0.00, 3.50, true, null, 'Majonez o obniżonej kaloryczności', true),

  -- ===============================
  -- FAST FOOD - GENERYCZNE - other
  -- ===============================
  (1570, 'Hamburger (generyczny)', 'other', 'g', 250.00, 24.00, 13.00, 12.00, 1.50, 0.00, 5.00, false, null, 'Średnia wartość burgera', false),
  (1571, 'Cheeseburger (generyczny)', 'other', 'g', 270.00, 23.00, 15.00, 14.00, 1.00, 0.00, 6.50, false, null, 'Burger z serem', false),
  (1572, 'Frytki (generyczne)', 'other', 'g', 312.00, 41.00, 3.40, 15.00, 3.80, 0.00, 2.30, false, null, 'Frytki z restauracji', false),
  -- DUPLIKAT USUNIETY:   (1573, 'Nuggetsy z kurczaka', 'other', 'g', 296.00, 16.00, 16.00, 18.00, 1.00, 0.00, 3.50, false, null, 'Kawałki kurczaka w panierce', false),
  (1574, 'Hot dog (generyczny)', 'other', 'g', 290.00, 22.00, 11.00, 18.00, 1.50, 0.00, 6.50, false, null, 'Parówka w bułce', false),
  (1575, 'Pizza (generyczna, 1 kawałek)', 'other', 'g', 266.00, 33.00, 11.00, 10.00, 2.30, 0.00, 4.50, false, null, 'Średnia wartość pizzy', false),
  (1576, 'Kebab w bułce/picie', 'other', 'g', 215.00, 20.00, 12.00, 10.00, 1.50, 0.00, 3.50, false, null, 'Döner kebab', false),
  (1577, 'Wrap/burrito (generyczny)', 'other', 'g', 200.00, 22.00, 10.00, 8.00, 2.00, 0.00, 3.00, false, null, 'Tortilla z nadzieniem', false),

  -- ===============================
  -- ALKOHOLE - GENERYCZNE - beverages
  -- ===============================
  (1580, 'Piwo jasne (generyczne)', 'beverages', 'ml', 43.00, 3.50, 0.50, 0.00, 0.00, 0.00, 0.00, true, null, 'Piwo lager 5%', false),
  (1581, 'Piwo ciemne', 'beverages', 'ml', 50.00, 5.00, 0.60, 0.00, 0.00, 0.00, 0.00, true, null, 'Piwo porter, stout', false),
  (1582, 'Piwo bezalkoholowe', 'beverages', 'ml', 25.00, 5.00, 0.40, 0.00, 0.00, 0.00, 0.00, true, null, 'Piwo 0.0%', false),
  (1583, 'Piwo bezalkoholowe zero', 'beverages', 'ml', 10.00, 1.50, 0.30, 0.00, 0.00, 0.00, 0.00, true, null, 'Piwo 0.0% bez cukru', true),
  (1584, 'Wino białe wytrawne', 'beverages', 'ml', 82.00, 2.60, 0.10, 0.00, 0.00, 0.00, 0.00, true, null, 'Chardonnay, Sauvignon Blanc', true),
  (1585, 'Wino czerwone wytrawne', 'beverages', 'ml', 85.00, 2.50, 0.10, 0.00, 0.00, 0.00, 0.00, true, null, 'Cabernet, Merlot', true),
  (1586, 'Wino różowe wytrawne', 'beverages', 'ml', 83.00, 2.80, 0.10, 0.00, 0.00, 0.00, 0.00, true, null, 'Rosé dry', true),
  (1587, 'Wódka (generyczna)', 'beverages', 'ml', 231.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Wódka 40%', true),
  (1588, 'Gin (generyczny)', 'beverages', 'ml', 263.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Gin 40%', true),
  (1589, 'Whisky/Whiskey (generyczna)', 'beverages', 'ml', 250.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Whisky 40%', true),
  (1590, 'Rum (generyczny)', 'beverages', 'ml', 231.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Rum 40%', true),
  (1591, 'Tequila (generyczna)', 'beverages', 'ml', 231.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Tequila 40%', true),
  (1592, 'Prosecco/Szampan', 'beverages', 'ml', 80.00, 1.50, 0.10, 0.00, 0.00, 0.00, 0.00, true, null, 'Wino musujące brut', true),
  (1593, 'Likier (generyczny)', 'beverages', 'ml', 300.00, 32.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Likiery słodkie 20-30%', false),
  (1594, 'Wino słodkie/deserowe', 'beverages', 'ml', 160.00, 14.00, 0.10, 0.00, 0.00, 0.00, 0.00, true, null, 'Tokaj, Moscato, Port', false),

  -- ===============================
  -- DODATKI KETO/FIT - condiments/other
  -- ===============================
  -- DUPLIKAT USUNIETY:   (1600, 'Olej MCT', 'oils_fats', 'ml', 862.00, 0.00, 0.00, 100.00, 0.00, 0.00, 95.00, true, null, 'Olej z trójglicerydów średniołańcuchowych', true),
  (1601, 'Masło klarowane ghee', 'oils_fats', 'g', 900.00, 0.00, 0.00, 100.00, 0.00, 0.00, 62.00, true, null, 'Masło oczyszczone', true),
  -- DUPLIKAT USUNIETY:   (1602, 'Mąka kokosowa', 'flours', 'g', 443.00, 21.00, 19.00, 14.00, 39.00, 0.00, 12.00, true, null, 'Mąka z orzecha kokosowego', true),
  -- DUPLIKAT USUNIETY:   (1603, 'Mąka migdałowa', 'flours', 'g', 590.00, 10.00, 21.00, 52.00, 10.00, 0.00, 4.00, true, null, 'Mąka z migdałów blanszowanych', true),
  (1604, 'Mąka z orzechów laskowych', 'flours', 'g', 628.00, 7.00, 15.00, 61.00, 10.00, 0.00, 4.50, true, null, 'Zmielone orzechy laskowe', true),
  (1605, 'Mąka z siemienia lnianego', 'flours', 'g', 450.00, 3.00, 20.00, 37.00, 28.00, 0.00, 3.20, true, null, 'Zmielone siemię lniane', true),
  (1606, 'Błonnik witalny', 'other', 'g', 190.00, 5.00, 0.50, 0.50, 80.00, 0.00, 0.10, true, null, 'Błonnik pokarmowy w proszku', true),
  (1607, 'Inulina', 'other', 'g', 150.00, 0.00, 0.00, 0.00, 90.00, 0.00, 0.00, true, null, 'Prebiotyk, błonnik rozpuszczalny', true),
  (1608, 'Łuski babki jajowatej (psyllium)', 'other', 'g', 205.00, 1.70, 2.40, 0.60, 80.00, 0.00, 0.10, true, null, 'Błonnik rozpuszczalny', true),
  (1609, 'Lecytyna słonecznikowa', 'other', 'g', 763.00, 0.00, 0.00, 97.00, 0.00, 0.00, 15.00, true, null, 'Emulgator naturalny', true),

  -- ===============================
  -- OWOCE SUSZONE (non low-carb) - fruits
  -- ===============================
  (1620, 'Morele suszone', 'fruits', 'g', 241.00, 53.00, 3.40, 0.50, 7.30, 0.00, 0.02, true, null, 'Morele bez pestki', false),
  (1621, 'Śliwki suszone', 'fruits', 'g', 240.00, 57.00, 2.20, 0.40, 7.10, 0.00, 0.04, true, null, 'Suszone śliwki bez pestek', false),
  (1622, 'Figi suszone', 'fruits', 'g', 249.00, 58.00, 3.30, 1.00, 9.80, 0.00, 0.20, true, null, 'Figi suszone', false),
  (1623, 'Daktyle (bez pestek)', 'fruits', 'g', 277.00, 69.00, 2.00, 0.20, 6.70, 0.00, 0.03, true, null, 'Daktyle suszone', false),
  -- DUPLIKAT USUNIETY:   (1624, 'Żurawina suszona', 'fruits', 'g', 308.00, 77.00, 0.10, 1.40, 5.70, 0.00, 0.10, true, null, 'Żurawina słodzona', false),
  -- DUPLIKAT USUNIETY:   (1625, 'Rodzynki', 'fruits', 'g', 299.00, 74.00, 3.10, 0.50, 3.70, 0.00, 0.06, true, null, 'Rodzynki sułtańskie', false),
  (1626, 'Banany suszone/chipsy', 'fruits', 'g', 519.00, 58.00, 2.30, 34.00, 2.00, 0.00, 29.00, true, null, 'Chipsy bananowe', false),

  -- ===============================
  -- OWOCE EGZOTYCZNE - fruits
  -- ===============================
  -- DUPLIKAT USUNIETY:   (1630, 'Pitaja (smoczy owoc)', 'fruits', 'g', 60.00, 13.00, 1.20, 0.40, 3.00, 0.00, 0.10, true, null, 'Dragon fruit', false),
  -- DUPLIKAT USUNIETY:   (1631, 'Rambutan', 'fruits', 'g', 82.00, 21.00, 0.70, 0.20, 0.90, 0.00, 0.02, true, null, 'Owoc azjatycki', false),
  (1632, 'Longan', 'fruits', 'g', 60.00, 15.00, 1.30, 0.10, 1.10, 0.00, 0.02, true, null, 'Owoc podobny do liczi', false),
  (1633, 'Jackfruit (dojrzały)', 'fruits', 'g', 95.00, 23.00, 1.70, 0.60, 1.50, 0.00, 0.20, true, null, 'Owoc chlebowca', false),
  -- DUPLIKAT USUNIETY:   (1634, 'Durian', 'fruits', 'g', 147.00, 27.00, 1.50, 5.30, 3.80, 0.00, 1.50, true, null, 'Owoc o intensywnym zapachu', false),
  (1635, 'Tamarillo', 'fruits', 'g', 31.00, 4.00, 2.00, 0.40, 3.30, 0.00, 0.05, true, null, 'Pomidor drzewiasty', true),
  (1636, 'Sapodilla', 'fruits', 'g', 83.00, 20.00, 0.40, 1.10, 5.30, 0.00, 0.20, true, null, 'Owoc sapotowca', false),

  -- ===============================
  -- WARZYWA DODATKOWE - vegetables
  -- ===============================
  -- DUPLIKAT USUNIETY:   (1640, 'Jarmuż', 'vegetables', 'g', 49.00, 8.80, 4.30, 0.90, 3.60, 0.00, 0.10, true, null, 'Liście jarmużu', true),
  -- DUPLIKAT USUNIETY:   (1641, 'Pak choi', 'vegetables', 'g', 13.00, 2.20, 1.50, 0.20, 1.00, 0.00, 0.03, true, null, 'Kapusta chińska bok choy', true),
  -- DUPLIKAT USUNIETY:   (1642, 'Kapusta pekińska', 'vegetables', 'g', 16.00, 3.20, 1.20, 0.20, 1.20, 0.00, 0.03, true, null, 'Kapusta chińska', true),
  (1643, 'Szpinak baby', 'vegetables', 'g', 23.00, 3.60, 2.90, 0.40, 2.20, 0.00, 0.06, true, null, 'Młode liście szpinaku', true),
  -- DUPLIKAT USUNIETY:   (1644, 'Rukola', 'vegetables', 'g', 25.00, 3.70, 2.60, 0.70, 1.60, 0.00, 0.09, true, null, 'Rukiew sałatowa', true),
  (1645, 'Roszponka', 'vegetables', 'g', 21.00, 3.60, 2.00, 0.40, 2.20, 0.00, 0.05, true, null, 'Sałata polna', true),
  -- DUPLIKAT USUNIETY:   (1646, 'Kapusta kiszona', 'vegetables', 'g', 19.00, 4.30, 0.90, 0.10, 2.90, 0.00, 0.02, true, null, 'Kiszonka z kapusty', true),
  (1647, 'Ogórki kiszone', 'vegetables', 'g', 12.00, 2.30, 0.40, 0.10, 1.00, 0.00, 0.02, true, null, 'Kiszonka z ogórków', true),
  -- DUPLIKAT USUNIETY:   (1648, 'Kimchi', 'vegetables', 'g', 15.00, 2.40, 1.10, 0.50, 1.60, 0.00, 0.06, true, null, 'Koreańska kiszona kapusta', true),
  -- ===============================
  -- MIĘSO I WĘDLINY DODATKOWE - meat
  -- ===============================
  (1660, 'Szynka parmeńska', 'meat', 'g', 230.00, 0.00, 26.00, 14.00, 0.00, 0.00, 5.50, true, null, 'Prosciutto di Parma', true),
  (1661, 'Szynka serrano', 'meat', 'g', 241.00, 0.30, 31.00, 12.50, 0.00, 0.00, 4.80, true, null, 'Hiszpańska szynka dojrzewająca', true),
  (1662, 'Bresaola', 'meat', 'g', 150.00, 0.00, 32.00, 2.00, 0.00, 0.00, 0.80, true, null, 'Suszona wołowina włoska', true),
  (1663, 'Chorizo', 'meat', 'g', 455.00, 2.00, 24.00, 38.00, 0.00, 0.00, 14.50, true, null, 'Hiszpańska kiełbasa', true),
  (1664, 'Pepperoni', 'meat', 'g', 494.00, 4.00, 23.00, 44.00, 0.00, 0.00, 16.00, true, null, 'Salami pepperoni', true),
  (1665, 'Mortadela', 'meat', 'g', 311.00, 3.00, 14.00, 28.00, 0.00, 0.00, 10.00, true, null, 'Włoska wędlina', true),
  (1666, 'Pasztet z wątróbki', 'meat', 'g', 315.00, 4.00, 12.00, 28.00, 0.00, 0.00, 10.50, true, null, 'Pasztet drobiowy', true),
  (1667, 'Salami milano', 'meat', 'g', 450.00, 1.50, 26.00, 38.00, 0.00, 0.00, 14.00, true, null, 'Włoskie salami', true),
  (1668, 'Kiełbasa krakowska', 'meat', 'g', 295.00, 1.00, 19.00, 24.00, 0.00, 0.00, 9.00, true, null, 'Polska kiełbasa wędzona', true),

  -- ===============================
  -- SERY DODATKOWE - dairy
  -- ===============================
  (1680, 'Gorgonzola', 'dairy', 'g', 360.00, 0.00, 21.00, 31.00, 0.00, 0.00, 20.00, true, null, 'Włoski ser pleśniowy', true),
  (1681, 'Roquefort', 'dairy', 'g', 369.00, 2.00, 22.00, 31.00, 0.00, 0.00, 19.50, true, null, 'Francuski ser owczy', true),
  (1682, 'Stilton', 'dairy', 'g', 410.00, 0.70, 24.00, 35.00, 0.00, 0.00, 22.00, true, null, 'Angielski ser pleśniowy', true),
  (1683, 'Gruyère', 'dairy', 'g', 413.00, 0.40, 30.00, 32.00, 0.00, 0.00, 19.00, true, null, 'Szwajcarski ser twardy', true),
  (1684, 'Manchego', 'dairy', 'g', 390.00, 0.50, 26.00, 32.00, 0.00, 0.00, 20.00, true, null, 'Hiszpański ser owczy', true),
  (1685, 'Pecorino Romano', 'dairy', 'g', 387.00, 3.60, 32.00, 27.00, 0.00, 0.00, 17.50, true, null, 'Włoski ser owczy', true),
  (1686, 'Halloumi', 'dairy', 'g', 321.00, 2.60, 21.00, 25.00, 0.00, 0.00, 16.00, true, null, 'Cypryjski ser do grillowania', true),
  (1687, 'Burrata', 'dairy', 'g', 280.00, 1.50, 16.00, 23.00, 0.00, 0.00, 15.00, true, null, 'Świeży ser włoski z kremem', true),
  (1688, 'Mascarpone', 'dairy', 'g', 453.00, 3.50, 4.80, 47.00, 0.00, 0.00, 30.00, true, null, 'Włoski ser śmietankowy', true),

  -- ===============================
  -- OWOCE MORZA DODATKOWE - fish
  -- ===============================
  (1700, 'Kalmary', 'fish', 'g', 92.00, 3.10, 15.60, 1.40, 0.00, 0.00, 0.40, true, null, 'Kalmary świeże', true),
  -- DUPLIKAT USUNIETY:   (1701, 'Ośmiornica', 'fish', 'g', 82.00, 2.20, 14.90, 1.00, 0.00, 0.00, 0.23, true, null, 'Ośmiornica świeża', true),
  -- DUPLIKAT USUNIETY:   (1702, 'Małże', 'fish', 'g', 86.00, 3.70, 12.00, 2.20, 0.00, 0.00, 0.40, true, null, 'Małże morskie', true),
  (1703, 'Ostrygi', 'fish', 'g', 69.00, 3.90, 7.00, 2.50, 0.00, 0.00, 0.70, true, null, 'Ostrygi świeże', true),
  (1704, 'Przegrzebki', 'fish', 'g', 88.00, 2.40, 17.00, 0.80, 0.00, 0.00, 0.20, true, null, 'St. Jacques', true),
  (1705, 'Homar', 'fish', 'g', 90.00, 0.50, 19.00, 0.90, 0.00, 0.00, 0.20, true, null, 'Homar gotowany', true),
  (1706, 'Langustynki', 'fish', 'g', 77.00, 0.00, 16.00, 1.00, 0.00, 0.00, 0.20, true, null, 'Scampi', true),
  (1707, 'Kawior', 'fish', 'g', 264.00, 4.00, 25.00, 18.00, 0.00, 0.00, 4.10, true, null, 'Kawior jesiotra', true),
  (1708, 'Ikra łososiowa', 'fish', 'g', 245.00, 2.90, 25.00, 14.00, 0.00, 0.00, 2.40, true, null, 'Kawior łososiowy', true),
  (1709, 'Węgorz wędzony', 'fish', 'g', 330.00, 0.00, 18.40, 28.00, 0.00, 0.00, 5.60, true, null, 'Węgorz wędzonka', true),

  -- ===============================
  -- GRZYBY DODATKOWE - vegetables
  -- ===============================
  -- DUPLIKAT USUNIETY:   (1720, 'Borowiki suszone', 'vegetables', 'g', 296.00, 59.00, 22.00, 3.50, 24.00, 0.00, 0.40, true, null, 'Prawdziwki suszone', false),
  (1721, 'Shiitake świeże', 'vegetables', 'g', 34.00, 6.80, 2.20, 0.50, 2.50, 0.00, 0.10, true, null, 'Grzyby azjatyckie', true),
  (1722, 'Shiitake suszone', 'vegetables', 'g', 296.00, 63.00, 10.00, 1.00, 11.50, 0.00, 0.20, true, null, 'Grzyby shiitake suszone', false),
  (1723, 'Maitake', 'vegetables', 'g', 31.00, 5.00, 1.90, 0.20, 2.70, 0.00, 0.03, true, null, 'Grzyb kurka', true),
  (1724, 'Enoki', 'vegetables', 'g', 37.00, 7.80, 2.70, 0.30, 2.70, 0.00, 0.04, true, null, 'Złociste grzyby igłowe', true),
  (1725, 'Boczniaki', 'vegetables', 'g', 33.00, 6.00, 3.30, 0.40, 2.30, 0.00, 0.05, true, null, 'Grzyby boczniak', true),
  (1726, 'Kurki', 'vegetables', 'g', 32.00, 6.90, 1.50, 0.50, 3.80, 0.00, 0.06, true, null, 'Kurki leśne', true),

  -- ===============================
  -- PRZYPRAWY DODATKOWE - spices_herbs
  -- ===============================
  (1740, 'Kardamon', 'spices_herbs', 'g', 311.00, 68.00, 11.00, 6.70, 28.00, 0.00, 0.70, true, null, 'Ziarna kardamonu', true),
  (1741, 'Szafran', 'spices_herbs', 'g', 310.00, 65.00, 11.00, 5.90, 3.90, 0.00, 1.60, true, null, 'Nitki szafranu', true),
  (1742, 'Wanilia (laska)', 'spices_herbs', 'g', 288.00, 53.00, 0.10, 0.10, 0.00, 0.00, 0.00, true, null, 'Laska wanilii', false),
  (1743, 'Gałka muszkatołowa', 'spices_herbs', 'g', 525.00, 49.00, 6.00, 36.00, 21.00, 0.00, 26.00, true, null, 'Gałka muszkatołowa mielona', true),
  (1744, 'Cynamon cejloński', 'spices_herbs', 'g', 247.00, 81.00, 4.00, 1.20, 53.00, 0.00, 0.30, true, null, 'Cynamon prawdziwy', true),
  (1745, 'Goździki', 'spices_herbs', 'g', 274.00, 65.00, 6.00, 13.00, 34.00, 0.00, 3.90, true, null, 'Goździki całe', true),
  (1746, 'Ziele angielskie', 'spices_herbs', 'g', 263.00, 72.00, 6.00, 9.00, 22.00, 0.00, 2.60, true, null, 'Pimento', false),
  (1747, 'Anyż gwiazdkowaty', 'spices_herbs', 'g', 337.00, 50.00, 18.00, 16.00, 15.00, 0.00, 0.60, true, null, 'Badian', true),
  (1748, 'Kolendra ziarna', 'spices_herbs', 'g', 298.00, 55.00, 12.00, 18.00, 42.00, 0.00, 1.00, true, null, 'Kolendra w ziarnach', true),
  (1749, 'Kminek', 'spices_herbs', 'g', 375.00, 44.00, 18.00, 22.00, 11.00, 0.00, 1.60, true, null, 'Kminek rzymski', true),
  (1750, 'Płatki chili', 'spices_herbs', 'g', 314.00, 56.60, 12.00, 17.30, 27.20, 0.00, 3.30, true, null, 'Suszone płatki chili (red pepper flakes)', true),

  -- ===============================
  -- NAPOJE I KAWA - beverages
  -- ===============================
  (1760, 'Kawa rozpuszczalna', 'beverages', 'g', 330.00, 56.00, 12.00, 0.50, 0.00, 0.00, 0.20, true, null, 'Kawa instant', false),
  (1761, 'Kawa ziarnista (zaparzona)', 'beverages', 'ml', 2.00, 0.00, 0.30, 0.00, 0.00, 0.00, 0.00, true, null, 'Czarna kawa bez dodatków', true),
  (1762, 'Espresso', 'beverages', 'ml', 9.00, 1.70, 0.10, 0.20, 0.00, 0.00, 0.10, true, null, 'Kawa espresso (30ml)', true),
  -- DUPLIKAT USUNIETY:   (1763, 'Herbata zielona', 'beverages', 'ml', 1.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Zaparzona herbata zielona', true),
  -- DUPLIKAT USUNIETY:   (1764, 'Herbata czarna', 'beverages', 'ml', 1.00, 0.30, 0.00, 0.00, 0.00, 0.00, 0.00, true, null, 'Zaparzona herbata czarna', true),
  (1765, 'Matcha (proszek)', 'beverages', 'g', 324.00, 39.00, 30.00, 5.00, 39.00, 0.00, 1.00, true, null, 'Sproszkowana herbata zielona', true),
  (1766, 'Kakao naturalne', 'beverages', 'g', 228.00, 13.00, 20.00, 14.00, 33.00, 0.00, 8.00, true, null, 'Kakao bez cukru', true),
  (1767, 'Yerba mate', 'beverages', 'g', 290.00, 68.00, 10.00, 3.00, 9.00, 0.00, 0.50, true, null, 'Suszone liście yerba mate', false)

ON CONFLICT (name) DO UPDATE SET
  id = EXCLUDED.id,
  category = EXCLUDED.category,
  unit = EXCLUDED.unit,
  calories_per_100_units = EXCLUDED.calories_per_100_units,
  carbs_per_100_units = EXCLUDED.carbs_per_100_units,
  protein_per_100_units = EXCLUDED.protein_per_100_units,
  fats_per_100_units = EXCLUDED.fats_per_100_units,
  fiber_per_100_units = EXCLUDED.fiber_per_100_units,
  polyols_per_100_units = EXCLUDED.polyols_per_100_units,
  saturated_fat_per_100_units = EXCLUDED.saturated_fat_per_100_units,
  is_divisible = EXCLUDED.is_divisible,
  image_url = EXCLUDED.image_url,
  description = EXCLUDED.description,
  is_low_carb_friendly = EXCLUDED.is_low_carb_friendly;

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

  -- Awokado
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

  -- Brokuły/Kalafior
  (922, 'różyczka mała', 15.00),
  (922, 'różyczka średnia', 25.00),
  (922, 'główka mała', 300.00),
  (922, 'główka średnia', 500.00),
  (923, 'różyczka mała', 15.00),
  (923, 'różyczka średnia', 30.00),
  (923, 'główka mała', 400.00),
  (923, 'główka średnia', 600.00),

  -- Czosnek/Cebula
  (969, 'ząbek mały', 3.00),
  (969, 'ząbek średni', 5.00),
  (969, 'ząbek duży', 8.00),
  (969, 'główka mała', 25.00),
  (969, 'główka średnia', 40.00),
  (966, 'mała', 70.00),
  (966, 'średnia', 110.00),
  (966, 'duża', 150.00),
  (967, 'mała', 70.00),
  (967, 'średnia', 110.00),

  -- Ziemniaki
  (1010, 'mały', 100.00),
  (1010, 'średni', 150.00),
  (1010, 'duży', 220.00),

  -- Owoce
  (1020, 'małe', 130.00),
  (1020, 'średnie', 180.00),
  (1020, 'duże', 220.00),
  (1022, 'mały', 90.00),
  (1022, 'średni', 120.00),
  (1022, 'duży', 150.00),
  (1023, 'mała', 100.00),
  (1023, 'średnia', 140.00),
  (1023, 'duża', 180.00),
  (964, 'z 1 cytryny', 45.00),
  (965, 'z 1 limonki', 30.00),

  -- Orzechy/nasiona - łyżki
  (971, 'łyżka', 14.00),
  (972, 'łyżka', 12.00),
  (978, 'łyżka', 10.00),
  (979, 'łyżka', 10.00),
  (980, 'łyżka', 12.00),
  (981, 'łyżka', 10.00),
  (1040, 'łyżka', 16.00),
  (1041, 'łyżka', 15.00),

  -- Oleje/tłuszcze
  (984, 'łyżka', 13.50),
  (985, 'łyżka', 13.50),
  (987, 'łyżka', 13.50),
  (988, 'łyżka', 13.50),
  (990, 'łyżka', 14.00),
  (881, 'łyżka', 14.00),
  (881, 'kostka (200g)', 200.00),
  (881, 'plasterek', 10.00),

  -- Śmietana
  (882, 'łyżka', 15.00),
  (883, 'łyżka', 15.00),

  -- Produkty zbożowe
  (1054, 'szklanka', 90.00),
  (1055, 'szklanka', 185.00),
  (1056, 'szklanka', 190.00),
  (1050, 'szklanka', 125.00),
  (1051, 'szklanka', 112.00),
  (1061, 'kromka', 30.00),
  (1062, 'kromka', 35.00),

  -- Przyprawy - łyżeczki
  (997, 'szczypta', 0.30),
  (997, 'łyżeczka', 6.00),
  (998, 'szczypta', 0.20),
  (998, 'łyżeczka', 2.30),
  (999, 'łyżeczka', 2.30),
  (1000, 'łyżeczka', 3.00),
  (1001, 'łyżeczka', 2.60),
  (1002, 'łyżeczka', 1.80),

  -- Słodziki
  (1045, 'łyżeczka', 4.00),
  (1045, 'łyżka', 12.50),
  (1047, 'łyżeczka', 7.00),
  (1047, 'łyżka', 21.00),

  -- Sosy
  (1090, 'łyżka', 14.00),
  (1091, 'łyżeczka', 5.00),
  (1092, 'łyżka', 17.00),
  (1093, 'łyżka', 15.00),
  (1097, 'łyżka', 30.00),

  -- ===============================
  -- NOWE PRODUKTY - KONWERSJE JEDNOSTEK
  -- ===============================

  -- Napoje zero/light (puszka/butelka)
  (1500, 'puszka 330ml', 330.00),
  (1500, 'butelka 500ml', 500.00),
  (1500, 'butelka 1L', 1000.00),
  (1501, 'puszka 250ml', 250.00),
  (1501, 'puszka 500ml', 500.00),
  (1502, 'butelka 500ml', 500.00),
  (1503, 'butelka 500ml', 500.00),
  (1504, 'szklanka', 250.00),
  (1505, 'butelka 500ml', 500.00),
  (1506, 'butelka 200ml', 200.00),
  (1507, 'puszka 330ml', 330.00),

  -- Nabiał proteinowy
  (1510, 'kubeczek 150g', 150.00),
  (1510, 'kubeczek 200g', 200.00),
  (1511, 'opakowanie 150g', 150.00),
  (1512, 'opakowanie 200g', 200.00),
  (1513, 'szklanka', 250.00),
  (1514, 'kubeczek', 120.00),
  (1515, 'kubeczek', 100.00),
  (1516, 'szklanka', 250.00),
  (1517, 'szklanka', 250.00),
  (1518, 'porcja', 30.00),

  -- Suplementy proteinowe
  (1530, 'miarka', 30.00),
  (1530, 'porcja', 30.00),
  (1531, 'miarka', 30.00),
  (1532, 'miarka', 30.00),
  (1533, 'baton', 50.00),
  (1534, 'baton', 50.00),
  (1535, 'łyżka', 10.00),
  (1536, 'porcja', 10.00),

  -- Produkty wegańskie
  (1540, 'kostka 200g', 200.00),
  -- DUPLIKAT USUNIETY:   (1541, 'opakowanie 200g', 200.00),
  (1542, 'porcja', 100.00),
  (1543, 'szklanka', 250.00),
  (1544, 'szklanka', 250.00),
  (1545, 'szklanka', 250.00),
  (1546, 'kubeczek', 150.00),
  (1547, 'sztuka', 100.00),
  (1548, 'sztuka', 80.00),

  -- Pieczywo keto/fit
  (1550, 'kromka', 35.00),
  (1551, 'kromka', 40.00),
  (1552, 'sztuka', 40.00),
  (1553, 'porcja', 200.00),
  (1554, 'porcja', 80.00),
  (1555, 'porcja', 80.00),
  (1556, 'sztuka', 60.00),
  (1557, 'kromka', 30.00),
  (1558, 'kromka', 35.00),

  -- Sosy fit/zero
  (1560, 'łyżka', 15.00),
  (1561, 'łyżka', 15.00),
  (1562, 'łyżka', 15.00),
  (1563, 'łyżka', 20.00),
  (1564, 'łyżka', 15.00),
  (1565, 'łyżeczka', 10.00),
  (1566, 'łyżka', 15.00),

  -- Fast food (porcje)
  (1570, 'sztuka', 120.00),
  (1571, 'sztuka', 130.00),
  (1572, 'mała porcja', 70.00),
  (1572, 'średnia porcja', 115.00),
  (1572, 'duża porcja', 150.00),
  -- DUPLIKAT USUNIETY:   (1573, '6 sztuk', 100.00),
  -- DUPLIKAT USUNIETY:   (1573, '9 sztuk', 150.00),
  (1574, 'sztuka', 150.00),
  (1575, 'kawałek', 100.00),
  (1576, 'porcja', 350.00),
  (1577, 'sztuka', 250.00),

  -- Alkohole
  (1580, 'kufel 500ml', 500.00),
  (1580, 'butelka 500ml', 500.00),
  (1581, 'kufel 500ml', 500.00),
  (1582, 'butelka 330ml', 330.00),
  (1583, 'butelka 330ml', 330.00),
  (1584, 'kieliszek', 150.00),
  (1584, 'butelka 750ml', 750.00),
  (1585, 'kieliszek', 150.00),
  (1585, 'butelka 750ml', 750.00),
  (1586, 'kieliszek', 150.00),
  (1587, 'kieliszek 50ml', 50.00),
  (1587, 'shot 25ml', 25.00),
  (1588, 'kieliszek 50ml', 50.00),
  (1589, 'kieliszek 50ml', 50.00),
  (1590, 'kieliszek 50ml', 50.00),
  (1591, 'kieliszek 50ml', 50.00),
  (1592, 'kieliszek', 120.00),
  (1593, 'kieliszek 40ml', 40.00),
  (1594, 'kieliszek', 100.00),

  -- Dodatki keto/fit
  -- DUPLIKAT USUNIETY:   (1600, 'łyżka', 15.00),
  (1601, 'łyżka', 14.00),
  -- DUPLIKAT USUNIETY:   (1602, 'łyżka', 8.00),
  -- DUPLIKAT USUNIETY:   (1603, 'łyżka', 10.00),
  (1604, 'łyżka', 10.00),
  (1605, 'łyżka', 7.00),
  (1606, 'łyżka', 8.00),
  (1607, 'łyżka', 8.00),
  (1608, 'łyżka', 8.00),
  (1609, 'łyżka', 10.00),

  -- Owoce suszone
  (1620, 'garść', 30.00),
  (1621, 'sztuka', 8.00),
  (1622, 'sztuka', 12.00),
  (1623, 'sztuka', 8.00),
  -- DUPLIKAT USUNIETY:   (1624, 'garść', 30.00),
  -- DUPLIKAT USUNIETY:   (1625, 'garść', 30.00),
  (1626, 'garść', 25.00),

  -- Owoce egzotyczne
  -- DUPLIKAT USUNIETY:   (1630, 'sztuka mała', 150.00),
  -- DUPLIKAT USUNIETY:   (1630, 'sztuka duża', 300.00),
  (1633, 'porcja', 100.00),
  -- DUPLIKAT USUNIETY:   (1634, 'porcja', 100.00),
  -- Warzywa dodatkowe
  -- DUPLIKAT USUNIETY:   (1640, 'garść', 30.00),
  -- DUPLIKAT USUNIETY:   (1641, 'główka', 200.00),
  -- DUPLIKAT USUNIETY:   (1642, 'główka mała', 400.00),
  (1643, 'garść', 30.00),
  -- DUPLIKAT USUNIETY:   (1644, 'garść', 20.00),
  (1645, 'garść', 20.00),
  -- DUPLIKAT USUNIETY:   (1646, 'porcja', 100.00),
  (1647, 'sztuka mała', 50.00),
  (1647, 'sztuka średnia', 80.00),
  -- DUPLIKAT USUNIETY:   (1648, 'porcja', 50.00),
  -- Wędliny premium
  (1660, 'plasterek', 20.00),
  (1661, 'plasterek', 20.00),
  (1662, 'plasterek', 15.00),
  (1663, 'plasterek', 10.00),
  (1664, 'plasterek', 8.00),
  (1665, 'plasterek', 25.00),
  (1666, 'porcja', 50.00),
  (1667, 'plasterek', 15.00),
  (1668, 'plasterek', 20.00),

  -- Sery premium
  (1680, 'porcja', 30.00),
  (1681, 'porcja', 30.00),
  (1682, 'porcja', 30.00),
  (1683, 'plasterek', 25.00),
  (1684, 'plasterek', 25.00),
  (1685, 'łyżka startego', 10.00),
  (1686, 'plasterek', 30.00),
  (1687, 'sztuka', 125.00),
  (1688, 'łyżka', 30.00),

  -- Owoce morza
  (1700, 'porcja', 150.00),
  -- DUPLIKAT USUNIETY:   (1701, 'porcja', 150.00),
  -- DUPLIKAT USUNIETY:   (1702, 'porcja (10 szt)', 150.00),
  (1703, 'sztuka', 15.00),
  (1704, 'sztuka', 20.00),
  (1705, 'ogon średni', 200.00),
  (1706, 'porcja', 100.00),
  (1707, 'łyżeczka', 15.00),
  (1708, 'łyżeczka', 15.00),
  (1709, 'plasterek', 25.00),

  -- Grzyby
  -- DUPLIKAT USUNIETY:   (1720, 'garść', 15.00),
  (1721, 'sztuka', 15.00),
  (1722, 'garść', 10.00),
  (1723, 'porcja', 100.00),
  (1724, 'porcja', 50.00),
  (1725, 'sztuka', 20.00),
  (1726, 'garść', 50.00),

  -- Przyprawy
  (1740, 'łyżeczka', 2.00),
  (1741, 'szczypta', 0.10),
  (1742, 'laska', 3.00),
  (1743, 'szczypta', 0.50),
  (1744, 'łyżeczka', 2.60),
  (1745, 'sztuka', 0.15),
  (1746, 'szczypta', 0.50),
  (1747, 'gwiazdka', 1.00),
  (1748, 'łyżeczka', 2.00),
  (1749, 'łyżeczka', 2.00),

  -- Napoje/kawa
  (1760, 'łyżeczka', 2.00),
  (1761, 'filiżanka', 150.00),
  (1762, 'porcja (30ml)', 30.00),
  -- DUPLIKAT USUNIETY:   (1763, 'filiżanka', 200.00),
  -- DUPLIKAT USUNIETY:   (1764, 'filiżanka', 200.00),
  (1765, 'łyżeczka', 2.00),
  (1766, 'łyżka', 10.00),
  (1767, 'porcja', 20.00)

ON CONFLICT (ingredient_id, unit_name) DO UPDATE SET
  grams_equivalent = EXCLUDED.grams_equivalent;

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================
-- Count by low-carb status:
-- SELECT is_low_carb_friendly, COUNT(*) as count
-- FROM public.ingredients
-- GROUP BY is_low_carb_friendly;
--
-- High-carb ingredients:
-- SELECT name, carbs_per_100_units as carbs, fiber_per_100_units as fiber,
--        (carbs_per_100_units - COALESCE(fiber_per_100_units, 0)) as net_carbs
-- FROM public.ingredients
-- WHERE is_low_carb_friendly = FALSE
-- ORDER BY net_carbs DESC;
--
-- Best low-carb vegetables:
-- SELECT name, (carbs_per_100_units - fiber_per_100_units) as net_carbs
-- FROM public.ingredients
-- WHERE category = 'vegetables' AND is_low_carb_friendly = TRUE
-- ORDER BY net_carbs ASC;
