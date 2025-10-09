-- =====================================================================
-- Seed Data for LowCarbPlaner - INGREDIENTS ONLY
-- Description: Sample ingredients and unit conversions for testing and development
-- =====================================================================
-- IMPORTANT: This is sample data. Replace with real data before production.
-- PREREQUISITE: Run migration 20251009120000_create_lowcarbplaner_schema.sql first!
-- =====================================================================
-- Valid categories (ENUM): vegetables, fruits, meat, fish, dairy, eggs,
--                          nuts_seeds, oils_fats, spices_herbs, flours,
--                          beverages, sweeteners, condiments, other
-- =====================================================================

-- =====================================================================
-- SECTION 1: SEED INGREDIENTS (content.ingredients)
-- =====================================================================

insert into content.ingredients (name, category, unit, calories_per_100_units, carbs_per_100_units, protein_per_100_units, fats_per_100_units, is_divisible, image_url)
values
  -- ===============================
  -- JAJA (EGGS)
  -- ===============================
  ('Jajko kurze (całe)', 'eggs', 'g', 155, 1.1, 13.0, 11.0, false, null),
  ('Jajko kurze (białko)', 'eggs', 'g', 52, 0.7, 11.0, 0.2, true, null),
  ('Jajko kurze (żółtko)', 'eggs', 'g', 322, 3.6, 15.9, 26.5, true, null),

  -- ===============================
  -- NABIAŁ (DAIRY PRODUCTS)
  -- ===============================
  -- Sery twarde
  ('Ser feta', 'dairy', 'g', 264, 4.1, 14.2, 21.3, true, null),
  ('Ser mozzarella', 'dairy', 'g', 280, 2.2, 22.2, 22.4, true, null),
  ('Ser parmezan', 'dairy', 'g', 431, 4.1, 38.5, 28.6, true, null),
  ('Ser cheddar', 'dairy', 'g', 403, 1.3, 24.9, 33.1, true, null),
  ('Ser gouda', 'dairy', 'g', 356, 2.2, 24.9, 27.4, true, null),
  ('Ser camembert', 'dairy', 'g', 300, 0.5, 19.8, 24.3, true, null),
  ('Ser pecorino', 'dairy', 'g', 387, 3.6, 25.8, 29.4, true, null),

  -- Sery miękkie i twaróg
  ('Twaróg półtłusty', 'dairy', 'g', 98, 3.5, 17.0, 2.0, true, null),
  ('Twaróg chudy', 'dairy', 'g', 72, 3.4, 13.5, 0.5, true, null),
  ('Twaróg tłusty', 'dairy', 'g', 154, 2.7, 15.5, 9.0, true, null),
  ('Ser ricotta', 'dairy', 'g', 174, 3.0, 11.3, 13.0, true, null),
  ('Serek wiejski', 'dairy', 'g', 98, 3.4, 11.1, 4.3, true, null),

  -- Produkty mleczne
  ('Masło', 'dairy', 'g', 717, 0.1, 0.9, 81.1, true, null),
  ('Śmietana 18%', 'dairy', 'ml', 195, 3.3, 2.7, 18.0, true, null),
  ('Śmietana 30%', 'dairy', 'ml', 292, 3.1, 2.2, 30.0, true, null),
  ('Jogurt grecki naturalny (pełnotłusty)', 'dairy', 'g', 97, 3.6, 9.0, 5.0, true, null),
  ('Jogurt grecki naturalny (2% tłuszczu)', 'dairy', 'g', 73, 3.8, 10.0, 1.9, true, null),
  ('Kefir naturalny', 'dairy', 'ml', 41, 4.5, 2.9, 1.0, true, null),

  -- ===============================
  -- MIĘSO (MEAT)
  -- ===============================
  -- Drób
  ('Kurczak - pierś (bez skóry)', 'meat', 'g', 165, 0, 31.0, 3.6, true, null),
  ('Kurczak - udko (ze skórą)', 'meat', 'g', 211, 0, 26.0, 11.0, true, null),
  ('Kurczak - skrzydełka (ze skórą)', 'meat', 'g', 290, 0, 27.0, 19.5, true, null),
  ('Indyk - pierś (bez skóry)', 'meat', 'g', 135, 0, 30.0, 1.0, true, null),
  ('Indyk - udko (bez skóry)', 'meat', 'g', 144, 0, 28.6, 2.1, true, null),
  ('Kaczka - pierś (bez skóry)', 'meat', 'g', 123, 0, 23.5, 2.5, true, null),

  -- Wołowina
  ('Wołowina - wołowe mielone 10% tłuszczu', 'meat', 'g', 176, 0, 20.0, 10.0, true, null),
  ('Wołowina - antrykot (stek)', 'meat', 'g', 271, 0, 25.4, 18.4, true, null),
  ('Wołowina - polędwica (tenderloin)', 'meat', 'g', 158, 0, 26.9, 5.0, true, null),
  ('Wołowina - rostbef', 'meat', 'g', 134, 0, 26.6, 2.6, true, null),

  -- Wieprzowina
  ('Wieprzowina - schab', 'meat', 'g', 242, 0, 21.5, 17.0, true, null),
  ('Wieprzowina - karkówka', 'meat', 'g', 263, 0, 18.4, 20.5, true, null),
  ('Wieprzowina - boczek surowy', 'meat', 'g', 393, 1.4, 11.6, 38.0, true, null),

  -- Baranina
  ('Baranina - comber', 'meat', 'g', 294, 0, 16.5, 25.0, true, null),
  ('Baranina - udziec', 'meat', 'g', 240, 0, 20.0, 17.5, true, null),

  -- Wędliny
  ('Szynka z indyka (bez dodatków)', 'meat', 'g', 104, 1.0, 17.5, 3.5, true, null),
  ('Szynka wieprzowa (bez dodatków)', 'meat', 'g', 145, 1.5, 21.0, 6.5, true, null),
  ('Kabanos', 'meat', 'g', 434, 1.9, 21.8, 37.9, true, null),

  -- ===============================
  -- RYBY I OWOCE MORZA (FISH & SEAFOOD)
  -- ===============================
  -- Ryby tłuste
  ('Łosoś (świeży)', 'fish', 'g', 208, 0, 20.0, 13.4, true, null),
  ('Łosoś wędzony', 'fish', 'g', 117, 0, 18.3, 4.5, true, null),
  ('Makrela (świeża)', 'fish', 'g', 205, 0, 18.6, 13.9, true, null),
  ('Makrela wędzona', 'fish', 'g', 220, 0, 23.8, 13.0, true, null),
  ('Sardynki (w oleju)', 'fish', 'g', 208, 0, 24.6, 11.5, true, null),
  ('Śledź (marynowany)', 'fish', 'g', 262, 9.6, 14.2, 18.0, true, null),
  ('Pstrąg tęczowy', 'fish', 'g', 119, 0, 20.5, 3.5, true, null),

  -- Ryby chude
  ('Tuńczyk w sosie własnym', 'fish', 'g', 116, 0, 26.0, 0.8, true, null),
  ('Dorsz', 'fish', 'g', 82, 0, 17.8, 0.7, true, null),
  ('Tilapia', 'fish', 'g', 96, 0, 20.1, 1.7, true, null),
  ('Halibut', 'fish', 'g', 91, 0, 18.6, 1.3, true, null),
  ('Morszczuk', 'fish', 'g', 90, 0, 18.4, 1.3, true, null),

  -- Owoce morza
  ('Krewetki', 'fish', 'g', 99, 0.9, 20.9, 1.0, true, null),
  ('Kalmar', 'fish', 'g', 92, 3.1, 15.6, 1.4, true, null),
  ('Ośmiornica', 'fish', 'g', 82, 2.2, 14.9, 1.0, true, null),
  ('Małże', 'fish', 'g', 86, 3.7, 11.9, 2.2, true, null),
  ('Homary', 'fish', 'g', 89, 0, 19.0, 0.9, true, null),

  -- ===============================
  -- WARZYWA (VEGETABLES - LOW-CARB)
  -- ===============================
  -- Warzywa krzyżowe (cruciferous)
  ('Brokuły', 'vegetables', 'g', 34, 7.0, 2.8, 0.4, true, null),
  ('Kalafior', 'vegetables', 'g', 25, 5.0, 1.9, 0.3, true, null),
  ('Kapusta biała', 'vegetables', 'g', 25, 5.8, 1.3, 0.1, true, null),
  ('Kapusta czerwona', 'vegetables', 'g', 31, 7.4, 1.4, 0.2, true, null),
  ('Kapusta włoska (czarna)', 'vegetables', 'g', 25, 4.4, 1.3, 0.1, true, null),
  ('Brukselka', 'vegetables', 'g', 43, 9.0, 3.4, 0.3, true, null),
  ('Jarmuż (kale)', 'vegetables', 'g', 49, 8.8, 4.3, 0.9, true, null),
  ('Bok choy (kapusta chińska)', 'vegetables', 'g', 13, 2.2, 1.5, 0.2, true, null),

  -- Warzywa liściaste
  ('Szpinak (świeży)', 'vegetables', 'g', 23, 3.6, 2.9, 0.4, true, null),
  ('Sałata masłowa', 'vegetables', 'g', 13, 2.2, 1.4, 0.2, true, null),
  ('Sałata rzymska', 'vegetables', 'g', 17, 3.3, 1.2, 0.3, true, null),
  ('Sałata lodowa (góra lodowa)', 'vegetables', 'g', 14, 3.0, 0.9, 0.1, true, null),
  ('Rukola', 'vegetables', 'g', 25, 3.7, 2.6, 0.7, true, null),
  ('Endywia', 'vegetables', 'g', 17, 3.4, 1.3, 0.2, true, null),
  ('Pak choi', 'vegetables', 'g', 13, 2.2, 1.5, 0.2, true, null),

  -- Warzywa owocowe
  ('Pomidor', 'vegetables', 'g', 18, 3.9, 0.9, 0.2, true, null),
  ('Pomidory koktajlowe', 'vegetables', 'g', 18, 3.9, 0.9, 0.2, true, null),
  ('Pomidory suszone (w oleju)', 'vegetables', 'g', 213, 14.1, 4.3, 15.5, true, null),
  ('Papryka czerwona', 'vegetables', 'g', 31, 6.0, 1.0, 0.3, true, null),
  ('Papryka zielona', 'vegetables', 'g', 20, 4.6, 0.9, 0.2, true, null),
  ('Papryka żółta', 'vegetables', 'g', 27, 6.3, 1.0, 0.2, true, null),
  ('Cukinia', 'vegetables', 'g', 17, 3.1, 1.2, 0.3, true, null),
  ('Bakłażan', 'vegetables', 'g', 25, 5.9, 1.0, 0.2, true, null),
  ('Ogórek', 'vegetables', 'g', 15, 3.6, 0.7, 0.1, true, null),
  ('Awokado', 'vegetables', 'g', 160, 8.5, 2.0, 14.7, true, null),

  -- Warzywa korzeniowe (niskie węglowodany)
  ('Rzodkiewka', 'vegetables', 'g', 16, 3.4, 0.7, 0.1, true, null),
  ('Rzodkiew biała (daikon)', 'vegetables', 'g', 18, 4.1, 0.6, 0.1, true, null),
  ('Seler naciowy', 'vegetables', 'g', 16, 3.0, 0.7, 0.2, true, null),
  ('Rzepa', 'vegetables', 'g', 28, 6.4, 0.9, 0.1, true, null),

  -- Grzyby
  ('Pieczarki', 'vegetables', 'g', 22, 3.3, 3.1, 0.3, true, null),
  ('Pieczarki portobello', 'vegetables', 'g', 22, 3.9, 2.1, 0.4, true, null),
  ('Borowiki suszone', 'vegetables', 'g', 231, 48.8, 20.1, 3.5, true, null),
  ('Pieczarki shitake', 'vegetables', 'g', 34, 6.8, 2.2, 0.5, true, null),

  -- Pozostałe warzywa niskowęglowe
  ('Szparagi', 'vegetables', 'g', 20, 3.9, 2.2, 0.1, true, null),
  ('Fasolka szparagowa', 'vegetables', 'g', 31, 7.0, 1.8, 0.1, true, null),
  ('Dynia piżmowa (butternut)', 'vegetables', 'g', 45, 11.7, 1.0, 0.1, true, null),
  ('Kabaczek patison', 'vegetables', 'g', 19, 4.3, 1.2, 0.2, true, null),

  -- ===============================
  -- OWOCE (FRUITS - OGRANICZONE)
  -- ===============================
  ('Truskawki', 'fruits', 'g', 32, 7.7, 0.7, 0.3, true, null),
  ('Maliny', 'fruits', 'g', 52, 12.0, 1.2, 0.7, true, null),
  ('Borówki', 'fruits', 'g', 57, 14.5, 0.7, 0.3, true, null),
  ('Jagody', 'fruits', 'g', 64, 14.1, 1.0, 0.5, true, null),
  ('Jeżyny', 'fruits', 'g', 43, 9.6, 1.4, 0.5, true, null),
  ('Cytryna (sok)', 'fruits', 'ml', 22, 6.9, 0.4, 0.2, true, null),
  ('Limonka (sok)', 'fruits', 'ml', 25, 8.4, 0.4, 0.1, true, null),

  -- ===============================
  -- TŁUSZCZE I OLEJE (FATS AND OILS)
  -- ===============================
  ('Oliwa z oliwek extra virgin', 'oils_fats', 'ml', 884, 0, 0, 100.0, true, null),
  ('Olej kokosowy', 'oils_fats', 'ml', 862, 0, 0, 100.0, true, null),
  ('Olej MCT', 'oils_fats', 'ml', 855, 0, 0, 100.0, true, null),
  ('Olej avocado', 'oils_fats', 'ml', 884, 0, 0, 100.0, true, null),
  ('Olej lniany', 'oils_fats', 'ml', 884, 0, 0, 100.0, true, null),
  ('Olej rzepakowy', 'oils_fats', 'ml', 884, 0, 0, 100.0, true, null),
  ('Olej sezamowy', 'oils_fats', 'ml', 884, 0, 0, 100.0, true, null),
  ('Ghee (masło klarowane)', 'oils_fats', 'g', 876, 0, 0, 99.5, true, null),
  ('Smalec', 'oils_fats', 'g', 902, 0, 0, 100.0, true, null),

  -- ===============================
  -- ORZECHY I NASIONA (NUTS AND SEEDS)
  -- ===============================
  -- Orzechy
  ('Orzechy włoskie', 'nuts_seeds', 'g', 654, 13.7, 15.2, 65.2, true, null),
  ('Migdały', 'nuts_seeds', 'g', 579, 21.6, 21.2, 49.9, true, null),
  ('Orzechy makadamia', 'nuts_seeds', 'g', 718, 13.8, 7.9, 75.8, true, null),
  ('Orzechy pekan', 'nuts_seeds', 'g', 691, 13.9, 9.2, 72.0, true, null),
  ('Orzechy brazylijskie', 'nuts_seeds', 'g', 656, 12.3, 14.3, 66.4, true, null),
  ('Orzechy laskowe', 'nuts_seeds', 'g', 628, 16.7, 15.0, 60.8, true, null),
  ('Orzechy nerkowca', 'nuts_seeds', 'g', 553, 30.2, 18.2, 43.9, true, null),
  ('Orzeszki piniowe', 'nuts_seeds', 'g', 673, 13.1, 13.7, 68.4, true, null),

  -- Nasiona
  ('Nasiona chia', 'nuts_seeds', 'g', 486, 42.1, 16.5, 30.7, true, null),
  ('Nasiona lnu', 'nuts_seeds', 'g', 534, 28.9, 18.3, 42.2, true, null),
  ('Nasiona słonecznika', 'nuts_seeds', 'g', 584, 20.0, 20.8, 51.5, true, null),
  ('Nasiona dyni', 'nuts_seeds', 'g', 559, 10.7, 30.2, 49.1, true, null),
  ('Nasiona sezamu', 'nuts_seeds', 'g', 573, 23.5, 17.7, 49.7, true, null),
  ('Tahini (pasta sezamowa)', 'nuts_seeds', 'g', 595, 21.2, 17.0, 53.8, true, null),

  -- Masła orzechowe (bez dodatku cukru)
  ('Masło migdałowe (100%)', 'nuts_seeds', 'g', 614, 18.8, 21.2, 55.5, true, null),
  ('Masło orzechowe (100% orzeszków ziemnych)', 'nuts_seeds', 'g', 588, 20.0, 25.8, 50.0, true, null),

  -- ===============================
  -- PRZYPRAWY I ZIOŁA (SPICES AND HERBS)
  -- ===============================
  -- Warzywa przyprawowe
  ('Czosnek (ząbek)', 'spices_herbs', 'g', 149, 33.1, 6.4, 0.5, true, null),
  ('Cebula biała', 'spices_herbs', 'g', 40, 9.3, 1.1, 0.1, true, null),
  ('Cebula czerwona', 'spices_herbs', 'g', 40, 9.3, 1.1, 0.1, true, null),
  ('Szalotka', 'spices_herbs', 'g', 72, 16.8, 2.5, 0.1, true, null),
  ('Imbir (świeży)', 'spices_herbs', 'g', 80, 17.8, 1.8, 0.8, true, null),

  -- Zioła świeże
  ('Bazylia (świeża)', 'spices_herbs', 'g', 23, 2.6, 3.2, 0.6, true, null),
  ('Kolendra (świeża)', 'spices_herbs', 'g', 23, 3.7, 2.1, 0.5, true, null),
  ('Pietruszka (świeża)', 'spices_herbs', 'g', 36, 6.3, 3.0, 0.8, true, null),
  ('Koper (świeży)', 'spices_herbs', 'g', 43, 7.0, 3.5, 1.1, true, null),
  ('Tymianek (świeży)', 'spices_herbs', 'g', 101, 24.5, 5.6, 1.7, true, null),
  ('Rozmaryn (świeży)', 'spices_herbs', 'g', 131, 20.7, 3.3, 5.9, true, null),
  ('Mięta (świeża)', 'spices_herbs', 'g', 70, 14.9, 3.8, 0.9, true, null),
  ('Szczypiork (świeży)', 'spices_herbs', 'g', 30, 4.4, 3.3, 0.7, true, null),

  -- Przyprawy suszone
  ('Sól', 'spices_herbs', 'g', 0, 0, 0, 0, true, null),
  ('Pieprz czarny', 'spices_herbs', 'g', 251, 63.9, 10.4, 3.3, true, null),
  ('Papryka słodka', 'spices_herbs', 'g', 282, 53.9, 14.1, 13.0, true, null),
  ('Papryka ostra', 'spices_herbs', 'g', 318, 56.6, 12.0, 17.3, true, null),
  ('Kurkuma', 'spices_herbs', 'g', 312, 67.1, 9.7, 3.3, true, null),
  ('Oregano (suszone)', 'spices_herbs', 'g', 265, 68.9, 9.0, 4.3, true, null),
  ('Kminek rzymski (kmin)', 'spices_herbs', 'g', 375, 44.2, 17.8, 22.3, true, null),
  ('Cynamon', 'spices_herbs', 'g', 247, 80.6, 4.0, 1.2, true, null),
  ('Gałka muszkatołowa', 'spices_herbs', 'g', 525, 49.3, 5.8, 36.3, true, null),
  ('Ziele angielskie', 'spices_herbs', 'g', 263, 72.1, 6.1, 8.7, true, null),
  ('Majeranek (suszony)', 'spices_herbs', 'g', 271, 60.6, 12.7, 7.0, true, null),

  -- ===============================
  -- MĄKI I ZAMIENNIKI (FLOURS - LOW-CARB)
  -- ===============================
  ('Mąka migdałowa', 'flours', 'g', 571, 21.4, 21.4, 50.0, true, null),
  ('Mąka kokosowa', 'flours', 'g', 354, 60.0, 19.3, 8.7, true, null),
  ('Mąka lniana (len mielony)', 'flours', 'g', 534, 28.9, 18.3, 42.2, true, null),
  ('Błonnik witalny (psyllium)', 'flours', 'g', 42, 88.0, 0.5, 0.6, true, null),

  -- ===============================
  -- SŁODZIKI (SWEETENERS - LOW-CARB)
  -- ===============================
  ('Erytrytol', 'sweeteners', 'g', 0.2, 0, 0, 0, true, null),
  ('Ksylitol', 'sweeteners', 'g', 240, 100.0, 0, 0, true, null),
  ('Stewia (ekstrakt)', 'sweeteners', 'g', 0, 0, 0, 0, true, null),
  ('Monkfruit (ekstrakt)', 'sweeteners', 'g', 0, 0, 0, 0, true, null),

  -- ===============================
  -- DODATKI (CONDIMENTS)
  -- ===============================
  ('Musztarda Dijon', 'condiments', 'g', 66, 5.3, 4.4, 3.3, true, null),
  ('Majonez', 'condiments', 'g', 680, 2.7, 1.0, 75.0, true, null),
  ('Sos sojowy', 'condiments', 'ml', 53, 4.9, 10.5, 0, true, null),
  ('Ocet winny', 'condiments', 'ml', 19, 0.3, 0.0, 0, true, null),
  ('Ocet jabłkowy', 'condiments', 'ml', 21, 0.9, 0.0, 0, true, null),
  ('Pasta pomidorowa (koncentrat)', 'condiments', 'g', 82, 18.9, 4.3, 0.5, true, null),
  ('Pomidory krojone (puszka)', 'condiments', 'g', 32, 7.3, 1.6, 0.3, true, null),
  ('Bulion warzywny (kostka)', 'condiments', 'g', 175, 28.0, 11.0, 2.5, true, null),
  ('Bulion drobiowy (kostka)', 'condiments', 'g', 180, 30.0, 10.0, 3.0, true, null),

  -- ===============================
  -- NAPOJE (BEVERAGES)
  -- ===============================
  ('Kawa', 'beverages', 'ml', 2, 0, 0.3, 0, true, null),
  ('Herbata', 'beverages', 'ml', 1, 0.3, 0, 0, true, null),
  ('Herbata zielona', 'beverages', 'ml', 1, 0, 0, 0, true, null),
  ('Woda mineralna', 'beverages', 'ml', 0, 0, 0, 0, true, null),
  ('Mleko migdałowe', 'beverages', 'ml', 17, 0.6, 0.6, 1.1, true, null),
  ('Mleko kokosowe', 'beverages', 'ml', 230, 6.0, 2.3, 24.0, true, null),
  ('Bulion kostny (wołowy)', 'beverages', 'ml', 15, 0, 3.0, 0.5, true, null);

-- =====================================================================
-- SECTION 2: SEED UNIT CONVERSIONS (content.ingredient_unit_conversions)
-- =====================================================================

insert into content.ingredient_unit_conversions (ingredient_id, unit_name, grams_equivalent)
values
  -- ===============================
  -- JAJA (EGGS)
  -- ===============================
  ((select id from content.ingredients where name = 'Jajko kurze (całe)'), 'sztuka', 60.00),
  ((select id from content.ingredients where name = 'Jajko kurze (całe)'), 'małe', 50.00),
  ((select id from content.ingredients where name = 'Jajko kurze (całe)'), 'duże', 70.00),
  ((select id from content.ingredients where name = 'Jajko kurze (białko)'), 'sztuka', 33.00),
  ((select id from content.ingredients where name = 'Jajko kurze (żółtko)'), 'sztuka', 17.00),

  -- ===============================
  -- WARZYWA PRZYPRAWOWE
  -- ===============================
  ((select id from content.ingredients where name = 'Czosnek (ząbek)'), 'ząbek', 5.00),
  ((select id from content.ingredients where name = 'Czosnek (ząbek)'), 'główka', 40.00),
  ((select id from content.ingredients where name = 'Cebula biała'), 'mała', 70.00),
  ((select id from content.ingredients where name = 'Cebula biała'), 'średnia', 110.00),
  ((select id from content.ingredients where name = 'Cebula biała'), 'duża', 150.00),
  ((select id from content.ingredients where name = 'Cebula czerwona'), 'mała', 70.00),
  ((select id from content.ingredients where name = 'Cebula czerwona'), 'średnia', 110.00),
  ((select id from content.ingredients where name = 'Szalotka'), 'sztuka', 25.00),
  ((select id from content.ingredients where name = 'Imbir (świeży)'), 'plasterek', 3.00),

  -- ===============================
  -- TŁUSZCZE I OLEJE
  -- ===============================
  -- Oleje (1 łyżka = 15ml, 1 łyżeczka = 5ml)
  ((select id from content.ingredients where name = 'Oliwa z oliwek extra virgin'), 'łyżka', 15.00),
  ((select id from content.ingredients where name = 'Oliwa z oliwek extra virgin'), 'łyżeczka', 5.00),
  ((select id from content.ingredients where name = 'Olej kokosowy'), 'łyżka', 15.00),
  ((select id from content.ingredients where name = 'Olej kokosowy'), 'łyżeczka', 5.00),
  ((select id from content.ingredients where name = 'Olej MCT'), 'łyżka', 15.00),
  ((select id from content.ingredients where name = 'Olej avocado'), 'łyżka', 15.00),
  ((select id from content.ingredients where name = 'Olej lniany'), 'łyżka', 15.00),
  ((select id from content.ingredients where name = 'Olej rzepakowy'), 'łyżka', 15.00),
  ((select id from content.ingredients where name = 'Olej sezamowy'), 'łyżeczka', 5.00),

  -- Masło i tłuszcze stałe
  ((select id from content.ingredients where name = 'Masło'), 'łyżka', 15.00),
  ((select id from content.ingredients where name = 'Masło'), 'łyżeczka', 5.00),
  ((select id from content.ingredients where name = 'Masło'), 'kostka', 200.00),
  ((select id from content.ingredients where name = 'Ghee (masło klarowane)'), 'łyżka', 15.00),
  ((select id from content.ingredients where name = 'Ghee (masło klarowane)'), 'łyżeczka', 5.00),

  -- ===============================
  -- PRODUKTY MLECZNE
  -- ===============================
  ((select id from content.ingredients where name = 'Śmietana 18%'), 'łyżka', 15.00),
  ((select id from content.ingredients where name = 'Śmietana 30%'), 'łyżka', 15.00),
  ((select id from content.ingredients where name = 'Jogurt grecki naturalny (pełnotłusty)'), 'łyżka', 17.00),
  ((select id from content.ingredients where name = 'Jogurt grecki naturalny (pełnotłusty)'), 'opakowanie', 150.00),

  -- ===============================
  -- ORZECHY I NASIONA
  -- ===============================
  -- Orzechy (1 garść = ~30g)
  ((select id from content.ingredients where name = 'Orzechy włoskie'), 'garść', 30.00),
  ((select id from content.ingredients where name = 'Orzechy włoskie'), 'sztuka', 5.00),
  ((select id from content.ingredients where name = 'Migdały'), 'garść', 30.00),
  ((select id from content.ingredients where name = 'Migdały'), 'sztuka', 1.20),
  ((select id from content.ingredients where name = 'Orzechy makadamia'), 'garść', 30.00),
  ((select id from content.ingredients where name = 'Orzechy makadamia'), 'sztuka', 2.00),
  ((select id from content.ingredients where name = 'Orzechy pekan'), 'garść', 30.00),
  ((select id from content.ingredients where name = 'Orzechy brazylijskie'), 'sztuka', 5.00),
  ((select id from content.ingredients where name = 'Orzechy laskowe'), 'garść', 30.00),
  ((select id from content.ingredients where name = 'Orzechy nerkowca'), 'garść', 30.00),

  -- Nasiona (1 łyżka = ~10-15g)
  ((select id from content.ingredients where name = 'Nasiona chia'), 'łyżka', 12.00),
  ((select id from content.ingredients where name = 'Nasiona chia'), 'łyżeczka', 4.00),
  ((select id from content.ingredients where name = 'Nasiona lnu'), 'łyżka', 10.00),
  ((select id from content.ingredients where name = 'Nasiona lnu'), 'łyżeczka', 3.00),
  ((select id from content.ingredients where name = 'Nasiona słonecznika'), 'łyżka', 12.00),
  ((select id from content.ingredients where name = 'Nasiona dyni'), 'łyżka', 12.00),
  ((select id from content.ingredients where name = 'Nasiona sezamu'), 'łyżka', 9.00),
  ((select id from content.ingredients where name = 'Tahini (pasta sezamowa)'), 'łyżka', 16.00),

  -- Masła orzechowe
  ((select id from content.ingredients where name = 'Masło migdałowe (100%)'), 'łyżka', 16.00),
  ((select id from content.ingredients where name = 'Masło migdałowe (100%)'), 'łyżeczka', 5.00),
  ((select id from content.ingredients where name = 'Masło orzechowe (100% orzeszków ziemnych)'), 'łyżka', 16.00),

  -- ===============================
  -- PRZYPRAWY I ZIOŁA
  -- ===============================
  -- Przyprawy suszone (1 łyżeczka = ~2-5g)
  ((select id from content.ingredients where name = 'Sól'), 'łyżeczka', 6.00),
  ((select id from content.ingredients where name = 'Sól'), 'szczypta', 0.50),
  ((select id from content.ingredients where name = 'Pieprz czarny'), 'łyżeczka', 2.00),
  ((select id from content.ingredients where name = 'Papryka słodka'), 'łyżeczka', 2.30),
  ((select id from content.ingredients where name = 'Papryka ostra'), 'łyżeczka', 2.00),
  ((select id from content.ingredients where name = 'Kurkuma'), 'łyżeczka', 3.00),
  ((select id from content.ingredients where name = 'Oregano (suszone)'), 'łyżeczka', 1.00),
  ((select id from content.ingredients where name = 'Kminek rzymski (kmin)'), 'łyżeczka', 2.10),
  ((select id from content.ingredients where name = 'Cynamon'), 'łyżeczka', 2.60),
  ((select id from content.ingredients where name = 'Gałka muszkatołowa'), 'łyżeczka', 2.20),

  -- Zioła świeże (1 garść = ~10-20g)
  ((select id from content.ingredients where name = 'Bazylia (świeża)'), 'liść', 0.50),
  ((select id from content.ingredients where name = 'Bazylia (świeża)'), 'pęczek', 25.00),
  ((select id from content.ingredients where name = 'Kolendra (świeża)'), 'pęczek', 25.00),
  ((select id from content.ingredients where name = 'Pietruszka (świeża)'), 'pęczek', 30.00),
  ((select id from content.ingredients where name = 'Koper (świeży)'), 'pęczek', 30.00),
  ((select id from content.ingredients where name = 'Szczypiork (świeży)'), 'pęczek', 20.00),

  -- ===============================
  -- DODATKI (CONDIMENTS)
  -- ===============================
  ((select id from content.ingredients where name = 'Musztarda Dijon'), 'łyżka', 15.00),
  ((select id from content.ingredients where name = 'Musztarda Dijon'), 'łyżeczka', 5.00),
  ((select id from content.ingredients where name = 'Majonez'), 'łyżka', 15.00),
  ((select id from content.ingredients where name = 'Majonez'), 'łyżeczka', 5.00),
  ((select id from content.ingredients where name = 'Sos sojowy'), 'łyżka', 15.00),
  ((select id from content.ingredients where name = 'Sos sojowy'), 'łyżeczka', 5.00),
  ((select id from content.ingredients where name = 'Ocet winny'), 'łyżka', 15.00),
  ((select id from content.ingredients where name = 'Ocet jabłkowy'), 'łyżka', 15.00),
  ((select id from content.ingredients where name = 'Pasta pomidorowa (koncentrat)'), 'łyżka', 17.00),
  ((select id from content.ingredients where name = 'Pomidory krojone (puszka)'), 'puszka', 400.00),
  ((select id from content.ingredients where name = 'Bulion warzywny (kostka)'), 'kostka', 10.00),
  ((select id from content.ingredients where name = 'Bulion drobiowy (kostka)'), 'kostka', 10.00),

  -- ===============================
  -- MĄKI (FLOURS)
  -- ===============================
  ((select id from content.ingredients where name = 'Mąka migdałowa'), 'szklanka', 112.00),
  ((select id from content.ingredients where name = 'Mąka migdałowa'), 'łyżka', 7.00),
  ((select id from content.ingredients where name = 'Mąka kokosowa'), 'szklanka', 112.00),
  ((select id from content.ingredients where name = 'Mąka kokosowa'), 'łyżka', 7.00),
  ((select id from content.ingredients where name = 'Mąka lniana (len mielony)'), 'łyżka', 7.00),
  ((select id from content.ingredients where name = 'Błonnik witalny (psyllium)'), 'łyżka', 5.00),
  ((select id from content.ingredients where name = 'Błonnik witalny (psyllium)'), 'łyżeczka', 2.00),

  -- ===============================
  -- SŁODZIKI
  -- ===============================
  ((select id from content.ingredients where name = 'Erytrytol'), 'łyżka', 12.00),
  ((select id from content.ingredients where name = 'Erytrytol'), 'łyżeczka', 4.00),
  ((select id from content.ingredients where name = 'Erytrytol'), 'szklanka', 200.00),
  ((select id from content.ingredients where name = 'Ksylitol'), 'łyżka', 12.00),
  ((select id from content.ingredients where name = 'Ksylitol'), 'łyżeczka', 4.00),

  -- ===============================
  -- WARZYWA (przydatne konwersje)
  -- ===============================
  ((select id from content.ingredients where name = 'Awokado'), 'średnie', 200.00),
  ((select id from content.ingredients where name = 'Awokado'), 'duże', 300.00),
  ((select id from content.ingredients where name = 'Pomidor'), 'mały', 80.00),
  ((select id from content.ingredients where name = 'Pomidor'), 'średni', 130.00),
  ((select id from content.ingredients where name = 'Pomidor'), 'duży', 180.00),
  ((select id from content.ingredients where name = 'Pomidory koktajlowe'), 'sztuka', 15.00),
  ((select id from content.ingredients where name = 'Papryka czerwona'), 'średnia', 150.00),
  ((select id from content.ingredients where name = 'Papryka zielona'), 'średnia', 150.00),
  ((select id from content.ingredients where name = 'Papryka żółta'), 'średnia', 150.00),
  ((select id from content.ingredients where name = 'Cukinia'), 'średnia', 250.00),
  ((select id from content.ingredients where name = 'Ogórek'), 'średni', 300.00),
  ((select id from content.ingredients where name = 'Brokuły'), 'główka', 500.00),
  ((select id from content.ingredients where name = 'Kalafior'), 'główka', 600.00),

  -- ===============================
  -- OWOCE
  -- ===============================
  ((select id from content.ingredients where name = 'Truskawki'), 'średnia', 12.00),
  ((select id from content.ingredients where name = 'Truskawki'), 'szklanka', 150.00),
  ((select id from content.ingredients where name = 'Maliny'), 'szklanka', 125.00),
  ((select id from content.ingredients where name = 'Borówki'), 'szklanka', 150.00),
  ((select id from content.ingredients where name = 'Cytryna (sok)'), 'średnia cytryna', 30.00),
  ((select id from content.ingredients where name = 'Limonka (sok)'), 'średnia limonka', 25.00);

-- =====================================================================
-- VERIFY SEED DATA
-- =====================================================================

-- count ingredients by category
select 'Total ingredients inserted:' as info, count(*)::text as count from content.ingredients
union all
select 'Ingredients by category:' as info, category::text || ': ' || count(*)::text as count
from content.ingredients
group by category
order by info;

-- count unit conversions
select 'Unit conversions inserted:' as info, count(*)::text as count from content.ingredient_unit_conversions;

-- sample ingredient data with nutritional values
select
  name,
  category,
  calories_per_100_units as cal_100g,
  protein_per_100_units as protein_100g,
  carbs_per_100_units as carbs_100g,
  fats_per_100_units as fats_100g,
  is_divisible
from content.ingredients
order by 2, 1
limit 10;

-- =====================================================================
-- INGREDIENTS SEED DATA COMPLETE
-- =====================================================================
-- Next steps:
-- 1. Run seed_recipes.sql to populate recipes
-- 2. Verify triggers calculate denormalized nutrition values correctly
-- =====================================================================
