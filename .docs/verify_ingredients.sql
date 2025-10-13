-- Weryfikacja składników: sprawdź, czy wszystkie składniki z seed_recipes.sql istnieją w seed_ingredients.sql
-- Uruchom PRZED wykonaniem seed_recipes.sql

-- Tymczasowa tabela ze składnikami używanymi w przepisach
create temp table recipe_ingredients_names as
select distinct
  regexp_replace(
    substring(line from 'from content\.ingredients where name = ''([^'']+)'),
    '^\s+|\s+$',
    '',
    'g'
  ) as ingredient_name
from (
  select unnest(string_to_array(
    pg_read_file('seed_recipes.sql'),
    E'\n'
  )) as line
) lines
where line like '%from content.ingredients where name =%'
  and line not like '%-- %';

-- Porównanie z istniejącymi składnikami
select
  r.ingredient_name,
  case
    when i.name is null then '❌ BRAK W INGREDIENTS'
    else '✅ OK'
  end as status
from recipe_ingredients_names r
left join content.ingredients i on i.name = r.ingredient_name
order by status desc, r.ingredient_name;
