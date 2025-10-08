# Dokument wymagań produktu (PRD) - LowCarbPlaner (MVP)

## 1. Przegląd produktu

LowCarbPlaner (MVP) to aplikacja mobilna zaprojektowana w celu uproszczenia życia osobom stosującym dietę niskowęglowodanową. Aplikacja eliminuje codzienne trudności związane z planowaniem posiłków i śledzeniem makroskładników poprzez automatyzację kluczowych procesów. Po krótkim procesie onboardingu, w którym użytkownik definiuje swoje cele, aplikacja automatycznie generuje spersonalizowany, 7-dniowy plan posiłków. Kluczową innowacją jest inteligentny algorytm, który skaluje gramaturę składników w istniejących przepisach, aby precyzyjnie dopasować kaloryczność i makro do indywidualnych potrzeb użytkownika. Aplikacja dostarcza również prosty, wizualny feedback na temat dziennych postępów oraz generuje zagregowaną listę zakupów, znacząco redukując wysiłek i zmęczenie decyzyjne związane z utrzymaniem diety.

## 2. Problem użytkownika

Osoby na diecie niskowęglowodanowej stają przed dwoma powtarzalnymi wyzwaniami, które często prowadzą do rezygnacji z obranych celów:

1.  Zmęczenie decyzyjne: Konieczność codziennego planowania posiłków (śniadanie, obiad, kolacja), które spełniają rygorystyczne założenia makroskładników, jest procesem czasochłonnym, monotonnym i wymagającym ciągłego zaangażowania. Prowadzi to do frustracji i wypalenia.
2.  Brak prostego feedbacku: Ręczne śledzenie spożytych kalorii i makroskładników za pomocą tradycyjnych aplikacji do liczenia kalorii jest skomplikowane i nie daje natychmiastowej, klarownej informacji o stopniu realizacji dziennego celu w kontekście zaplanowanej diety.

## 3. Wymagania funkcjonalne

### 3.1. Uwierzytelnianie Użytkownika

- Użytkownik może założyć konto przy użyciu adresu e-mail i hasła.
- Użytkownik może zalogować się na istniejące konto przy użyciu adresu e-mail i hasła.
- Użytkownik ma możliwość odzyskania zapomnianego hasła.
- Użytkownik może opcjonalnie zarejestrować się i logować za pomocą swojego konta Google. System powinien poprawnie połączyć konta, jeśli ten sam adres e-mail jest używany w obu metodach.

### 3.2. Onboarding i Kalkulator Celu

- Po pierwszej rejestracji użytkownik jest przeprowadzany przez obowiązkowy, sekwencyjny proces onboardingu.
- Proces zbiera następujące dane: płeć, wiek (w latach), waga (w kg), wzrost (w cm), poziom aktywności fizycznej (predefiniowane opcje: bardzo niska, niska, umiarkowana, wysoka, bardzo wysoka), cel (utrata wagi, utrzymanie wagi).
- Dla celu "utrata wagi" użytkownik wybiera tempo z predefiniowanych opcji (0.25, 0.5, 0.75, 1.0 kg/tydzień).
- System oblicza Podstawową Przemianę Materii (PPM) za pomocą wzoru Mifflin-St Jeor i Całkowitą Przemianę Materii (CPM) z uwzględnieniem współczynnika aktywności fizycznej (PAL).
- System blokuje możliwość wyboru tempa chudnięcia, które skutkowałoby dietą poniżej 1400 kcal dla kobiet lub 1600 kcal dla mężczyzn.
- Użytkownikowi prezentowany jest wynik: dzienne zapotrzebowanie kaloryczne oraz stały rozkład makroskładników (Węglowodany: 15%, Białko: 35%, Tłuszcze: 50%). Użytkownik musi zatwierdzić te cele, aby kontynuować.
- Przed zatwierdzeniem celów, użytkownik musi zaakceptować obowiązkowy, niepomijalny disclaimer informujący o braku obsługi alergii i nietolerancji pokarmowych oraz zalecający konsultację z lekarzem.

### 3.3. Automatyczne Generowanie Planu Posiłków

- Na podstawie zatwierdzonych celów, aplikacja generuje w tle 7-dniowy plan posiłków (śniadanie, obiad, kolacja).
- Algorytm dopasowuje kaloryczność i makra posiłków poprzez skalowanie gramatury składników oznaczonych w bazie jako "skalowalne" (np. mięso, oliwa), z zachowaniem stałych ilości składników "nieskalowalnych" (np. jajko, plaster sera).
- Generowanie planu odbywa się z dopuszczalnym marginesem błędu +/- 5% w stosunku do dziennego celu kalorycznego.
- Algorytm zapewnia, że to samo danie nie pojawi się w planie częściej niż raz na 7 dni.
- Plan jest generowany w modelu "kroczącego okna": każdego dnia, przy starcie aplikacji, system sprawdza, czy istnieją plany na najbliższe 7 dni i do-generowuje brakujące dni.

### 3.4. Główny Ekran (Widok Dnia)

- Ekran domyślny aplikacji, pokazujący posiłki (śniadanie, obiad, kolacja) na bieżący dzień.
- Wyświetla cztery oddzielne, wizualne paski postępu dla: Kalorii, Białka, Węglowodanów i Tłuszczów, pokazujące aktualne spożycie względem dziennego celu.
- Przy każdym posiłku znajduje się przycisk/checkbox "Zjedzono", którego zaznaczenie aktualizuje paski postępu.

### 3.5. Zarządzanie Posiłkami

- Użytkownik może wymienić dowolny posiłek w planie na inną propozycję. Aplikacja przedstawia listę dań zastępczych, posortowaną według najmniejszej różnicy w kaloryczności.
- Użytkownik może modyfikować gramaturę składników oznaczonych jako "skalowalne" w posiłkach zaplanowanych na bieżący dzień. Zmiana gramatury natychmiast przelicza wartości odżywcze posiłku i aktualizuje paski postępu (jeśli posiłek jest oznaczony jako zjedzony).

### 3.6. Widok Przepisu

- Dostępny po kliknięciu na posiłek.
- Zawiera: zdjęcie dania, listę składników z gramaturą/ilością, instrukcję przygotowania krok po kroku.
- Wyświetla stałą informację o konieczności weryfikacji składników pod kątem osobistych alergii.

### 3.7. Automatyczna Lista Zakupów

- Aplikacja generuje jedną, zagregowaną listę zakupów na nadchodzące 6 dni planu (z wyłączeniem dnia bieżącego).
- Lista jest tworzona na podstawie oryginalnie wygenerowanego planu i nie uwzględnia modyfikacji gramatury ani wymiany posiłków dokonanych przez użytkownika.
- Te same składniki z różnych przepisów są sumowane (np. 150g kurczaka z obiadu + 200g z kolacji = 350g kurczaka na liście).
- Użytkownik może odznaczać produkty na liście. Odznaczony produkt jest przekreślany i przenoszony na dół listy.

### 3.8. Profil Użytkownika i Ustawienia

- Użytkownik może edytować swoje dane profilowe (waga, poziom aktywności). Zmiana danych powoduje przeliczenie celów i aktualizację planu od bieżącego dnia wprzód.
- Użytkownik ma możliwość zresetowania całego planu i ponownego przejścia przez proces onboardingu.
- W ustawieniach znajduje się dostęp do formularza opinii.

### 3.9. Mechanizm Zbierania Opinii

- W aplikacji dostępny jest prosty formularz "Zgłoś problem".
- Formularz zawiera jedno pole tekstowe na opis problemu i przycisk "Wyślij".
- Wysłane zgłoszenie jest zapisywane w bazie danych wraz z ID użytkownika, wersją aplikacji i systemem operacyjnym.

### 3.10. Dostęp Offline

- Wygenerowany 7-dniowy plan posiłków jest przechowywany lokalnie na urządzeniu.
- Użytkownik ma dostęp do swojego planu (widok dnia, przepisy) i listy zakupów bez aktywnego połączenia z internetem.

## 4. Granice produktu

Poniższe funkcjonalności są świadomie wykluczone z zakresu MVP w celu skupienia się na walidacji kluczowej hipotezy produktu:

- Brak możliwości ręcznego dodawania własnych produktów, posiłków lub budowania planu od zera.
- Brak możliwości zmiany domyślnego rozkładu makroskładników (15%W/35%B/50%T).
- Brak obsługi wykluczeń żywieniowych, alergii, nietolerancji czy preferencji (np. wegetarianizm).
- Brak funkcji społecznościowych, gamifikacji, powiadomień push.
- Brak integracji z zewnętrznymi urządzeniami (np. smartwatche) czy aplikacjami zdrowotnymi.
- Brak widoku danych historycznych, podsumowań tygodniowych/miesięcznych i archiwum planów.
- Brak jakichkolwiek form monetyzacji (aplikacja jest w pełni darmowa).

## 5. Historyjki użytkowników

### 5.1. Uwierzytelnianie

#### **US-001: Rejestracja przez e-mail**

**Jako** nowy użytkownik
**Chcę** móc założyć konto za pomocą mojego adresu e-mail i hasła
**Aby** uzyskać dostęp do aplikacji

**Kryteria akceptacji:**

1. Formularz rejestracji zawiera pola: e-mail, hasło, powtórz hasło
2. Walidacja sprawdza poprawność formatu e-mail
3. Walidacja sprawdza, czy hasła w obu polach są identyczne
4. System sprawdza, czy e-mail nie jest już zarejestrowany
5. Po pomyślnej rejestracji, jestem automatycznie zalogowany i przekierowany do onboardingu

---

#### **US-002: Logowanie przez e-mail**

**Jako** zarejestrowany użytkownik
**Chcę** móc zalogować się za pomocą mojego e-maila i hasła
**Aby** kontynuować korzystanie z aplikacji

**Kryteria akceptacji:**

1. Formularz logowania zawiera pola: e-mail, hasło
2. Po podaniu poprawnych danych, jestem zalogowany i widzę główny ekran aplikacji ("Widok Dnia")
3. Po podaniu błędnych danych, widzę stosowny komunikat o błędzie

---

#### **US-003: Odzyskiwanie hasła**

**Jako** zarejestrowany użytkownik, który zapomniał hasła
**Chcę** móc je zresetować
**Aby** odzyskać dostęp do konta

**Kryteria akceptacji:**

1. Na ekranie logowania jest link "Zapomniałem hasła"
2. Po kliknięciu i podaniu adresu e-mail, otrzymuję na skrzynkę wiadomość z linkiem do resetu hasła
3. Link prowadzi do formularza, gdzie mogę ustawić nowe hasło

---

#### **US-004: Rejestracja / Logowanie przez Google**

**Jako** użytkownik
**Chcę** móc zarejestrować się lub zalogować jednym kliknięciem za pomocą mojego konta Google
**Aby** przyspieszyć ten proces

**Kryteria akceptacji:**

1. Na ekranie logowania/rejestracji jest przycisk "Kontynuuj z Google"
2. Po kliknięciu i autoryzacji w Google, jestem zalogowany
3. Jeśli to pierwsze logowanie, jestem przekierowany do onboardingu. Jeśli już mam konto, widzę "Widok Dnia"

---

### 5.2. Onboarding i Generowanie Planu

#### **US-005: Przeprowadzenie przez onboarding**

**Jako** nowy użytkownik, po rejestracji
**Chcę** przejść przez prosty konfigurator
**Aby** aplikacja mogła obliczyć moje zapotrzebowanie

**Kryteria akceptacji:**

1. Proces składa się z kolejnych ekranów zbierających: płeć, wiek, wagę, wzrost, poziom aktywności, cel
2. Każdy krok ma jasne instrukcje
3. Nie mogę pominąć żadnego kroku

---

#### **US-006: Wybór tempa utraty wagi**

**Jako** użytkownik chcący schudnąć
**Chcę** wybrać preferowane tempo utraty wagi
**Aby** dostosować dietę do moich oczekiwań

**Kryteria akceptacji:**

1. Widzę listę opcji (np. 0.25, 0.5 kg/tydzień)
2. Opcje, które prowadziłyby do diety poniżej bezpiecznego minimum kalorycznego (1400/1600 kcal), są nieaktywne/wyszarzone

---

#### **US-007: Prezentacja i akceptacja celów**

**Jako** użytkownik, po podaniu danych
**Chcę** zobaczyć podsumowanie moich obliczonych celów (kalorie, makro)
**Aby** je świadomie zatwierdzić

**Kryteria akceptacji:**

1. Widzę ekran podsumowujący z wyliczonym dziennym zapotrzebowaniem na kalorie, białko, węglowodany i tłuszcze
2. Muszę kliknąć przycisk "Zatwierdź", aby przejść dalej

---

#### **US-008: Akceptacja disclaimera**

**Jako** użytkownik, przed rozpoczęciem diety
**Chcę** zobaczyć i zaakceptować informację o braku obsługi alergii
**Aby** być świadomym ryzyka

**Kryteria akceptacji:**

1. Wyświetlany jest ekran z treścią disclaimera
2. Przycisk kontynuacji jest nieaktywny, dopóki nie zaznaczę checkboxa "Rozumiem i akceptuję"

---

#### **US-009: Generowanie pierwszego planu**

**Jako** nowy użytkownik, po zakończeniu onboardingu
**Chcę** aby aplikacja automatycznie wygenerowała dla mnie pierwszy 7-dniowy plan posiłków
**Aby** móc od razu rozpocząć dietę

**Kryteria akceptacji:**

1. Po zatwierdzeniu celów widzę ekran ładowania z informacją "Generowanie Twojego planu..."
2. Proces nie powinien trwać dłużej niż 15 sekund
3. Po zakończeniu jestem przekierowany do "Widoku Dnia" na dziś

---

### 5.3. Codzienne Użytkowanie

#### **US-010: Przeglądanie dziennego planu**

**Jako** użytkownik
**Chcę** na głównym ekranie widzieć posiłki zaplanowane na dzisiaj
**Aby** wiedzieć, co mam zjeść

**Kryteria akceptacji:**

1. Ekran główny domyślnie pokazuje bieżący dzień
2. Widoczne są 3 sekcje: Śniadanie, Obiad, Kolacja
3. Każda sekcja zawiera nazwę dania i jego kaloryczność

---

#### **US-011: Oznaczanie posiłku jako zjedzony**

**Jako** użytkownik
**Chcę** móc oznaczyć posiłek jako zjedzony
**Aby** śledzić swój postęp w ciągu dnia

**Kryteria akceptacji:**

1. Przy każdym posiłku znajduje się checkbox lub przycisk "Zjedzono"
2. Po kliknięciu, przycisk zmienia stan na "zaznaczony"
3. Ponowne kliknięcie odznacza posiłek

---

#### **US-012: Obserwowanie postępu**

**Jako** użytkownik
**Chcę** widzieć paski postępu, które aktualizują się po zjedzeniu posiłku
**Aby** na bieżąco monitorować realizację celu

**Kryteria akceptacji:**

1. Na ekranie widoczne są 4 paski postępu: Kalorie, Białko, Węglowodany, Tłuszcze
2. Po oznaczeniu posiłku jako zjedzony, paski wypełniają się adekwatnie do wartości odżywczych tego posiłku
3. Po odznaczeniu posiłku, wartości na paskach są odejmowane

---

#### **US-013: Przeglądanie przepisu**

**Jako** użytkownik
**Chcę** móc kliknąć na posiłek
**Aby** zobaczyć szczegółowy przepis i instrukcje przygotowania

**Kryteria akceptacji:**

1. Kliknięcie na kafelek posiłku przenosi mnie do ekranu przepisu
2. Ekran przepisu zawiera zdjęcie, listę składników i instrukcję "krok po kroku"

---

### 5.4. Zarządzanie Posiłkami i Listą Zakupów

#### **US-014: Wymiana posiłku**

**Jako** użytkownik, jeśli nie mam ochoty na proponowane danie
**Chcę** je wymienić na inne o podobnych wartościach odżywczych
**Aby** móc dostosować plan do swoich preferencji

**Kryteria akceptacji:**

1. Przy każdym posiłku jest przycisk "Zmień danie"
2. Po kliknięciu widzę listę alternatywnych dań
3. Lista jest posortowana od dań najbardziej zbliżonych kalorycznie
4. Wybór dania z listy podmienia je w moim planie na dany dzień

---

#### **US-015: Modyfikacja gramatury składnika**

**Jako** użytkownik
**Chcę** móc dostosować ilość kluczowego składnika w posiłku (np. więcej mięsa)
**Aby** dopasować go do moich preferencji

**Kryteria akceptacji:**

1. W widoku przepisu na bieżący dzień, przy składnikach oznaczonych jako "skalowalne", mogę edytować ich gramaturę
2. Mogę to zrobić za pomocą przycisków +/- lub wpisując wartość z klawiatury (walidacja 1-1000g)
3. Zmiana gramatury natychmiast przelicza wartości odżywcze całego posiłku

---

#### **US-016: Dostęp do listy zakupów**

**Jako** użytkownik
**Chcę** mieć dostęp do automatycznie wygenerowanej listy zakupów
**Aby** ułatwić sobie cotygodniowe zakupy

**Kryteria akceptacji:**

1. W aplikacji jest dedykowana sekcja "Lista Zakupów"
2. Lista zawiera zsumowane ilości wszystkich składników potrzebnych na nadchodzące 6 dni
3. Otrzymuję informację, że lista bazuje na oryginalnym planie i nie uwzględnia moich modyfikacji

---

#### **US-017: Interakcja z listą zakupów**

**Jako** użytkownik w sklepie
**Chcę** móc odznaczać kupione produkty
**Aby** nie zgubić się na liście

**Kryteria akceptacji:**

1. Przy każdej pozycji na liście zakupów jest checkbox
2. Po zaznaczeniu checkboxa, pozycja zostaje wizualnie przekreślona i przeniesiona na koniec listy
3. Odznaczenie przywraca pozycję na jej oryginalne miejsce

---

### 5.5. Profil i Feedback

#### **US-018: Edycja danych profilowych**

**Jako** użytkownik, którego waga się zmieniła
**Chcę** zaktualizować swoje dane w profilu
**Aby** aplikacja przeliczyła moje zapotrzebowanie

**Kryteria akceptacji:**

1. W ustawieniach mogę edytować swoją wagę i poziom aktywności
2. Po zapisaniu zmian, aplikacja informuje, że plan zostanie zaktualizowany
3. Plan posiłków od bieżącego dnia wprzód zostaje przeliczony zgodnie z nowymi celami

---

#### **US-019: Resetowanie planu**

**Jako** użytkownik, który chce zacząć od nowa
**Chcę** mieć możliwość zresetowania planu i ponownego przejścia onboardingu
**Aby** móc na nowo skonfigurować aplikację

**Kryteria akceptacji:**

1. W ustawieniach znajduje się opcja "Zacznij od nowa"
2. Po potwierdzeniu chęci resetu, wszystkie dane o planie są usuwane, a ja jestem przenoszony na pierwszy ekran onboardingu

---

#### **US-020: Zgłaszanie problemu/opinii**

**Jako** użytkownik, który napotkał błąd lub ma sugestię
**Chcę** móc łatwo wysłać wiadomość do twórców aplikacji
**Aby** pomóc w ulepszeniu produktu

**Kryteria akceptacji:**

1. W menu aplikacji znajduje się opcja "Zgłoś problem"
2. Otwiera się ekran z jednym polem tekstowym i przyciskiem "Wyślij"
3. Po wysłaniu wiadomości widzę komunikat z podziękowaniem za opinię

---

### 5.6. Dostęp Offline

#### **US-021: Dostęp do planu bez internetu**

**Jako** użytkownik
**Chcę** móc przeglądać mój plan na najbliższe 7 dni nawet bez dostępu do internetu
**Aby** mieć ciągły dostęp do mojego planu żywieniowego

**Kryteria akceptacji:**

1. Po pierwszym wygenerowaniu, cały 7-dniowy plan jest zapisany na urządzeniu
2. Mogę otworzyć aplikację w trybie offline i widzieć widok dnia oraz przepisy
3. Lista zakupów jest również dostępna w trybie offline
4. W trybie offline nie mogę wymieniać posiłków ani generować nowych dni planu

## 6. Metryki sukcesu

### 6.1. Cel Główny MVP

Głównym celem MVP jest weryfikacja technicznej stabilności kluczowych funkcji oraz potwierdzenie, że główna pętla funkcjonalna (onboarding -> generowanie planu -> śledzenie postępu) jest zrozumiała, używalna i działa poprawnie z perspektywy użytkownika.

### 6.2. Kluczowe Metryki Sukcesu

Sukces MVP będzie mierzony za pomocą następujących wskaźników:

1.  Walidacja Koncepcji poprzez Jakościowy Feedback (Metryka Pierwotna):
    - Cel: Zebranie minimum 50 unikalnych, konkretnych i możliwych do wdrożenia zgłoszeń (błędów lub sugestii użyteczności) od użytkowników w ciągu pierwszego miesiąca po uruchomieniu.
    - Sposób pomiaru: Analiza zgłoszeń zebranych za pomocą wbudowanego formularza opinii. Product Owner będzie odpowiedzialny za kategoryzację i priorytetyzację zgłoszeń. Sukcesem jest zebranie bazy wiedzy wystarczającej do stworzenia priorytetowej listy poprawek na kolejną iterację.

2.  Stabilność Techniczna (Metryka Wtórna):
    - Cel: Wskaźnik pomyślnego wygenerowania planu diety na poziomie >99% dla wszystkich użytkowników kończących onboarding.
    - Sposób pomiaru: Monitorowanie logów serwera pod kątem błędów krytycznych w module generatora planu.

3.  Podstawowe Zaangażowanie Użytkownika (Metryka Wtórna):
    - Cel: Osiągnięcie wskaźnika retencji D7 (procent użytkowników, którzy wrócili do aplikacji 7 dni po instalacji) na poziomie umożliwiającym zebranie wiarygodnego feedbacku.
    - Sposób pomiaru: Podstawowe narzędzie analityczne śledzące kohorty nowych użytkowników.
