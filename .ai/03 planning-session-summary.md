<conversation_summary>
<decisions>

1.  **Kryterium sukcesu MVP:** Sukces zostanie zdefiniowany jako zebranie co najmniej 50 unikalnych, możliwych do wdrożenia zgłoszeń w ciągu pierwszego miesiąca. Product Owner jest odpowiedzialny za analizę i priorytetyzację.
2.  **Makroskładniki:** W MVP obowiązuje stały rozkład 15/35/50 w celu testowania technicznego. Użytkownik zostanie o tym poinformowany w onboardingu.
3.  **Ryzyko prawne (alergie):** Zostanie zminimalizowane poprzez dwuetapowe zabezpieczenie: obowiązkowy, niepomijalny disclaimer w onboardingu oraz stała informacja w widoku przepisów.
4.  **Wymiana posiłków:** Posilek zastępczy musi mieć zbliżoną kaloryczność i makroskładniki, aby nie zaburzyć bilansu dziennego. W przypadku braku idealnego dopasowania, aplikacja zaproponuje najlepsze dostępne opcje, wskazując na różnice. Propozycje będą sortowane według najmniejszej różnicy w kaloriach.
5.  **Dokładność kaloryczna:** Wprowadzony zostanie dopuszczalny margines błędu +/- 5% dla dziennego zapotrzebowania kalorycznego.
6.  **Cele użytkownika:** MVP będzie obsługiwać wyłącznie cele "utrata wagi" i "utrzymanie wagi". Funkcja budowy masy zostanie zakomunikowana jako planowana na przyszłość.
7.  **Baza przepisów:** Aplikacja wystartuje z minimalną liczbą dań na każdy posiłek (np. 15 śniadań, 20 obiadów, 20 kolacji), a algorytm zapewni, że to samo danie nie pojawi się częściej niż raz na 7 dni.
8.  **Kalkulator zapotrzebowania:** Obliczenia będą oparte o wzór Mifflin-St Jeor oraz zdefiniowane współczynniki aktywności fizycznej (PAL). Aplikacja będzie używać średniej wartości z podanych zakresów PAL.
9.  **Lista zakupów:** Będzie generowana na podstawie oryginalnego planu i nie będzie uwzględniać ręcznych modyfikacji użytkownika. Użytkownik zostanie o tym poinformowany. Lista będzie inteligentnie agregować te same składniki.
10. **Model biznesowy:** MVP będzie darmowe, ale architektura od początku uwzględni przyszłą monetyzację (np. pole `is_premium` w modelu użytkownika).
11. **Tworzenie przepisów:** Za treść odpowiada dietetyk. Przepisy będą wprowadzane za pomocą ustrukturyzowanych plików (JSON/arkusz), a nie dedykowanego CMS. Szablon przepisu będzie szczegółowy, ale zdjęcia do kroków będą opcjonalne (jeśli ich nie ma, wyświetli się zdjęcie główne). Każdy składnik będzie miał flagę `is_scalable`.
12. **Modyfikacja gramatury:** Interfejs będzie zawierał przyciski +/- oraz możliwość ręcznego wpisania wartości z klawiatury z walidacją (1-1000g).
13. **Reset planu:** Użytkownik będzie miał możliwość zresetowania planu i ponownego przejścia onboardingu. Będzie także mógł edytować swój profil (np. wagę), a zmiana będzie dotyczyła planu od bieżącego dnia.
14. **Feedback:** Product Owner będzie miał bezpośredni wgląd do bazy danych. Zgłoszenia będą miały flagę `is_read` do zarządzania nowymi opiniami. Zgłoszenia będą automatycznie wzbogacane o dane techniczne (wersja aplikacji, OS).
15. **Generowanie planu:** Plan będzie generowany w modelu "kroczącego okna 7-dniowego". Brakujące dni będą generowane przy uruchomieniu aplikacji. Proces będzie transakcyjny. Po dłuższej nieobecności stary plan jest odrzucany i generowany jest nowy 7-dniowy plan.
16. **Obsługa jednostek:** Aplikacja będzie obsługiwać "przyjazne" jednostki (łyżka, szklanka). W bazie danych każdy składnik będzie miał zdefiniowane własne przeliczniki na gramy. Na liście zakupów ilości będą zagregowane i wyświetlane w jednostkach podstawowych (gramy, ml, sztuki).
17. **Tryb offline:** Wygenerowany 7-dniowy plan będzie zapisywany lokalnie, umożliwiając dostęp do niego bez połączenia z internetem.
18. **Interfejs użytkownika:** Nawigacja w wersji desktopowej będzie oparta o menu po lewej stronie. Na ekranie głównym znajdą się 4 osobne paski postępu (Kalorie, B, W, T) ze zdefiniowanym systemem kolorów (niebieski, zielony, czerwony). Zaznaczone produkty na liście zakupów będą przekreślane i przenoszone na dół listy.
19. **Logowanie:** Proces logowania i odzyskiwania hasła będzie oparty o standardowe mechanizmy. Supabase Auth zapewni, że logowanie przez e-mail i Google będzie prowadziło do jednego konta.
    </decisions>

<matched_recommendations>

1.  **Strategia MVP:** Skupienie się na weryfikacji kluczowej hipotezy (automatyczne generowanie diety) poprzez świadome ograniczenie funkcjonalności (tylko utrata/utrzymanie wagi, stałe makro) i zdefiniowanie mierzalnego celu (50 opinii w miesiąc).
2.  **Zarządzanie Ryzykiem:** Zastosowanie dwuetapowego, wyraźnego systemu ostrzeżeń (disclaimer) w celu minimalizacji ryzyka prawnego i zdrowotnego związanego z brakiem obsługi alergii.
3.  **Uproszczenie Logiki:** Wdrożenie logiki "kroczącego okna 7-dniowego" z generowaniem dni na żądanie przy starcie aplikacji, co zapewnia ciągłość planu przy minimalnej złożoności backendu.
4.  **Doświadczenie Użytkownika (UX):** Zapewnienie płynności działania poprzez buforowanie planu do trybu offline, stosowanie ekranów ładowania podczas generowania planu oraz dostarczanie natychmiastowej informacji zwrotnej (np. zmiana koloru pasków postępu po przekroczeniu celu).
5.  **Skalowalna Architektura:** Projektowanie bazy danych z myślą o przyszłości, m.in. poprzez dodanie flagi `is_premium`, zdefiniowanie szczegółowej struktury dla przepisów (flaga `is_scalable`) oraz systemu przeliczników jednostek per składnik.
6.  **Zwinny Proces Tworzenia Treści:** Rezygnacja z budowy dedykowanego CMS w MVP na rzecz importu danych z plików JSON/arkuszy, co pozwala skupić zasoby deweloperskie na aplikacji dla użytkownika.
7.  **Spójność Danych:** Wprowadzenie zasady korzystania z predefiniowanej, spójnej listy składników zamiast budowania systemu synonimów, co zapewnia poprawne agregowanie produktów na liście zakupów.
8.  **Pętla Feedbacku:** Zaimplementowanie prostego, ale skutecznego mechanizmu zbierania opinii, który automatycznie dołącza dane techniczne i pozwala Product Ownerowi łatwo zarządzać nowymi zgłoszeniami za pomocą flagi `is_read`.
    </matched_recommendations>

<prd_planning_summary>

### a. Główne wymagania funkcjonalne produktu

1.  **Onboarding Użytkownika:**
    - Zbieranie danych: płeć, wiek, waga, wzrost, poziom aktywności, cel (utrata/utrzymanie wagi).
    - Obliczenie zapotrzebowania kalorycznego na podstawie wzoru Mifflin-St Jeor i PAL.
    - Prezentacja i obowiązkowa akceptacja disclaimera dotyczącego braku obsługi alergii.

2.  **Generator Planu Diety:**
    - Automatyczne generowanie 7-dniowego planu posiłków na podstawie celu kalorycznego użytkownika.
    - Wykorzystanie algorytmu skalującego gramaturę składników skalowalnych w przepisach.
    - Zapewnienie różnorodności (brak powtórzeń dania w ciągu 7 dni).
    - Logika "kroczącego okna" - automatyczne generowanie nowych dni przy starcie aplikacji.

3.  **Widok Dnia (Ekran Główny):**
    - Wyświetlanie planu posiłków na bieżący dzień.
    - Cztery paski postępu (Kalorie, Białko, Węglowodany, Tłuszcze) wizualizujące realizację dziennego celu.
    - Możliwość oznaczenia posiłku jako "Zjedzony" (checkbox).
    - Możliwość modyfikacji gramatury poszczególnych składników w posiłku.
    - Możliwość wymiany całego posiłku na inny o zbliżonych parametrach.

4.  **Baza Przepisów:**
    - Szczegółowy widok przepisu: lista składników, instrukcje krok po kroku, czasy przygotowania/gotowania, zdjęcie główne (i opcjonalnie zdjęcia do kroków).
    - Baza danych składników z predefiniowanymi przelicznikami dla różnych jednostek (łyżka, szklanka -> gramy).

5.  **Lista Zakupów:**
    - Automatyczne generowanie listy zakupów na nadchodzące 6 dni.
    - Inteligentne grupowanie i sumowanie tych samych składników.
    - Interaktywność: możliwość odznaczania kupionych produktów (checkbox), co powoduje ich przekreślenie i przeniesienie na dół listy.

6.  **Ustawienia / Profil:**
    - Możliwość edycji danych profilowych (waga, aktywność) i przeliczenia planu.
    - Opcja "Zacznij od nowa" (reset planu i powrót do onboardingu).
    - Formularz do wysyłania opinii i zgłoszeń.
    - Dostęp do podstawowych funkcji uwierzytelniania (logowanie, odzyskiwanie hasła).

### b. Kluczowe historie użytkownika i ścieżki korzystania

1.  **Nowy Użytkownik:** Użytkownik pobiera aplikację, przechodzi przez onboarding, podając swoje dane i cel. Akceptuje regulamin i disclaimer. Aplikacja generuje dla niego pierwszy 7-dniowy plan i przenosi go do "Widoku Dnia" na dziś, gdzie może przeglądać posiłki, oznaczać je jako zjedzone i sprawdzać listę zakupów na kolejne dni.
2.  **Codzienne Użytkowanie:** Użytkownik otwiera aplikację, aby sprawdzić dzisiejsze menu. Oznacza posiłki jako zjedzone, obserwując postęp na paskach. Postanawia zmodyfikować obiad, zwiększając ilość kurczaka. Wieczorem decyduje się wymienić kolację na inną propozycję z listy.
3.  **Użytkownik na Zakupach:** Użytkownik w sklepie otwiera "Listę Zakupów". Odznacza kolejne produkty, które wkłada do koszyka. Odznaczone pozycje są przekreślane i przesuwane na dół, ułatwiając orientację.
4.  **Aktualizacja Celu:** Po kilku tygodniach użytkownik zauważa zmianę wagi. Wchodzi w ustawienia, aktualizuje swoją wagę i zleca przeliczenie planu. Aplikacja dostosowuje kaloryczność posiłków w planie od następnego dnia.

### c. Ważne kryteria sukcesu i sposoby ich mierzenia

1.  **Walidacja Koncepcji (Cel Główny):**
    - **Metryka:** Zebranie co najmniej 50 unikalnych, możliwych do wdrożenia zgłoszeń/opinii od użytkowników w ciągu pierwszego miesiąca od startu.
    - **Narzędzie:** Formularz opinii w aplikacji i analiza bazy danych zgłoszeń.

2.  **Stabilność Techniczna:**
    - **Metryka:** Wysoki wskaźnik pomyślnego generowania planów diety dla wszystkich nowych użytkowników. Monitorowanie logów serwera pod kątem błędów algorytmu.
    - **Narzędzie:** System logowania błędów na backendzie.

3.  **Podstawowe Zaangażowanie:**
    - **Metryka:** Wskaźnik retencji użytkowników po 7 dniach (D7 retention). Śledzenie, jaki procent użytkowników, którzy ukończyli onboarding, nadal korzysta z aplikacji po tygodniu.
    - **Narzędzie:** Podstawowe narzędzie analityczne (np. zintegrowane z Supabase).

### d. Wszelkie nierozwiązane kwestie lub obszary wymagające dalszego wyjaśnienia

Na podstawie przeprowadzonej serii pytań i odpowiedzi, wszystkie kluczowe kwestie dotyczące zakresu i funkcjonalności MVP zostały wyjaśnione i udokumentowane w powyższych decyzjach. Obecnie nie ma zidentyfikowanych nierozwiązanych problemów, które blokowałyby rozpoczęcie prac nad szczegółowym PRD.
</prd_planning_summary>

<unresolved_issues>
Brak zidentyfikowanych nierozwiązanych kwestii na tym etapie.
</unresolved_issues>
</conversation_summary>
