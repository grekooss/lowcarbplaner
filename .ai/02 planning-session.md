<pytania>
1.  **Pytanie:** Jak zdefiniujemy "wystarczającą ilość" opinii i kto będzie odpowiedzialny za ich analizę, aby uznać MVP za sukces i przejść do kolejnej fazy projektu?
    
    **Zalecenie:** Ustalmy konkretny, mierzalny cel, np. "zebranie co najmniej 50 unikalnych, możliwych do wdrożenia zgłoszeń w ciągu pierwszego miesiąca od startu", i wyznaczmy jedną osobę (np. Product Ownera) odpowiedzialną za kategoryzację i priorytetyzację tego feedbacku.

- wedlug rekomendacji

2.  **Pytanie:** Dlaczego w MVP przyjęto sztywny rozkład makroskładników (15/35/50) i nie pozwala się na jego modyfikację? Czy jest to ograniczenie techniczne algorytmu, czy świadoma decyzja produktowa?

    **Zalecenie:** Warto dodać w onboardingu krótką informację, wyjaśniającą, dlaczego ten konkretny rozkład został wybrany (np. jako optymalny dla adaptacji do diety niskowęglowodanowej). Pomoże to zarządzać oczekiwaniami użytkowników i zmniejszy liczbę pytań o personalizację.

- w celu przetestowania mozliwosci wykonania, na pozniejszym etapie bedzie mozliwosc zmiany (beda do wyboru inne opcje)

3.  **Pytanie:** Jak zamierzamy minimalizować ryzyko prawne i zdrowotne związane z brakiem obsługi alergii i nietolerancji pokarmowych w MVP?

    **Zalecenie:** Należy umieścić bardzo wyraźne i wymagające akceptacji ostrzeżenie (disclaimer) podczas onboardingu oraz stałą informację w widoku przepisów, że aplikacja nie uwzględnia indywidualnych alergii, a użytkownik korzysta z niej na własną odpowiedzialność.

- wedlug rekomendacji

4.  **Pytanie:** Jakie dokładnie kryteria definiują posiłek "o podobnych parametrach" przy jego wymianie? Czy chodzi tylko o kalorie, czy również o zbliżony rozkład makroskładników?

    **Zalecenie:** Zdefiniujmy w specyfikacji technicznej jasne reguły, np. "posiłek zastępczy musi mieścić się w tolerancji +/- 50 kcal i +/- 5g dla każdego makroskładnika w stosunku do oryginału". Zapewni to spójność diety i przewidywalność działania funkcji.

- o kalorie jak i zblizone makro - wymieniony posilek nie moze zaburzyc dziennego zapotrzebowania na kalorie i makro

5.  **Pytanie:** Co się stanie, gdy algorytm skalujący gramaturę nie będzie w stanie idealnie dopasować posiłku do celu kalorycznego użytkownika z powodu składników nieskalowalnych (np. jajka)?

    **Zalecenie:** Wprowadźmy dopuszczalny margines błędu dla całego dnia (np. +/- 5% dziennego zapotrzebowania kalorycznego). W interfejsie użytkownika komunikujmy to jako "Cel Osiągnięty", nawet jeśli suma nie wynosi dokładnie 100%, aby uprościć logikę i poprawić doświadczenie użytkownika.

- wedlug rekomendacji

6.  **Pytanie:** W jaki sposób aplikacja obsłuży użytkownika, którego celem jest przybranie na wadze (nadwyżka kaloryczna), skoro opcje w onboardingu koncentrują się na utracie lub utrzymaniu wagi?

    **Zalecenie:** Aby nie komplikować MVP, ograniczmy cel do "utraty" i "utrzymania" wagi, dodając w UI komunikat "Funkcja budowania masy będzie dostępna w przyszłych wersjach". Jeśli jednak zdecydujemy się to obsłużyć, należy dodać opcję celu "Budowa masy" i przetestować, jak algorytm skaluje posiłki w górę.

- wedlug rekomendacji

7.  **Pytanie:** Jak duża będzie początkowa baza dań w MVP i jak zapewnimy wystarczającą różnorodność, aby użytkownicy nie odczuwali monotonii już po pierwszym tygodniu?

    **Zalecenie:** Zdefiniujmy minimalną liczbę unikalnych dań na każdy typ posiłku (np. 15 śniadań, 20 obiadów, 20 kolacji) i wprowadźmy do algorytmu regułę, która uniemożliwi pojawienie się tego samego dania częściej niż raz na 7 dni w wygenerowanym planie.

- wedlug rekomendacji

8.  **Pytanie:** Na jakim wzorze (np. Mifflin-St Jeor, Harris-Benedict) opiera się kalkulator zapotrzebowania kalorycznego i czy został on zweryfikowany przez specjalistę ds. żywienia?

    **Zalecenie:** Wybierzmy jeden, powszechnie uznany w dietetyce wzór i wspomnijmy o tym w aplikacji (np. w sekcji "O nas" lub FAQ). Zapewni to transparentność i zwiększy wiarygodność obliczeń, nawet w wersji MVP.

- Wzór Mifflin-St Jeor
- Współczynniki Aktywności Fizycznej (PAL):
  1.2 - Brak aktywności lub minimalna: Praca siedząca, brak regularnych ćwiczeń.
  1.3 - 1.4 - Niska aktywność: Praca siedząca, lekkie ćwiczenia lub spacery 1-3 razy w tygodniu.
  1.5 - 1.6 - Umiarkowana aktywność: Dość aktywny tryb życia lub regularne ćwiczenia 3-5 razy w tygodniu.
  1.7 - 1.8 - Wysoka aktywność: Praca fizyczna lub intensywne ćwiczenia 6-7 razy w tygodniu.
  1.9 - 2.2 - Bardzo wysoka aktywność: Bardzo ciężka praca fizyczna, codzienne intensywne treningi, zawodowi sportowcy.

9.  **Pytanie:** Czy użytkownik zostanie jasno poinformowany, że jego ręczne zmiany gramatury w widoku dnia bieżącego nie mają wpływu na automatycznie generowaną listę zakupów na kolejne dni?

    **Zalecenie:** Dodajmy jednorazowy tooltip lub krótki tekst informacyjny na ekranie listy zakupów, wyjaśniający: "Lista jest tworzona na podstawie Twojego oryginalnego planu, aby ułatwić zakupy. Twoje codzienne modyfikacje nie są tu uwzględniane."

- wedlug rekomendacji

10. **Pytanie:** Jaki jest długoterminowy model biznesowy aplikacji po etapie MVP? Czy planujemy wprowadzenie subskrypcji, jednorazowych płatności czy reklam?
    **Zalecenie:** Nawet jeśli MVP jest darmowe, warto już teraz zaprojektować architekturę (np. model użytkownika w bazie danych) w taki sposób, aby w przyszłości łatwo można było dodać pole `is_premium` lub podobne. Ułatwi to wdrożenie monetyzacji bez kosztownych zmian w fundamencie aplikacji.

- wedlug rekomendacji
  </pytania>

<pytania>
1.  **Pytanie:** Co powinna zrobić aplikacja w sytuacji, gdy użytkownik chce wymienić posiłek (zgodnie z pkt. 4), ale w bazie nie ma żadnego innego dania, które idealnie spełniałoby kryteria kaloryczności i makroskładników bez zaburzania bilansu dziennego?
    
    **Zalecenie:** Zaimplementujmy prostą logikę "braku dopasowania". Zamiast blokować funkcję, aplikacja powinna wyświetlić komunikat, np. "Nie znaleziono idealnego zamiennika. Spróbuj wymienić inny posiłek", lub zaproponować 1-2 najlepsze dostępne opcje, nawet jeśli lekko odbiegają od ideału, z wyraźnym oznaczeniem różnicy (np. "+20 kcal").

- zaproponuj inne przepisy z wiekszym odbieganiem o oryginalu

2.  **Pytanie:** Kto będzie odpowiedzialny za tworzenie, weryfikację i wprowadzanie przepisów do bazy danych? Jakie minimalne informacje musi zawierać każdy przepis (np. czas przygotowania, poziom trudności, zdjęcie)?

    **Zalecenie:** Zdefiniujmy w PRD "szablon przepisu" zawierający obowiązkowe pola: Nazwa, Składniki (z podziałem na skalowalne/nieskalowalne), Instrukcje, Czas przygotowania, Kaloryczność bazowa i Makroskładniki na 100g. Na etapie MVP możemy zrezygnować ze zdjęć i poziomu trudności, aby przyspieszyć wdrożenie.

- dietetyk. "Szablon przepisu": Nazwa, składniki i ich jednostka (gramatura, ilosc), instrukcja przygotowania w kilku krokach (w kazdym kroku maja byc podawane skladniki, ktore maja byc uzyte), poziom trudnosci, czas przygotowania, czas gotowania, zdjecia (ogolne calej potrawy oraz zdjecia z przygotowania - polaczone z okreslonym krokiem), kalorycznosc calej potrawy i makro (z jakiego skladnika ile sie bierze danego makro)

3.  **Pytanie:** Jak dokładnie będzie wyglądał interfejs użytkownika (UI) dla funkcji modyfikacji gramatury składników w "Widoku Dnia"? Czy będzie to suwak, pole do wpisania liczby, czy przyciski +/-?

    **Zalecenie:** Dla uproszczenia MVP i zapewnienia dobrego doświadczenia na urządzeniach mobilnych, zastosujmy przyciski "+" i "-" ze zdefiniowanym krokiem (np. co 5g). Pozwoli to na szybką modyfikację bez konieczności otwierania klawiatury numerycznej.

- wedlug rekomendacji lecz nacisniecie danej cyfry pozwala ja zmienic za pomoca klawiatury

4.  **Pytanie:** Skoro planujemy w przyszłości funkcje premium, jakie funkcjonalności z obecnego MVP mogłyby stać się częścią płatnego planu w przyszłości, a jakie na zawsze pozostaną darmowe?

    **Zalecenie:** Załóżmy, że rdzeń (kalkulator, generowanie planu na 7 dni, lista zakupów) pozostanie darmowy. W przyszłości płatne mogą stać się: możliwość zmiany rozkładu makro, dostęp do większej bazy przepisów, wykluczenia żywieniowe czy analiza danych historycznych. Takie rozgraniczenie pomoże w projektowaniu architektury.

- wedlug rekomendacji

5.  **Pytanie:** Czy użytkownik w ramach MVP będzie miał możliwość zresetowania swoich danych i ponownego przejścia przez onboarding (np. w przypadku znacznej zmiany wagi)?

    **Zalecenie:** Dodajmy w ustawieniach prostą opcję "Zacznij od nowa" lub "Przelicz mój cel". Funkcja ta powinna wyświetlić ostrzeżenie o utracie bieżącego planu i po potwierdzeniu przenieść użytkownika na początek onboardingu. To kluczowe dla długoterminowej użyteczności.

- wedlug rekomendacji

6.  **Pytanie:** W jaki sposób lista zakupów będzie agregować składniki? Czy "1 jajko" ze śniadania i "2 jajka" z kolacji pojawią się na liście jako "3 jajka"? Czy "100g pomidorów" i "150g pomidorów" pojawi się jako "250g pomidorów"?

    **Zalecenie:** Zdefiniujmy w specyfikacji, że lista zakupów musi inteligentnie grupować identyczne produkty i sumować ich ilości (gramy, sztuki, mililitry). Należy również ujednolicić nazewnictwo składników w bazie, aby uniknąć sytuacji, w której "pomidor" i "pomidory" są traktowane jako dwa różne produkty.

- wedlug rekomendacji

7.  **Pytanie:** Jak dokładnie zostanie zaimplementowany i zaprezentowany użytkownikowi disclaimer dotyczący braku obsługi alergii (pkt. 3)? Czy będzie to jednorazowy ekran podczas onboardingu z checkboxem "Akceptuję"?

    **Zalecenie:** Zastosujmy dwuetapowe zabezpieczenie: 1) Dedykowany, niepomijalny ekran w onboardingu z obowiązkowym checkboxem. 2) Statyczny, ale widoczny komunikat (np. mała ikonka z literą "i" z tekstem po najechaniu) w widoku każdego przepisu, przypominający o korzystaniu z planu na własną odpowiedzialność.

- wedlug rekomendacji

8.  **Pytanie:** Co dokładnie dzieje się po zakończeniu onboardingu? Czy użytkownik jest od razu przenoszony do "Widoku Dnia" z wygenerowanym planem, czy widzi ekran ładowania z informacją "Generujemy Twój idealny plan…"?

    **Zalecenie:** Ponieważ generowanie planu może zająć kilka sekund, wyświetlmy ekran pośredni z komunikatem i animacją ładowania. Poprawi to doświadczenie użytkownika i da mu poczucie, że aplikacja wykonuje dla niego spersonalizowaną pracę w tle.

- wedlug rekomendacji

9.  **Pytanie:** Jak system obsłuży odznaczenie posiłku jako "Zjedzony"? Czy użytkownik będzie mógł cofnąć tę akcję, jeśli kliknie przycisk przez pomyłkę?

    **Zalecenie:** Przycisk "Zjedzono" po kliknięciu powinien zmienić się w przycisk "Cofnij" lub podobny, a posiłek powinien być wizualnie oznaczony (np. wyszarzony). Akcja powinna być odwracalna tylko w obrębie bieżącego dnia, aby nie komplikować logiki.

- bedzie checkbox z ptaszkiem, a karta zjedzonego posilku dostanie obramowke "zielona"

10. **Pytanie:** Jaki jest planowany przepływ pracy po otrzymaniu feedbacku od użytkownika przez formularz w aplikacji? Kto otrzymuje powiadomienie, jak jest ono kategoryzowane i jak informujemy użytkownika (jeśli w ogóle), że jego zgłoszenie zostało przyjęte?
    **Zalecenie:** Skonfigurujmy prosty system powiadomień (np. e-mail na dedykowaną skrzynkę lub wiadomość na kanale Slack) wysyłany do Product Ownera po każdym nowym zgłoszeniu. W aplikacji, po wysłaniu formularza, wyświetlmy użytkownikowi prosty komunikat: "Dziękujemy! Twoja opinia pomoże nam ulepszyć aplikację." Na etapie MVP nie musimy wdrażać systemu odpowiedzi.

- product owner bedzie mial wglad do bazy i tam przeczyta feedbacki
  </pytania>

<pytania>
1.  **Pytanie:** Biorąc pod uwagę, że celem MVP jest weryfikacja techniczna, czy tak szczegółowy szablon przepisu (ze zdjęciami do każdego kroku i makro per składnik) jest absolutnie niezbędny do startu? Taki zakres znacząco zwiększa czas i koszt tworzenia treści przez dietetyka.
    
    **Zalecenie:** Zalecam wdrożenie uproszczonego szablonu na etapie MVP (np. tylko jedno zdjęcie finalne, bez zdjęć do kroków i bez makro per składnik), a pełną wersję wprowadzić w kolejnych iteracjach. Pozwoli to szybciej uruchomić aplikację i zweryfikować jej kluczowy mechanizm, czyli algorytm skalowania.
- chce byc przygotowany na ewentualny rozwoj aplikacji a to sa kluczowe wlasciwosci zachecajace do uzywania - zdjecie glowne bedzie oboweiazkowe a krokow juz nie i wtedy caly czas bedzie wyswietlane zdjecie glowne
    
2.  **Pytanie:** W jaki sposób algorytm ma priorytetyzować i wyświetlać zamienniki posiłków, które nie są idealnym dopasowaniem? Według jakiej metryki mamy sortować "najlepsze dostępne" opcje, gdy użytkownik prosi o wymianę?
    
    **Zalecenie:** Zdefiniujmy w PRD prostą regułę sortowania, np. "posortuj według najmniejszej bezwzględnej różnicy w kaloriach". Użytkownikowi wyświetlmy maksymalnie 3 najlepsze propozycje wraz z wyraźną informacją o różnicy (np. "Kurczak z warzywami, +35 kcal").
- wedlug rekomendacji
    
3.  **Pytanie:** Jakie reguły walidacji powinniśmy zastosować, gdy użytkownik ręcznie wpisuje gramaturę z klawiatury? Co się stanie, jeśli wpisze "0", wartość ujemną lub nierealistycznie dużą (np. 10000g)?
    
    **Zalecenie:** Wprowadźmy proste ograniczenia w logice aplikacji: minimalna wartość to 1g, a maksymalna to np. 1000g. Pole nie powinno akceptować wartości nienumerycznych. Po wpisaniu wartości spoza zakresu, powinna ona automatycznie wracać do ostatniej poprawnej wartości lub wyświetlać krótki komunikat o błędzie.
- wedlug rekomendacji
    
4.  **Pytanie:** W jaki sposób Product Owner będzie odróżniał nowe, nieprzeczytane opinie od tych już przeanalizowanych, jeśli będzie przeglądał bezpośrednio bazę danych?
    
    **Zalecenie:** Dodajmy do tabeli z opiniami proste pole typu boolean o nazwie `is_read` (domyślnie ustawione na `false`). Product Owner mógłby ręcznie zmieniać jego status po przeczytaniu, co pozwoliłoby na łatwe filtrowanie nowych zgłoszeń bez budowania skomplikowanego interfejsu administracyjnego.
- wedlug rekomendacji
    
5.  **Pytanie:** Co się stanie, jeśli dane wprowadzone przez użytkownika w onboardingu (np. bardzo niska waga, bardzo wysoki cel utraty wagi) od razu wygenerują zapotrzebowanie poniżej bezpiecznego minimum (1400/1600 kcal), jeszcze przed wyborem tempa chudnięcia?
    
    **Zalecenie:** Aplikacja nie powinna tylko blokować wyboru tempa chudnięcia. W takim przypadku powinna wyświetlić jasny komunikat wyjaśniający, dlaczego cel nie może zostać ustawiony, np. "Twoje bazowe zapotrzebowanie jest bardzo niskie. Zalecamy utrzymanie wagi lub konsultację ze specjalistą przed rozpoczęciem diety."
- wedlug rekomendacji
    
6.  **Pytanie:** Kiedy dokładnie generowany jest nowy plan posiłków? Czy po upływie 7 dni użytkownik musi ręcznie wygenerować nowy, czy aplikacja robi to automatycznie w tle, np. każdego dnia dodając kolejny posiłek na koniec?
    
    **Zalecenie:** Zaimplementujmy logikę "kroczącego okna 7-dniowego". Każdego dnia o północy, miniony dzień jest archiwizowany (na razie bez widoku historii dla użytkownika), a na końcu planu generowany jest nowy, siódmy dzień. Zapewni to użytkownikowi ciągłość planu bez potrzeby interakcji.
- kroczacy plan jest w porzadku, w MVP nie archiwizujemy minionego dnia oraz nowy dzien nie musi byc generowany o polnocy jedynie jak uzytkownik wejdzie do aplikacji - dluzsza nieobecnosc wygeneruje np. 3 nowe dni
    
7.  **Pytanie:** Czy użytkownik będzie miał możliwość odznaczania produktów na liście zakupów, które już kupił? Czy ta lista ma być w pełni statyczna, czy interaktywna?
    
    **Zalecenie:** Dodajmy proste checkboxy przy każdej pozycji na liście zakupów. Pozwoli to użytkownikowi na bieżąco śledzić postępy w sklepie. Stan odznaczenia nie musi być zapisywany na serwerze – może być przechowywany lokalnie na urządzeniu na czas sesji przeglądania listy.
- wedlug rekomendacji - oprocz checkboxa produkt bedzie przekreslany
    
8.  **Pytanie:** Jak aplikacja ma zareagować, jeśli użytkownik w trakcie dnia tak zmodyfikuje gramaturę posiłków, że przekroczy swój dzienny cel kaloryczny o znaczną wartość (np. o 20%)?
    
    **Zalecenie:** Wprowadźmy wizualne ostrzeżenie. Gdy pasek postępu przekroczy 100% celu, powinien zmienić kolor z zielonego na pomarańczowy lub czerwony. Dodatkowo, można wyświetlić mały tekst informacyjny, np. "Przekroczono dzienny limit kalorii".
- wedlug rekomendacji
    
9.  **Pytanie:** Czy w MVP przewidujemy obsługę różnych jednostek miar (np. szklanki, łyżki) oprócz gramów i sztuk, czy na tym etapie wszystko sprowadzamy do gramatury?
    
    **Zalecenie:** Aby uprościć logikę algorytmu skalowania i listy zakupów, w MVP ustandaryzujmy wszystkie składniki do podstawowych jednostek: gramów (dla produktów sypkich, mięs, warzyw), mililitrów (dla płynów) i sztuk (dla produktów nieskalowalnych jak jajka). Unikniemy w ten sposób złożoności związanej z konwersją jednostek.
- wprowadzmy takze obluge roznych jednostek, dla agorytmu przeliczajmy wszystko na gramy (na 100g)
10. **Pytanie:** Jak aplikacja zachowa się w trybie offline? Czy użytkownik będzie mógł przeglądać swój aktualny plan na 7 dni bez dostępu do internetu?
    
    **Zalecenie:** Zdefiniujmy, że wygenerowany 7-dniowy plan powinien być zapisywany lokalnie na urządzeniu. Umożliwi to użytkownikowi dostęp do planu dnia, przepisów i listy zakupów w trybie offline. Synchronizacja (np. odznaczenie posiłku) i generowanie nowych dni będą wymagały połączenia z internetem.
- wedlug rekomendacji
</pytania>

<pytania>
1.  **Pytanie:** W jaki sposób system będzie zarządzał przeliczaniem "przyjaznych" jednostek (łyżka, szklanka) na gramy? Czy będziemy używać jednego, ogólnego przelicznika (np. 1 łyżka = 15g), czy system będzie wiedział, że "łyżka mąki" waży inaczej niż "łyżka cukru"?
    
    **Zalecenie:** Zbudujmy w bazie danych system, w którym każdy składnik ma zdefiniowane własne, specyficzne dla siebie przeliczniki (np. dla produktu "mąka pszenna": 1 szklanka = 120g, 1 łyżka = 10g). Jest to bardziej skomplikowane w przygotowaniu, ale kluczowe dla dokładności kalorycznej diety.
- wedlug rekomendacji
    
2.  **Pytanie:** Skoro generowanie nowych dni planu odbywa się przy wejściu do aplikacji, co powinno się stać, jeśli proces ten zostanie przerwany (np. przez zamknięcie aplikacji lub utratę połączenia z internetem)? Czy użytkownik zostanie z niekompletnym planem?
    
    **Zalecenie:** Proces generowania brakujących dni powinien być transakcyjny. Oznacza to, że nowy plan jest zapisywany w całości dopiero po pomyślnym wygenerowaniu wszystkich brakujących dni. W przypadku błędu, aplikacja powinna zachować stary, ostatni poprawny stan planu i spróbować ponowić generowanie przy następnym uruchomieniu.
- wedlug rekomendacji
    
3.  **Pytanie:** W jaki sposób dietetyk będzie wprowadzał te wszystkie szczegółowe dane do przepisów (składniki z przelicznikami, opcjonalne zdjęcia do kroków)? Czy planowane jest stworzenie dedykowanego panelu administracyjnego (CMS) w ramach MVP?
    
    **Zalecenie:** Na etapie MVP można zrezygnować z budowy pełnego, graficznego CMS. Zamiast tego, dietetyk może wprowadzać dane w ustrukturyzowany sposób, np. poprzez pliki JSON lub arkusze kalkulacyjne, które następnie będą importowane do bazy przez dewelopera. Pozwoli to skupić zasoby na aplikacji dla użytkownika.
- wedlug rekomendacji
    
4.  **Pytanie:** Jak wyświetlimy jednostki w przepisie i na liście zakupów? Czy użytkownik zobaczy "1 szklanka (200g) cukru", czy po prostu "1 szklanka cukru"?
    
    **Zalecenie:** Dla najlepszej użyteczności, w widoku przepisu wyświetlajmy obie wartości: "1 szklanka (120g) mąki". Natomiast na zagregowanej liście zakupów używajmy tylko podstawowej jednostki (gramów), aby ułatwić zakupy, np. "Mąka pszenna: 450g".
- wedlug rekomendacji
    
5.  **Pytanie:** Logika "kroczącego okna" i generowania na żądanie oznacza, że jeśli użytkownik nie otworzy aplikacji przez 8 dni, to po otwarciu cały jego stary plan zostanie zastąpiony nowym 7-dniowym planem. Czy to jest pożądane zachowanie?
    
    **Zalecenie:** Potwierdźmy tę logikę. W PRD należy jasno zapisać: "Po uruchomieniu aplikacja sprawdza, ile dni minęło od ostatniego dnia w zapisanym planie. Generuje nowe dni, aby uzupełnić plan do 7 dni w przyszłość, bezpowrotnie odrzucając minione dni". To upraszcza logikę i jest zgodne z założeniem braku archiwum w MVP.
- wedlug rekomendacji
    
6.  **Pytanie:** Jak lista zakupów, która obejmuje 6 dni w przód, ma się zachować w kontekście generowania "na żądanie"? Czy jeśli wygenerują się 3 nowe dni, to lista zakupów zostanie całkowicie przeliczona na nowo?
    
    **Zalecenie:** Tak, lista zakupów powinna być dynamiczna i zawsze odzwierciedlać stan nadchodzących 6 dni z planu. Po każdym pomyślnym wygenerowaniu nowych dni, lista zakupów powinna być automatycznie przeliczana w tle. Należy też odświeżyć jej widok, jeśli użytkownik miał go otwartego podczas generacji.
- wedlug rekomendacji
    
7.  **Pytanie:** Czy w MVP przewidujemy możliwość dodawania synonimów dla składników, aby "pomidorki koktajlowe" i "pomidor koktajlowy" były poprawnie sumowane na liście zakupów?
    
    **Zalecenie:** Zamiast budować system synonimów, wprowadźmy w procesie dodawania przepisów zasadę "jednej, spójnej nazwy" dla każdego składnika. Dietetyk powinien korzystać z predefiniowanej listy składników, co zapewni spójność danych bez dodatkowej logiki w aplikacji.
- wedlug rekomendacji
    
8.  **Pytanie:** Jakie dokładnie informacje będzie pokazywał pasek postępu na ekranie głównym? Czy będzie to jeden ogólny pasek dla kalorii, czy osobne paski dla kalorii, białka, węglowodanów i tłuszczów?
    
    **Zalecenie:** Zastosujmy jeden, główny pasek postępu dla kalorii, który jest najważniejszym wskaźnikiem dla użytkownika. Poniżej niego umieśćmy mniejsze, tekstowe wskaźniki dla makroskładników w formacie "Białko: 80/150g", aby nie przeładować interfejsu, ale dostarczyć kluczowe informacje.
- wszystki 4 paski maja byc osobno, z czego kalorycznosc ma byc najwieksza
    
9.  **Pytanie:** Skoro zdjęcie główne jest obowiązkowe, a zdjęcia do kroków opcjonalne, to jak interfejs przepisu ma się zachować, gdy tych drugich brakuje? Czy sekcja "Instrukcje" będzie po prostu listą tekstową?
    
    **Zalecenie:** Zdefiniujmy w PRD, że jeśli dla danego kroku nie ma przypisanego zdjęcia, interfejs powinien w tym miejscu wyświetlić domyślne, główne zdjęcie potrawy. Zapewni to spójny i estetyczny wygląd każdego przepisu, niezależnie od kompletności materiałów graficznych.

- wedlug rekomendacji

10. **Pytanie:** Czy po naciśnięciu przycisku "Zmień danie" i wybraniu zamiennika, stary posiłek jest trwale usuwany z planu na dany dzień, czy użytkownik może cofnąć tę zmianę?
    **Zalecenie:** Dla uproszczenia MVP, potraktujmy wymianę jako akcję ostateczną i nieodwracalną na dany dzień. Po wybraniu zamiennika, aplikacja powinna po prostu zaktualizować plan. Unikniemy w ten sposób potrzeby budowania dodatkowej logiki do zarządzania stanem "przed zmianą".

- wedlug rekomendacji
  </pytania>

<pytania>
1.  **Pytanie:** Jak wizualnie i funkcjonalnie mają działać cztery osobne paski postępu? Czy każdy z nich zmienia kolor niezależnie, gdy cel dla danego makroskładnika zostanie osiągnięty?
    
    **Zalecenie:** Zdefiniujmy spójny system wizualny. Każdy z czterech pasków (Kalorie, Białko, Węglowodany, Tłuszcze) powinien działać niezależnie. Użyjmy trzech stanów kolorystycznych dla każdego paska: niebieski (w trakcie realizacji), zielony (cel osiągnięty w widełkach, np. 90-110%) i czerwony (cel znacznie przekroczony, >110%). Daje to użytkownikowi natychmiastową, granularną informację zwrotną.
- wedlug rekomendacji
    
2.  **Pytanie:** Jaki jest dokładny proces, gdy dietetyk potrzebuje dodać do bazy nowy składnik, który nie ma jeszcze zdefiniowanych przeliczników jednostek?
    
    **Zalecenie:** Ustalmy prosty, pozasystemowy proces na etapie MVP. Dietetyk prowadzi zewnętrzny dokument (np. współdzielony arkusz kalkulacyjny) o nazwie "Nowe Składniki". Deweloper w regularnych odstępach czasu (np. raz w tygodniu) ręcznie dodaje te pozycje i ich przeliczniki do bazy danych aplikacji.
- wedlug rekomendacji
    
3.  **Pytanie:** W jaki sposób dietetyk, tworząc przepis w pliku JSON/arkuszu, ma oznaczyć, które składniki są "skalowalne" przez algorytm, a które nie (np. jajko)?
    
    **Zalecenie:** W szablonie przepisu, przy każdym składniku, dodajmy proste pole logiczne (boolean), np. `"is_scalable": true` lub `"is_scalable": false`. Algorytm będzie używał tej flagi do podejmowania decyzji, które gramatury może modyfikować.
- wedlug rekomendacji
    
4.  **Pytanie:** Jak dokładnie opiszemy użytkownikowi poziomy aktywności fizycznej w onboardingu, aby jego wybór był jak najbardziej trafny?
    
    **Zalecenie:** Zamiast używać samych etykiet, dodajmy do każdego poziomu aktywności krótki, relatywny opis, np.: "Niska aktywność: Praca siedząca, lekkie ćwiczenia lub spacery 1-3 razy w tygodniu." lub "Umiarkowana aktywność: Regularne ćwiczenia o średniej intensywności 3-5 razy w tygodniu.".
- Współczynniki Aktywności Fizycznej (PAL):
  1.2 - Brak aktywności lub minimalna: Praca siedząca, brak regularnych ćwiczeń.
  1.3 - 1.4 - Niska aktywność: Praca siedząca, lekkie ćwiczenia lub spacery 1-3 razy w tygodniu.
  1.5 - 1.6 - Umiarkowana aktywność: Dość aktywny tryb życia lub regularne ćwiczenia 3-5 razy w tygodniu.
  1.7 - 1.8 - Wysoka aktywność: Praca fizyczna lub intensywne ćwiczenia 6-7 razy w tygodniu.
  1.9 - 2.2 - Bardzo wysoka aktywność: Bardzo ciężka praca fizyczna, codzienne intensywne treningi, zawodowi sportowcy.
    
5.  **Pytanie:** Czy użytkownik może edytować swoje dane (np. wagę) po zakończeniu onboardingu bez konieczności całkowitego resetowania planu?
    
    **Zalecenie:** Dodajmy w ustawieniach sekcję "Edytuj mój profil". Po zmianie kluczowego parametru (waga, poziom aktywności), aplikacja powinna wyświetlić okno dialogowe z pytaniem: "Twoje dane zostały zaktualizowane. Czy chcesz teraz przeliczyć swój plan diety, aby pasował do nowych celów?".
- wedlug rekomendacji
    
6.  **Pytanie:** Co powinna zobaczyć aplikacja w sytuacji awaryjnej, gdy algorytm z jakiegoś powodu nie jest w stanie wygenerować planu posiłków (np. błąd serwera, brak pasujących dań)?
    
    **Zalecenie:** Aplikacja nie powinna się zawiesić. Należy zaimplementować obsługę błędów i wyświetlić użytkownikowi przyjazny komunikat, np. "Przepraszamy, wystąpił problem z wygenerowaniem Twojego planu. Spróbuj ponownie za chwilę lub zgłoś problem, korzystając z formularza opinii."
- wedlug rekomendacji
    
7.  **Pytanie:** Czy formularz opinii, oprócz tekstu od użytkownika, powinien automatycznie zbierać jakieś dodatkowe, techniczne informacje w tle?
    
    **Zalecenie:** Tak, aby ułatwić diagnozowanie problemów. Do każdego zgłoszenia dołączajmy automatycznie metadane: identyfikator użytkownika, wersję aplikacji, typ systemu operacyjnego (iOS/Android) i jego wersję. Te informacje będą bezcenne przy analizie feedbacku.
- wedlug rekomendacji

9.  **Pytanie:** Jaki jest planowany "pierwszy widok" aplikacji tuż po pomyślnym zakończeniu onboardingu i wygenerowaniu planu?

    **Zalecenie:** Użytkownik powinien zostać przekierowany bezpośrednio na ekran "Widok Dnia" na dzień dzisiejszy. Wszystkie paski postępu powinny wskazywać 0, a wszystkie posiłki powinny być w stanie domyślnym (niezjedzone). Można dodać jednorazowy, zamykany dymek (tooltip) wskazujący na przycisk "Zjedzono" z tekstem "Kliknij tutaj, gdy zjesz posiłek!".

- wedlug rekomendacji

10. **Pytanie:** Czy planujemy jakąkolwiek formę komunikacji z użytkownikiem poza aplikacją w ramach MVP (np. e-mail powitalny po rejestracji)?
    **Zalecenie:** W ramach MVP zrezygnujmy z komunikacji e-mailowej, aby zminimalizować zakres prac (nie trzeba konfigurować serwera pocztowego, szablonów itp.). Cała interakcja z użytkownikiem powinna odbywać się wewnątrz aplikacji.

- wedlug rekomendacji
  </pytania>

<pytania>
1.  **Pytanie:** W jaki sposób aplikacja ma wybrać konkretną wartość mnożnika PAL z podanych przez Ciebie zakresów (np. 1.3 - 1.4 dla niskiej aktywności)?
    
    **Zalecenie:** Dla uproszczenia i zapewnienia spójności obliczeń, algorytm powinien używać średniej wartości z podanego zakresu (np. 1.35 dla zakresu 1.3-1.4). Należy to jasno zdefiniować w specyfikacji technicznej kalkulatora.
- wedlug rekomendacji
    
2.  **Pytanie:** Jaka jest dokładna logika algorytmu skalującego składniki? Gdy trzeba dopasować posiłek do celu, który składnik skalowalny ma priorytet?
    
    **Zalecenie:** Zdefiniujmy w szablonie przepisu "priorytet skalowania" dla składników. Na przykład, algorytm najpierw skaluje główne źródło białka (np. mięso), aby zbliżyć się do celu białkowego, następnie główne źródło tłuszczu (np. awokado, oliwa), a na końcu używa składnika "wypełniacza" (np. warzywa), aby precyzyjnie dostroić kaloryczność.
- wedlug rekomendacji
    
3.  **Pytanie:** Co dokładnie stanie się z planem na bieżący dzień, jeśli użytkownik w południe zaktualizuje swoją wagę i zdecyduje się przeliczyć plan?
    
    **Zalecenie:** Aby uniknąć konfuzji, przeliczenie powinno dotyczyć tylko posiłków, które nie zostały jeszcze oznaczone jako "Zjedzone". Aplikacja powinna dostosować kaloryczność obiadu i kolacji (jeśli śniadanie zostało już zjedzone) tak, aby suma za cały dzień zgadzała się z nowym, zaktualizowanym celem.
- zrobmy, zeby uproscic - biezacy dzien nie bedzie zmieniamy, tylko nastepne 6 dni
    
4.  **Pytanie:** Jak użytkownik będzie nawigował pomiędzy głównymi ekranami aplikacji, takimi jak "Widok Dnia", "Lista Zakupów" i "Ustawienia"?
    
    **Zalecenie:** Zaimplementujmy standardową dolną belkę nawigacyjną (tab bar) z trzema ikonami: "Dzisiaj" (prowadzi do Widoku Dnia), "Zakupy" (prowadzi do Listy Zakupów) oraz "Profil" lub "Ustawienia" (prowadzi do ekranu z opcjami edycji danych, resetu planu i formularza opinii).
- bedzie menu po lewej stronie ekranu desktop
    
5.  **Pytanie:** Chciałbym potwierdzić decyzję dotyczącą logowania: czy w MVP logowanie przez e-mail/hasło i przez Google tworzy dwa osobne konta, nawet jeśli używają tego samego adresu e-mail?
    
    **Zalecenie:** Potwierdźmy to jako najprostsze rozwiązanie dla MVP. W PRD zapiszemy, że system nie łączy kont. Warto dodać małą notkę na ekranie logowania, aby poinformować o tym użytkowników i uniknąć nieporozumień.
- SUPABASE Auth polaczy te konta - bedzie jedno konto
    
6.  **Pytanie:** Jak dokładnie ma wyglądać interakcja z odznaczaniem produktów na liście zakupów?
    
    **Zalecenie:** Po zaznaczeniu checkboxa, produkt powinien zostać przekreślony i automatycznie przeniesiony na dół listy, do zwijanej sekcji o nazwie "W koszyku" lub "Kupione". Daje to użytkownikowi poczucie porządku i pozwala skupić się na produktach, których jeszcze nie znalazł.
- wedlug rekomendacji
    
7.  **Pytanie:** Jak aplikacja powinna zarządzać zmianą daty i stref czasowych?
    
    **Zalecenie:** W PRD zdefiniujmy, że aplikacja zawsze opiera się na lokalnym czasie i dacie ustawionych w urządzeniu użytkownika. Zmiana dnia następuje o północy czasu lokalnego. Takie podejście jest najprostsze do wdrożenia i najbardziej intuicyjne dla użytkownika.
- wedlug rekomendacji
    
8.  **Pytanie:** Nie mamy zdefiniowanego procesu odzyskiwania hasła. Co się stanie, jeśli użytkownik zarejestrowany przez e-mail zapomni swojego hasła?
    
    **Zalecenie:** Jest to kluczowa funkcja. Należy dodać na ekranie logowania link "Nie pamiętam hasła". Po jego kliknięciu i podaniu adresu e-mail, system powinien wysłać na ten adres unikalny link pozwalający na ustawienie nowego hasła. To standardowy i oczekiwany element procesu logowania.
- wedlug rekomendacji
    
9.  **Pytanie:** Jakie jest pożądane zachowanie aplikacji, gdy użytkownik wraca do niej po dłuższej przerwie (np. po tygodniu)?
    
    **Zalecenie:** Po otwarciu aplikacji powinien pojawić się krótki ekran ładowania z informacją "Aktualizujemy Twój plan...". W tle aplikacja wygeneruje 7 nowych dni, a następnie przekieruje użytkownika do "Widoku Dnia" na bieżący dzień. Proces ten powinien być w pełni automatyczny i płynny.
- wedlug rekomendacji
  
</pytania>
