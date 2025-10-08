# **Aplikacja - LowCarbPlaner (MVP)**

## 1. Główny Problem i Rozwiązanie

### Problem

Osoby na diecie niskowęglowodanowej borykają się z dwoma głównymi problemami:

1.  **Ciągłe zmęczenie decyzyjne:** Codzienne wymyślanie posiłków i wyliczanie swojego zapotrzebowania jest czasochłonne i frustrujące.
2.  **Brak prostego feedbacku:** Trudno jest na bieżąco monitorować realizację dziennych założeń, nie korzystając ze skomplikowanych aplikacji.

### Rozwiązanie

Aplikacja rozwiązuje te problemy, **automatycznie wyliczając zapotrzebowanie użytkownika, dostarczając gotowy plan posiłków** oparty na stałym rozkładzie makro i dając **natychmiastową informację zwrotną** o postępach w ciągu dnia.

## 2. Najmniejszy Zestaw Funkcjonalności (MVP)

1.  **Rejestracja i Logowanie:**
    - Możliwość założenia konta przez **e-mail/hasło**.
    - Opcjonalne logowanie/rejestracja za pomocą **konta Google**.

2.  **Zautomatyzowany Onboarding (Kalkulator Celu):**
    - Po rejestracji użytkownik przechodzi przez krótki proces w celu obliczenia jego celów.
    - **Kroki:** Użytkownik podaje płeć, wiek, wagę, wzrost, poziom aktywności fizycznej oraz cel (utrata wagi lub jej utrzymanie). Następnie wybiera preferowane tempo chudnięcia z predefiniowanych opcji (np. 0.25, 0.5, 0.75, 1.0 kg/tydzień).
    - **Wynik:** Na podstawie tych danych, aplikacja oblicza docelowe dzienne zapotrzebowanie kaloryczne. **Aplikacja blokuje wybór tempa chudnięcia, który prowadziłby do diety poniżej bezpiecznego minimum (1400 kcal dla kobiet i 1600 kcal dla mężczyzn)**. Aplikacja automatycznie stosuje stały rozkład makroskładników (Węglowodany: 15%, Białko: 35%, Tłuszcze: 50%). Użytkownik zatwierdza wyliczone cele.

3.  **Automatyczne Generowanie Planu na 7 Dni:**
    - Na podstawie celów z onboardingu, aplikacja generuje w tle kompletny plan posiłków na 7 dni (śniadanie, obiad, kolacja).
    - **Kluczowy mechanizm:** Aplikacja nie korzysta z tysięcy unikalnych przepisów. Zamiast tego, posiada zdefiniowaną bazę dań, a jej **algorytm inteligentnie skaluje gramaturę _skalowalnych_ składników** (np. mięsa, źródeł tłuszczu), aby idealnie dopasować kaloryczność i makroskładniki każdego posiłku do indywidualnych celów użytkownika. Składniki, których nie można dzielić w prosty sposób (np. jajko), pozostają w stałych, nieskalowalnych ilościach.

4.  **Główny Ekran - "Widok Dnia":**
    - Centralny ekran aplikacji, pokazujący 3 posiłki na bieżący dzień.
    - Prosty, wizualny **pasek postępu** kalorii i makroskładników.
    - Przycisk **"Zjedzono"** przy każdym posiłku, który aktualizuje pasek postępu.

5.  **Możliwość Wymiany Posiłku:**
    - Przycisk "Zmień danie" pozwalający podmienić posiłek na inny o podobnych parametrach.

6.  **Widok Przepisu ze Zmianą Gramatury:**
    - Ekran z listą składników i instrukcją przygotowania.
    - **Tylko dla posiłków z bieżącego dnia**, użytkownik może dowolnie zmodyfikować gramaturę kluczowych, "skalowalnych" składników (np. mięso). Zmiana natychmiast przelicza wartości odżywcze posiłku.

7.  **Automatyczna Lista Zakupów:**
    - Generuje jedną, zagregowaną listę zakupów **na nadchodzące 6 dni planu (z wyłączeniem dnia bieżącego)**.
    - Lista jest tworzona na podstawie oryginalnie wygenerowanych i przeskalowanych przez algorytm przepisów. Zmiany gramatury dokonywane przez użytkownika w "Widoku Dnia" nie wpływają na tę listę, ponieważ dotyczą one bieżącej konsumpcji, a nie przyszłych zakupów.

## 3. Co NIE Wchodzi w Zakres MVP

- **Zaawansowana personalizacja:** Brak możliwości ręcznego budowania planu, dodawania własnych produktów, **zmiany domyślnego rozkładu makroskładników**, pełnej edycji przepisów.
- **Szczegółowe śledzenie:** Brak możliwości manualnego wpisywania produktów spoza planu.
- **Wykluczenia i preferencje żywieniowe:** MVP nie uwzględnia alergii, nietolerancji, wegetarianizmu itp.
- **Integracje i funkcje dodatkowe:** Brak funkcji społecznościowych, powiadomień push, integracji z urządzeniami.
- **Dane historyczne:** Brak widoku podsumowań i archiwum planów.
- **Monetyzacja:** Aplikacja jest w pełni darmowa.

## 4. Cel i Kryteria Sukcesu MVP

### Cel Główny

Weryfikacja technicznej stabilności i poprawnego działania kluczowych funkcji aplikacji. Celem jest **potwierdzenie, że aplikacja jest używalna, bezkrytycznych błędów, a jej główna pętla funkcjonalna (onboarding -> generowanie planu -> śledzenie postępu) jest zrozumiała i działa poprawnie.**

### Kluczowy Miernik Sukcesu: Zebranie Jakościowego Feedbacku

Sukces MVP będzie mierzony na podstawie zebranych opinii od użytkowników, które pozwolą zidentyfikować najważniejsze problemy do naprawy.

- **Cel:** Zidentyfikowanie i zrozumienie najważniejszych problemów technicznych (błędów krytycznych, bugów) oraz barier w użyteczności (niezrozumiałe funkcje, frustrujące elementy interfejsu).
- **Mechanizm:** W aplikacji zostanie zaimplementowany **wbudowany formularz** (dostępny np. w menu pod hasłem "Zgłoś problem"). Formularz będzie zawierał jedno pole tekstowe oraz przycisk "Wyślij". Przesłane opinie będą **zapisywane bezpośrednio w bazie danych aplikacji** wraz z identyfikatorem użytkownika.
- **Pytanie w formularzu:**
  > **"Czy napotkałeś/aś na jakiekolwiek problemy lub błędy podczas korzystania z aplikacji? Jeśli tak, opisz je krótko."**
- **Definicja Sukcesu:** MVP odniesie sukces, jeśli **zbierzemy wystarczającą ilość konkretnych opinii, które pozwolą nam stworzyć listę priorytetowych poprawek** niezbędnych do dalszego rozwoju aplikacji. Skupiamy się na jakości i głębokości feedbacku, aby dowiedzieć się, co "nie działa" z perspektywy użytkownika.
