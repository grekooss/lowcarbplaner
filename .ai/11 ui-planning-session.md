<pytania>
1.  Jaka powinna być główna struktura nawigacyjna aplikacji? Czy główne widoki ("Widok Dnia", "Lista Zakupów", "Profil") powinny być dostępne z poziomu stałego paska nawigacyjnego (np. na dole ekranu)?

    Rekomendacja: Zastosować dolny pasek zakładek (Tab Bar) z trzema głównymi ikonami: "Dzisiaj" (domyślny widok dnia), "Lista Zakupów" oraz "Profil", co zapewni szybki dostęp do kluczowych funkcji.

- proponuje zastosowanie stałego, pionowego paska nawigacyjnego po lewej stronie (na desktopie) lub ukrytego menu (hamburger menu na mobile). Główne linki to: "Panel Dzienny" (Widok Dnia), "Lista Zakupów", "Profil" oraz "wszystkie przepisy". Link "Zgłoś problem" powinien być umieszczony w menu użytkownika (np. pod avatarem) lub w stopce, aby nie konkurował z kluczowymi funkcjami.

2.  W jaki sposób zarządzany będzie stan formularza wieloetapowego onboardingu przed wysłaniem ostatecznego żądania `POST /profile`?

    Rekomendacja: Wykorzystać minimalistyczną bibliotekę do zarządzania stanem po stronie klienta, taką jak Zustand, do przechowywania danych z kolejnych kroków onboardingu. Całość danych zostanie wysłana w jednym żądaniu API po przejściu ostatniego kroku.

- wedlug rekomendacji

3.  W jaki sposób użytkownik będzie nawigował pomiędzy dniami w ramach 7-dniowego planu w "Widoku Dnia"?

    Rekomendacja: Wprowadzić na górze "Widoku Dnia" komponent selektora daty (np. pozioma lista dni "Pon", "Wt", "Śr" lub strzałki "Poprzedni"/"Następny"), który pozwoli na przełączanie się między dniami objętymi wygenerowanym planem.

- w Widoku Dnia nad wszsytkim bedzie przewijany kalendarz z dniem wczorajszym "wyszarzonym" dniem dzisiejszym i szescioma nastepnymi + jeszcze jednym wyszarzonym - aktualny dzien bedzie wiekszy i innego koloru
  Zrobmy tez dodakowy widok Widok tygodnia (tabelka) z wszystkimi posilkami

4.  Jaka będzie strategia unieważniania danych (cache invalidation) i ponownego ich pobierania przy użyciu TanStack Query po wykonaniu kluczowych mutacji, takich jak aktualizacja profilu (`PATCH /profile/me`), wymiana posiłku (`PATCH /planned-meals/{id}`) czy reset planu?

    Rekomendacja: Po każdej udanej mutacji (np. za pomocą `onSuccess` w `useMutation`), należy programowo unieważnić odpowiednie zapytania (np. `queryClient.invalidateQueries(['planned-meals'])` oraz `queryClient.invalidateQueries(['profile', 'me'])`), aby zapewnić automatyczne odświeżenie interfejsu i spójność danych.

- wedlug rekomendacji

5.  Jakie konkretne stany ładowania (loading states) i szkielety interfejsu (skeleton UI) zostaną zaimplementowane dla kluczowych widoków, takich jak "Widok Dnia", "Widok Przepisu" i "Lista Zakupów", podczas oczekiwania na odpowiedź z API?

    Rekomendacja: Zaimplementować komponenty szkieletowe (skeleton loaders) dla kart posiłków w "Widoku Dnia" oraz dla listy składników na liście zakupów. Przyciski inicjujące akcje (np. "Zmień danie", "Zapisz profil") powinny pokazywać wskaźnik ładowania (spinner) i być w stanie nieaktywnym na czas operacji.

- wedlug rekomendacji

6.  W jaki sposób interfejs użytkownika będzie obsługiwał i tłumaczył na zrozumiałe dla użytkownika komunikaty różne kody błędów zwracane przez API (np. `400 Bad Request` przy walidacji, `409 Conflict` przy próbie generowania istniejącego planu, `500 Internal Server Error`)?

    Rekomendacja: Stworzyć globalny system obsługi błędów, który będzie przechwytywał błędy z zapytań API i wyświetlał użytkownikowi generyczne, ale pomocne komunikaty (np. za pomocą komponentu "Toast" z biblioteki shadcn/ui). Należy unikać pokazywania technicznych szczegółów błędu. Dla błędu 409 komunikat mógłby brzmieć: "Twój plan posiłków jest już w pełni wygenerowany i aktualny".

- wedlug rekomendacji

7.  Czy proces wymiany posiłku (`US-014`), który wymaga pobrania listy zamienników (`GET /planned-meals/{id}/replacements`) i następnie wysłania aktualizacji (`PATCH /planned-meals/{id}`), powinien odbywać się w oknie modalnym czy na osobnym ekranie?

    Rekomendacja: Wykorzystać okno modalne (`Dialog` z shadcn/ui) do wyświetlenia listy dań zastępczych. Pozwoli to utrzymać użytkownika w kontekście "Widoku Dnia" i zapewni płynniejsze doświadczenie.

- wedlug rekomendacji

8.  Jaka jest preferowana strategia techniczna wdrożenia dostępu offline (`US-021`)? Czy aplikacja ma być Progressive Web App (PWA) z wykorzystaniem Service Workera do buforowania odpowiedzi API (`GET /planned-meals`, `GET /recipes/{id}`, `GET /shopping-list`)?

    Rekomendacja: Zaimplementować podstawowego Service Workera, który będzie stosował strategię "cache-first" dla już pobranych planów posiłków i przepisów. Pozwoli to na odczyt danych w trybie offline, spełniając wymagania MVP. Bardziej zaawansowane zarządzanie stanem offline można odłożyć na kolejne iteracje.

- w MVP nie bedziemy robic aplikacji PWA

9.  Plan API nie zawiera dedykowanego punktu końcowego do resetowania planu użytkownika (`US-019`). Czy należy stworzyć nowy endpoint (np. `POST /profile/me/reset`), który po stronie serwera usunie powiązane dane, czy też operacja ta ma być inaczej zrealizowana?

    Rekomendacja: Stworzyć dedykowaną funkcję po stronie serwera (np. Supabase Edge Function) wywoływaną przez nowy, bezpieczny endpoint `POST /profile/me/reset`. Funkcja ta powinna usunąć wszystkie wpisy z `planned_meals` dla danego użytkownika i zresetować jego profil, co zapewni spójność danych. Po pomyślnej operacji, klient powinien zostać przekierowany do pierwszego kroku onboardingu.

- wedlug rekomendacji

10. Czy stan zaznaczenia produktów na liście zakupów (`US-017`) powinien być trwale zapisywany (np. w `localStorage`), czy też ma być to stan efemeryczny, resetowany po odświeżeniu strony?

        Rekomendacja: Dla MVP, stan zaznaczenia produktów na liście zakupów powinien być zarządzany wyłącznie po stronie klienta (np. `useState` lub `Zustand`) i resetować się po przeładowaniu strony. Jest to najprostsze rozwiązanie, które spełnia podstawowe wymagania historyjki użytkownika, a ewentualną persystencję można dodać w przyszłości.

- wedlug rekomendacji

</pytania>

<pytania>
11. Biorąc pod uwagę rezygnację z podejścia PWA/Service Worker dla MVP, w jaki sposób technicznie zrealizować wymaganie `US-021` dotyczące przechowywania 7-dniowego planu lokalnie w celu zapewnienia dostępu offline?

    Rekomendacja: Wykorzystać `localStorage` przeglądarki do zapisania pobranego planu posiłków w formacie JSON. Przy starcie aplikacji w trybie offline, aplikacja powinna najpierw próbować odczytać dane z `localStorage`. Należy jednak pamiętać, że jest to mniej niezawodne rozwiązanie niż Service Worker i nie buforuje zasobów (np. obrazków).

- wedlug rekomendacji

12. W jaki sposób użytkownik będzie przełączał się między "Widokiem Dnia" a nowo wprowadzonym "Widokiem Tygodnia"? Jakie interakcje (np. wymiana posiłku, przejście do przepisu) powinny być dostępne bezpośrednio z tabelarycznego "Widoku Tygodnia"?

    Rekomendacja: Nad kalendarzem w "Panelu Dziennym" umieścić przełącznik (np. przyciski typu "Dzień" / "Tydzień") do zmiany trybu widoku. W "Widoku Tygodnia", każda komórka tabeli z posiłkiem powinna być klikalna, prowadząc do szczegółów przepisu, oraz zawierać małą ikonę "wymień", która uruchamia ten sam modal co w "Widoku Dnia".

- zrobmy osobna karte widoku - główne linki to: "Panel Dzienny" (Widok Dnia), "Lista Zakupów", "Profil" oraz "wszystkie przepisy", "Widok Tygodnia"

13. Jakie funkcjonalności filtrowania i wyszukiwania powinien zawierać widok "Wszystkie przepisy", biorąc pod uwagę, że API (`GET /recipes`) obsługuje paginację oraz filtrowanie po tagach i typach posiłków?

    Rekomendacja: W widoku "Wszystkie przepisy" zaimplementować pole wyszukiwania po nazwie dania oraz filtry (np. checkboxy lub dropdown) dla typów posiłków (śniadanie, obiad, kolacja). W celu obsługi paginacji, zastosować przycisk "Załaduj więcej" na dole listy zamiast tradycyjnej numeracji stron, co jest bardziej przyjazne dla urządzeń mobilnych.

- wedlug rekomendacji

14. Gdzie dokładnie w interfejsie ma znajdować się menu użytkownika (z linkiem "Zgłoś problem") i jakie inne opcje (np. "Wyloguj") powinno zawierać?

    Rekomendacja: W lewym, pionowym pasku nawigacyjnym (na desktopie) lub w menu hamburgerowym (na mobile) umieścić na dole sekcję z avatarem/inicjałami użytkownika. Kliknięcie w nią powinno rozwijać małe menu kontekstowe z linkami do "Profilu", opcją "Zgłoś problem" oraz przyciskiem "Wyloguj".

- wedlug rekomendacji

15. Jak interfejs powinien obsłużyć sytuację, gdy generowanie pierwszego planu (`US-009`) lub aktualizacja planu po zmianie profilu (`US-018`) potrwa dłużej niż kilka sekund?

    Rekomendacja: Po zatwierdzeniu onboardingu lub zmian w profilu, wyświetlić widok pełnoekranowy (lub modal) z animacją ładowania i komunikatem, np. "Przygotowujemy Twój spersonalizowany plan... To może potrwać chwilę". Zablokuje to interakcję z resztą aplikacji na czas trwania operacji w tle, zapobiegając przypadkowym akcjom użytkownika.

- uzytkownik moze chodzic po aplikacji, jedynie ten komunikat z rekomendacji ma sie pojawiac na Widoku dnia i Liscie zakupow

<pytania>
16. Jaka powinna być docelowa kolejność pięciu głównych linków w nawigacji: "Panel Dzienny", "Widok Tygodnia", "Lista Zakupów", "Wszystkie przepisy", "Profil"?

    Rekomendacja: Proponowana kolejność, odzwierciedlająca częstotliwość użycia: 1. Panel Dzienny, 2. Widok Tygodnia, 3. Lista Zakupów, 4. Wszystkie przepisy, 5. Profil.

- wedlug rekomendacji

17. W jaki sposób aplikacja poinformuje użytkownika o zakończeniu nieblokującego procesu generowania planu, jeśli w tym czasie będzie on przeglądał inny widok (np. "Wszystkie przepisy")? Czy "Widok Tygodnia" również powinien wyświetlać stan ładowania?

    Rekomendacja: Zastosować globalny, nieinwazyjny komponent powiadomienia (Toast), który pojawi się na ekranie z komunikatem "Twój nowy plan jest gotowy" po zakończeniu generowania. Tak, "Widok Tygodnia", podobnie jak "Panel Dzienny" i "Lista Zakupów", powinien wyświetlać szkielet interfejsu (skeleton UI) w miejscach, gdzie dane są wciąż generowane.

- wedlug rekomendacji

18. Jakie konkretnie informacje powinny być widoczne dla każdego posiłku w tabelarycznym "Widoku Tygodnia"? Co powinno się wyświetlać w komórkach dla dni, dla których plan nie został jeszcze wygenerowany?

    Rekomendacja: Każda komórka z posiłkiem w "Widoku Tygodnia" powinna zawierać małą miniaturkę zdjęcia, nazwę dania oraz jego kaloryczność. Komórki dla dni, które dopiero zostaną wygenerowane, powinny być puste lub zawierać placeholder z tekstem "Brak planu".

- wedlug rekomendacji - komorki puste

19. Jak interfejs powinien komunikować użytkownikowi, że przegląda dane w trybie offline (z `localStorage`) i mogą być one nieaktualne? Jaka akcja powinna nastąpić, gdy użytkownik spróbuje wykonać operację wymagającą połączenia z internetem (np. wymiana posiłku) będąc offline?

    Rekomendacja: W trybie offline na górze ekranu powinien być widoczny stały, ale dyskretny pasek (banner) z komunikatem "Brak połączenia. Wyświetlane dane mogą być nieaktualne." Przy próbie wykonania akcji online (np. kliknięcie przycisku "Zmień danie"), przycisk powinien być nieaktywny (disabled) lub po kliknięciu powinien pojawić się komunikat "Ta funkcja wymaga połączenia z internetem."

- wedlug rekomendacji

20. Jaki powinien być interfejs użytkownika do modyfikacji gramatury składników skalowalnych w widoku przepisu (`US-015`), aby był on intuicyjny i efektywny?

    Rekomendacja: Dla każdego skalowalnego składnika zastosować pole numeryczne z przyciskami `+` i `-` po bokach, które pozwolą na szybkie, drobne korekty (np. o 10g). Pole powinno również pozwalać na bezpośrednie wpisanie wartości z klawiatury, z walidacją w czasie rzeczywistym.

- wedlug rekomendacji - mozna zmieniac tylko w Widoku dnia jak pojawi sie modal z przepisem do wykonania

<pytania>
21. W jaki sposób zrealizowany zostanie interfejs do wprowadzania danych w wieloetapowym onboardingu (`US-005`), aby był jak najbardziej przyjazny dla użytkownika?

    Rekomendacja: Zastosować dedykowane komponenty z biblioteki shadcn/ui: `RadioGroup` do wyboru płci i celu, `Select` do wyboru poziomu aktywności i tempa chudnięcia. Dla danych numerycznych (wiek, waga, wzrost) użyć pól `Input` z typem `number` i odpowiednią walidacją. Każdy krok powinien być prezentowany na osobnym, przejrzystym ekranie.

- beda to "buttony" do wyboru + paski przewijane - waga wzrost

22. Jak wizualnie zaprezentować stan, w którym użytkownik przekroczył dzienny cel dla kalorii lub makroskładników na paskach postępu (`US-012`)?

    Rekomendacja: Gdy wartość spożyta przekroczy 100% celu, pasek postępu powinien zmienić kolor na ostrzegawczy (np. pomarańczowy lub czerwony). Obok paska warto wyświetlać wartość liczbową (np. "1950 / 1800 kcal"), aby użytkownik miał pełną informację o skali przekroczenia.

- wedlug rekomendacji

23. W jaki sposób w interfejsie widoku "Lista Zakupów" należy zakomunikować użytkownikowi kluczowe ograniczenie, że lista bazuje na oryginalnym planie i nie uwzględnia modyfikacji (`US-016`)?

    Rekomendacja: Umieścić na stałe na górze widoku "Lista Zakupów" komponent informacyjny (np. `Alert` z shadcn/ui) z ikoną i jasnym komunikatem, np.: "Uwaga: Ta lista bazuje na oryginalnie wygenerowanym planie i nie uwzględnia dokonanych przez Ciebie zmian w posiłkach."

- lista bedzie zawierac produkty z 6 dni (oprocz biezacego dnia) i bedzie sie zawsze aktualizowac po kazdej zmianie w planie wiec nie potrzeba takiego komunikatu

24. Jak w widoku przepisu (`US-013`) przedstawić szczegółowe makro dla każdego składnika, aby nie przytłoczyć użytkownika nadmiarem informacji?

    Rekomendacja: Domyślnie wyświetlać tylko nazwę składnika i jego ilość. Szczegółowy rozkład makro dla danego składnika powinien być dostępny po kliknięciu w niego i rozwinięciu (np. za pomocą komponentu `Accordion` lub `Collapsible`), co pozwoli zachować czytelność przepisu.

- wedlug rekomendacji

25. W jakiej formie i w którym momencie przepływu użytkownika powinien zostać wyświetlony obowiązkowy disclaimer (`US-008`)?

    Rekomendacja: Po tym, jak użytkownik zatwierdzi swoje cele na ostatnim ekranie onboardingu, a przed rozpoczęciem generowania planu, należy wyświetlić modalne okno dialogowe (`Dialog` z shadcn/ui), którego nie można zamknąć. Przycisk "Rozpocznij dietę" w modalu powinien być nieaktywny, dopóki użytkownik nie zaznaczy checkboxa "Rozumiem i akceptuję".

- wedlug rekomendacji

<pytania>
26. W jaki sposób powinny być skonfigurowane komponenty "pasków przewijanych" (suwaków) do wprowadzania wagi i wzrostu w procesie onboardingu? Jakie powinny być ich minimalne/maksymalne wartości oraz krok (precyzja) zmiany?

    Rekomendacja: Zastosować komponent `Slider` z shadcn/ui. Proponowana konfiguracja: dla wagi zakres 40-200kg z krokiem 0.5kg; dla wzrostu zakres 140-220cm z krokiem 1cm. Wartość wybrana na suwaku powinna być zawsze widoczna w polu numerycznym obok niego.

- wedlug rekomendacji lecz 40-150kg z krokiem 0.1kg

27. Skoro "Lista Zakupów" będzie dynamicznie aktualizowana po każdej zmianie w planie, w jaki sposób UI powinno zakomunikować użytkownikowi, że ta lista jest przeliczana w tle po wymianie posiłku?

    Rekomendacja: Po dokonaniu zmiany w planie, na ikonie linku "Lista Zakupów" w menu nawigacyjnym można wyświetlić subtelny wskaźnik ładowania (np. pulsującą kropkę). Po przejściu do widoku listy, jeśli przeliczanie nie jest jeszcze zakończone, należy wyświetlić szkielet interfejsu (skeleton UI).

- wedlug rekomendacji

28. Jak powinna wyglądać struktura ekranów uwierzytelniania? Czy formularze logowania (`US-002`) i rejestracji (`US-001`) powinny znajdować się na jednym ekranie (np. w zakładkach), czy na osobnych stronach?

    Rekomendacja: Zastosować jeden widok z dwiema zakładkami: "Logowanie" i "Rejestracja". Umożliwi to użytkownikowi łatwe przełączanie się między formularzami bez konieczności nawigowania wstecz. Przycisk "Kontynuuj z Google" powinien być widoczny i dostępny w obu zakładkach.

- wedlug rekomendacji

29. W jaki sposób tabelaryczny "Widok Tygodnia" powinien być dostosowany do wyświetlania na urządzeniach mobilnych, aby uniknąć problemów z czytelnością i horyzontalnym przewijaniem?

    Rekomendacja: Na ekranach mobilnych należy zmienić układ tabelaryczny na listę pionową, gdzie każdy element listy reprezentuje jeden dzień tygodnia. Po kliknięciu w dany dzień, rozwijałby on listę trzech posiłków (śniadanie, obiad, kolacja) zaplanowanych na ten dzień, zachowując te same interakcje (przejście do przepisu, wymiana).

- wedlug rekomendacji

30. Jaki komunikat i interfejs powinien zobaczyć użytkownik w widoku "Wszystkie przepisy", jeśli jego wyszukiwanie lub zastosowane filtry nie zwrócą żadnych wyników?

    Rekomendacja: Wyświetlić na środku ekranu czytelny komunikat, np. "Nie znaleziono przepisów spełniających podane kryteria", wraz z ikoną lub prostą ilustracją. Poniżej komunikatu powinien znaleźć się przycisk "Wyczyść filtry", który pozwoli użytkownikowi szybko powrócić do pełnej listy przepisów.

- wedlug rekomendacji

<pytania>
31. W jaki sposób UI powinno obsłużyć destrukcyjną akcję "Zacznij od nowa" (`US-019`) w profilu użytkownika, aby zapobiec przypadkowej utracie danych?

    Rekomendacja: Zastosować dwuetapowe potwierdzenie. Po kliknięciu "Zacznij od nowa" należy wyświetlić okno modalne z wyraźnym ostrzeżeniem o nieodwracalnym usunięciu planu i postępów. Finalny przycisk potwierdzający w modalu powinien mieć jednoznaczny tekst, np. "Tak, zresetuj mój plan" i być wizualnie odróżniony (np. kolorem czerwonym).

- wedlug rekomendacji

32. Co powinno się stać, jeśli zaloguje się powracający użytkownik, który założył konto, ale z jakiegoś powodu nie ukończył procesu onboardingu?

    Rekomendacja: API powinno zwracać informację o statusie ukończenia onboardingu (np. `onboarding_complete: false`). Jeśli status jest negatywny, aplikacja powinna automatycznie przekierować użytkownika do pierwszego nieukończonego kroku onboardingu, zamiast do "Panelu Dziennego".

- nie bedzie przechowywany stan nieukonczonego onboardingu - ma zaczyc od poczatku

33. Czy zaznaczony/odznaczony stan produktów na "Liście Zakupów" (`US-017`) powinien być zachowany, gdy użytkownik przejdzie do innego widoku i wróci w ramach tej samej sesji (bez przeładowania strony)?

    Rekomendacja: Tak. Ten stan interfejsu powinien być przechowywany w globalnym menedżerze stanu (Zustand). Zapewni to lepsze doświadczenie użytkownika, ponieważ jego postępy w odznaczaniu listy nie zostaną utracone podczas nawigacji po aplikacji. Stan zostanie zresetowany dopiero po pełnym przeładowaniu strony.

- wedlug rekomendacji

34. W jaki sposób UI powinno poinformować użytkownika, _dlaczego_ niektóre opcje tempa utraty wagi w onboardingu są niedostępne (`US-006`)?

    Rekomendacja: Nieaktywne opcje powinny być wyszarzone. Po najechaniu na nie (desktop) lub dotknięciu ikony informacyjnej obok nich (mobile), powinien pojawić się tooltip z wyjaśnieniem, np. "Ta opcja jest niedostępna, ponieważ prowadziłaby do diety poniżej bezpiecznego minimum kalorycznego."

- wedlug rekomendacji

35. Jak powinien wyglądać początkowy stan dziennych pasków postępu w "Panelu Dziennym" na początku dnia, zanim użytkownik oznaczy jakikolwiek posiłek jako zjedzony?

    Rekomendacja: Paski powinny być całkowicie puste (0% wypełnienia). Wewnątrz lub obok każdego paska należy wyświetlić tekst w formacie "0 / [cel] g" (np. "0 / 158 g"), aby od samego początku dnia jasno komunikować cel do zrealizowania.

- wedlug rekomendacji

<pytania>
36. Biorąc pod uwagę, że użytkownik, który nie ukończył onboardingu, musi zacząć go od nowa, w jaki sposób UI powinno zakomunikować ten proces po zalogowaniu, aby uniknąć dezorientacji?

    Rekomendacja: Po pomyślnym zalogowaniu, jeśli system stwierdzi brak profilu, należy na chwilę wyświetlić ekran z komunikatem (np. "Kończymy konfigurację Twojego konta...") zanim nastąpi przekierowanie do pierwszego kroku onboardingu. Zapewni to płynne przejście i nada kontekst ponownemu rozpoczęciu procesu.

- wedlug rekomendacji

37. Jaki powinien być przepływ i interfejs, gdy użytkownik loguje się przez Google, a w systemie istnieje już konto na ten sam e-mail zarejestrowane hasłem (`US-004`)?

    Rekomendacja: Po autoryzacji w Google, system powinien wykryć istniejące konto i wyświetlić ekran pośredni z prośbą o jednorazowe podanie hasła w celu weryfikacji tożsamości i połączenia kont. Komunikat mógłby brzmieć: "Konto z tym adresem e-mail już istnieje. Aby połączyć je z kontem Google, prosimy o podanie hasła."

- wedlug rekomendacji

38. Gdzie dokładnie w "Widoku Przepisu" powinien być umieszczony stały komunikat o konieczności weryfikacji składników pod kątem alergii (`PRD 3.6`), aby był widoczny, ale nie przeszkadzał w czytaniu przepisu?

    Rekomendacja: Umieścić niewielki, ale wyraźny komponent typu `Alert` (z ikoną informacyjną) na samym dole widoku przepisu, pod instrukcją przygotowania. Zapewni to jego stałą obecność bez naruszania głównej treści.

- w MVP nie robimy tego

39. Kiedy użytkownik modyfikuje gramaturę składnika w posiłku na dany dzień (`US-015`), jak UI powinno zakomunikować, że ta zmiana dotyczy tylko tej jednej, konkretnej instancji posiłku, a nie ogólnego przepisu?

    Rekomendacja: Po zapisaniu zmiany gramatury wyświetlić krótkie powiadomienie typu "Toast" z komunikatem, np. "Zaktualizowano składniki dla dzisiejszego obiadu". To subtelnie podkreśli, że zmiana jest lokalna i dotyczy konkretnego dnia.

- wedlug rekomendacji

40. W jaki sposób UI powinno obsłużyć automatyczne do-generowywanie brakujących dni planu w tle przy starcie aplikacji ("kroczące okno" z `PRD 3.3`)?

    Rekomendacja: Proces ten powinien być dla użytkownika niewidoczny, jeśli przebiegnie pomyślnie. W przypadku błędu (np. braku połączenia), w "Panelu Dziennym" i "Widoku Tygodnia" powinien pojawić się dyskretny banner informujący, np. "Nie udało się zaktualizować planu. Sprawdź połączenie z internetem." Aplikacja powinna nadal wyświetlać dane, które udało jej się pobrać lub odczytać z pamięci lokalnej.

- wedlug rekomendacji

<pytania>
41. W związku z decyzją o usunięciu komunikatu o alergiach z widoku przepisu, czy jednorazowy, obowiązkowy disclaimer podczas onboardingu (`US-008`) jest jedynym i wystarczającym mechanizmem informacyjnym dotyczącym braku obsługi alergii i nietolerancji w całym MVP?

    Rekomendacja: Potwierdzić, że jedyny, obowiązkowy disclaimer w procesie onboardingu jest wystarczający. Pozwoli to na utrzymanie czystości interfejsu w pozostałych częściach aplikacji.

- tak

42. Po modyfikacji gramatury składnika (`US-015`), która wymaga komunikacji z API, w jaki sposób UI powinno zwizualizować proces zapisu i potwierdzenia zmiany, aby użytkownik miał pewność, że jego modyfikacja została uwzględniona?

    Rekomendacja: Zastosować podejście optymistycznego UI. Paski postępu i podsumowanie makro powinny zaktualizować się natychmiast po zmianie wartości. Jednocześnie, obok zmodyfikowanego pola, należy na krótko wyświetlić wskaźnik zapisu (np. "Zapisywanie..."). W razie błędu API, zmiana powinna zostać cofnięta, a użytkownik poinformowany o problemie za pomocą komunikatu "Toast".

- wedlug rekomendacji

43. Jaki jest oczekiwany przepływ użytkownika po pomyślnym zresetowaniu hasła (`US-003`)? Czy po ustawieniu nowego hasła w formularzu powinien zostać przeniesiony z powrotem do ekranu logowania, czy automatycznie zalogowany i przekierowany do aplikacji?

    Rekomendacja: W celu zapewnienia najlepszego doświadczenia, po pomyślnym ustawieniu nowego hasła użytkownik powinien być automatycznie zalogowany i przekierowany bezpośrednio do "Panelu Dziennego".

- wedlug rekomendacji

44. W jaki sposób interfejs modalu z listą dań zastępczych (`US-014`) powinien wizualnie przedstawić kluczową informację o różnicy kalorycznej (`calorie_diff` z API), aby ułatwić użytkownikowi podjęcie decyzji?

    Rekomendacja: Przy każdej propozycji dania zastępczego, obok jego sumarycznej kaloryczności, należy wyświetlić wyraźną etykietę z różnicą, np. `(+15 kcal)` lub `(-10 kcal)`. Można dodatkowo użyć kolorów (np. zielony dla małych różnic, czerwony dla dużych), aby wizualnie wzmocnić przekaz.

- wedlug rekomendacji

45. Jak UI powinno obsłużyć dane z poprzedniego dnia ("wczoraj") w widoku kalendarza w "Panelu Dziennym"? Czy użytkownik powinien mieć możliwość wglądu w plan z poprzedniego dnia?

    Rekomendacja: Tak, użytkownik powinien mieć możliwość kliknięcia na "wczorajszy", wyszarzony dzień w kalendarzu. Widok ten powinien być w trybie "tylko do odczytu" – bez możliwości zmiany posiłków czy oznaczania ich jako zjedzone – prezentując finalny stan z poprzedniego dnia.

- wedlug rekomendacji

<pytania>
46. Jakie informacje powinna zawierać pojedyncza karta przepisu na liście w widoku "Wszystkie przepisy", aby ułatwić użytkownikom przeglądanie i wybór?

    Rekomendacja: Każda karta powinna wyświetlać zdjęcie potrawy, jej nazwę oraz kluczowe wartości makro (Kalorie, Białko, Węglowodany, Tłuszcze) w kompaktowej formie, co pozwoli na szybkie porównywanie przepisów bez wchodzenia w szczegóły.

- wedlug rekomendacji

47. Jaki spójny wzorzec powinien być zastosowany do wyświetlania błędów walidacji we wszystkich formularzach w aplikacji (rejestracja, logowanie, odzyskiwanie hasła, profil)?

    Rekomendacja: Zastosować walidację w czasie rzeczywistym (po utracie fokusu z pola - `onBlur`). Błędne pole powinno otrzymać czerwoną ramkę, a bezpośrednio pod nim powinien pojawić się krótki, zrozumiały komunikat o błędzie (np. "Hasła nie są identyczne").

- wedlug rekomendacji

48. Jakie dodatkowe wizualne potwierdzenie, oprócz aktualizacji pasków postępu, powinien otrzymać użytkownik po oznaczeniu posiłku jako "Zjedzono"?

    Rekomendacja: Po zaznaczeniu checkboxa, cała karta posiłku powinna zostać lekko wyszarzona (zmniejszona opacość), a na zdjęciu może pojawić się ikona " галочки" (checkmark). To da natychmiastową, jednoznaczną informację zwrotną o wykonanej akcji.

- karta posiłku dostanie obramowanie zielone oraz zaznaczony chcebox z ptaszkiem

49. Co powinno się stać, jeśli generowanie pierwszego 7-dniowego planu po onboardingu nie powiedzie się (np. z powodu błędu serwera `500` przy wywołaniu `POST /profile/me/generate-plan`)?

    Rekomendacja: Wyświetlić ekran błędu z jasnym komunikatem ("Wystąpił błąd podczas generowania Twojego planu") i wyraźnym przyciskiem "Spróbuj ponownie". Przycisk ten powinien ponowić wywołanie API generującego plan bez konieczności ponownego przechodzenia przez onboarding.

- wedlug rekomendacji

50. Jak UI powinno obsłużyć złożony przypadek błędu, w którym aktualizacja profilu użytkownika (`PATCH /profile/me`) zakończyła się sukcesem, ale następująca po niej automatyczna regeneracja planu posiłków nie powiodła się?

    Rekomendacja: Zmiany w profilu (np. nowa waga) powinny zostać zapisane i być widoczne. Jednocześnie na "Panelu Dziennym" i "Widoku Tygodnia" powinien pojawić się trwały, niemożliwy do zamknięcia alert z informacją: "Twoje cele zostały zaktualizowane, ale wystąpił błąd podczas generowania nowego planu. Prosimy spróbować odświeżyć stronę."

- wedlug rekomendacji

<pytania>
51. Jaki powinien być początkowy stan "Listy Zakupów" dla zupełnie nowego użytkownika, który właśnie ukończył onboarding, a jego pierwszy plan jest jeszcze w trakcie generowania?

    Rekomendacja: Wyświetlić dedykowany ekran "pustego stanu" z komunikatem, np. "Twoja lista zakupów pojawi się tutaj, gdy tylko wygenerujemy Twój pierwszy plan posiłków." oraz wskaźnikiem ładowania. Uniknie to wrażenia, że aplikacja jest zepsuta.

- wedlug rekomendacji

52. Jaka będzie strategia zapewnienia podstawowej dostępności (accessibility) aplikacji, w szczególności dla nawigacji za pomocą klawiatury i czytników ekranu, biorąc pod uwagę wykorzystanie biblioteki shadcn/ui?

    Rekomendacja: Należy w pełni wykorzystać wbudowane w shadcn/ui (i bazowy Radix UI) mechanizmy dostępności, takie jak obsługa klawiatury dla komponentów interaktywnych. Należy również zadbać o dodawanie odpowiednich etykiet `aria-label` do wszystkich przycisków-ikon bez tekstu (np. przycisk wymiany posiłku).

- wedlug rekomendacji

53. Jak w spójny sposób w całej aplikacji będą obsługiwane długie nazwy (np. przepisów) oraz formatowanie jednostek (g, kg, ml, szt.)?

    Rekomendacja: Zastosować globalną regułę CSS `text-overflow: ellipsis` do przycinania zbyt długich nazw w kontenerach o stałej szerokości (np. na kartach przepisów). Dla jednostek należy stworzyć prostą funkcję formatującą, która zapewni ich spójny zapis (np. zawsze małą literą, bez kropki na końcu) we wszystkich miejscach, gdzie się pojawiają.

- wedlug rekomendacji

54. Jaki interfejs zobaczy użytkownik bezpośrednio po wysłaniu opinii przez formularz "Zgłoś problem" (`US-020`), aby poczuł, że jego zgłoszenie zostało skutecznie przyjęte?

    Rekomendacja: Zamiast prostego komunikatu "Toast", przekierować użytkownika na dedykowany, prosty ekran z podziękowaniem, np. "Dziękujemy za Twoją opinię! Pomagasz nam ulepszać aplikację." oraz przyciskiem "Wróć do aplikacji", co wzmocni pozytywne odczucia.

- wedlug rekomendacji

55. W jaki sposób interfejs do wyboru wagi i wzrostu za pomocą suwaków w onboardingu zostanie zoptymalizowany pod kątem urządzeń mobilnych, gdzie precyzyjne operowanie suwakiem może być trudne?

    Rekomendacja: Obok suwaka należy umieścić wyraźne pole `Input`, które pozwoli na bezpośrednie wpisanie wartości z klawiatury numerycznej. Zmiana w polu tekstowym powinna natychmiast aktualizować pozycję suwaka i odwrotnie, dając użytkownikowi dwie metody wprowadzania danych.

- wedlug rekomendacji

<pytania>
56. W jaki sposób wizualnie zakomunikować użytkownikowi postęp w wieloetapowym procesie onboardingu?

    Rekomendacja: Zastosować komponent "stepper" (wskaźnik kroków) lub prosty pasek postępu, umieszczony na stałe na górze ekranu podczas całego procesu onboardingu. Powinien on jasno pokazywać, na którym etapie jest użytkownik i ile kroków pozostało do końca (np. "Krok 3 z 5").

- wedlug rekomendacji

57. Jak w widoku "Listy Zakupów" powinny być wizualnie oddzielone kategorie produktów (Nabiał, Mięso, Warzywa itd.), aby ułatwić zakupy?

    Rekomendacja: Każdą kategorię należy przedstawić jako osobną sekcję z wyraźnym, pogrubionym nagłówkiem (np. "Mięso i Ryby"). Poszczególne produkty z danej kategorii powinny być listowane pod odpowiednim nagłówkiem. Taka struktura ułatwia skanowanie listy i odnajdywanie produktów w sklepie.

- wedlug rekomendacji

58. Jak będzie wyglądał interfejs do edycji danych w widoku "Profil"? Czy dane będą edytowalne w miejscu, czy otworzy się dedykowany formularz/modal?

    Rekomendacja: W widoku "Profil" aktualne dane użytkownika (waga, poziom aktywności) powinny być wyświetlane jako tekst. Obok każdej wartości należy umieścić ikonę lub przycisk "Edytuj". Kliknięcie go powinno otworzyć okno modalne (`Dialog`) z formularzem do edycji, co zapewni spójne doświadczenie i skoncentruje użytkownika na zadaniu.

- wedlug rekomendacji

59. Co powinien zobaczyć użytkownik, który kliknie w wygasły lub nieprawidłowy link do resetowania hasła?

    Rekomendacja: Użytkownik powinien zostać przekierowany na dedykowaną stronę z jasnym komunikatem o błędzie, np. "Ten link do resetowania hasła jest nieprawidłowy lub stracił ważność." Poniżej komunikatu powinien znajdować się przycisk "Poproś o nowy link", który przeniesie go z powrotem do formularza odzyskiwania hasła.

- wedlug rekomendacji

60. Jak powinien wyglądać "Panel Dzienny" dla nowego użytkownika, który kończy onboarding późnym wieczorem? Czy należy jakoś specjalnie zakomunikować, że plan efektywnie zaczyna się od jutra?

    Rekomendacja: "Panel Dzienny" powinien standardowo wyświetlić plan na bieżący, kończący się dzień. Dodatkowo, na górze widoku można umieścić jednorazowy, zamykany komponent typu `Alert` z komunikatem: "Witaj! Oto Twój plan na dziś. Pamiętaj, że pełny cykl Twojej diety rozpocznie się jutro."

- wedlug rekomendacji bez alertu

<pytania>
61. Jak powinien zostać zaadaptowany układ "Panelu Dziennego" na urządzeniach mobilnych, w szczególności rozmieszczenie czterech pasków postępu i kart posiłków?

    Rekomendacja: Na urządzeniach mobilnych paski postępu powinny być ułożone wertykalnie (jeden pod drugim) dla maksymalnej czytelności. Karty posiłków pozostają wertykalnie, ale ich wewnętrzny układ może być bardziej zwarty, aby zmieścić wszystkie kluczowe informacje bez przewijania.

- wedlug rekomendacji

62. Jak technicznie obsłużyć częste zmiany gramatury składnika (np. przez szybkie klikanie przycisków "+/-"), aby nie przeciążać API wieloma żądaniami `PATCH`?

    Rekomendacja: Zaimplementować mechanizm "debouncing". Żądanie API aktualizujące posiłek powinno być wysyłane dopiero po krótkiej przerwie w interakcji użytkownika (np. 500-1000ms), co grupuje wielokrotne zmiany w jedno zapytanie i zapewnia płynność interfejsu.

- wedlug rekomendacji

63. Jaki element na karcie posiłku w "Panelu Dziennym" powinien być głównym Call-To-Action (CTA), a jakie elementy powinny być drugorzędne?

    Rekomendacja: Głównym CTA jest interaktywny checkbox "Zjedzono". Cała karta powinna być drugorzędnym, klikalnym obszarem prowadzącym do szczegółów przepisu. Nazwa dania powinna mieć największą wagę typograficzną.

- wedlug rekomendacji

64. Czy dla użytkownika, który po raz pierwszy widzi "Panel Dzienny", przewidziano jakąkolwiek formę podpowiedzi lub mini-instrukcji, aby ułatwić mu zrozumienie interfejsu?

    Rekomendacja: Dla MVP zrezygnować z pełnego "tour". Zamiast tego, wdrożyć jednorazowy, zamykany tooltip wskazujący na pierwszy checkbox "Zjedzono" z tekstem "Zaznacz, gdy zjesz posiłek, aby śledzić postępy".

- w MVP nic nie robimy

65. Jak dokładnie powinna wyglądać interakcja i animacja przenoszenia odznaczonego produktu na dół listy zakupów w ramach jego kategorii (`US-017`)?

    Rekomendacja: Zastosować płynną animację (np. `transition` w CSS), która wizualnie przesuwa element na dół listy w swojej kategorii po jego odznaczeniu. Powinno to być połączone z efektem przekreślenia tekstu.

- wedlug rekomendacji

<pytania>

2.  Jak wizualnie i funkcjonalnie obsłużyć ostatni krok onboardingu, czyli moment po kliknięciu "Zatwierdź i wygeneruj plan", który inicjuje transakcyjną operację `POST /profiles/me/onboarding`? Jak postępować w przypadku błędu z API na tym etapie?

    Rekomendacja: Po kliknięciu przycisku należy zablokować interfejs i wyświetlić wskaźnik ładowania na pełnym ekranie z komunikatem "Generujemy Twój spersonalizowany plan...". W przypadku sukcesu (HTTP 201), użytkownik jest automatycznie przekierowywany do "Widoku Dnia". W przypadku błędu (np. HTTP 400), wskaźnik ładowania znika, a na ekranie podsumowania onboardingu pojawia się wyraźny komunikat błędu (np. "Wystąpił błąd. Sprawdź wprowadzone dane i spróbuj ponownie."), pozwalając użytkownikowi na ponowienie próby bez utraty danych z formularza.

- tak zgadzam sie

3.  W jaki sposób UI powinno informować użytkownika, że aktualizacja jego danych profilowych (np. wagi przez `PATCH /profiles/me`) spowoduje automatyczną regenerację przyszłych dni w planie posiłków?

    Rekomendacja: Przed wysłaniem żądania `PATCH` po zmianie kluczowych danych, należy wyświetlić modalne okno dialogowe z potwierdzeniem, np. "Zmiana Twojej wagi spowoduje przeliczenie celów i dostosowanie planu posiłków od jutra. Kontynuować?". Po pomyślnej aktualizacji powinien pojawić się krótki komunikat typu "toast" informujący: "Profil zaktualizowany. Twój plan został dostosowany."

- tak zgadzam sie

4.  Jaki powinien być model interakcji przy oznaczaniu posiłku jako "Zjedzony" (`PATCH /planned-meals/{id}`) oraz jego wymianie (`POST /planned-meals/{id}/replace`)? Czy interfejs ma czekać na odpowiedź serwera, czy działać optymistycznie?

    Rekomendacja: Zaleca się zastosowanie "optimistic updates". Po kliknięciu przycisku, UI powinno natychmiast zaktualizować swój stan (np. przycisk "Zjedzono" zmienia wygląd, paski postępu się animują, posiłek zostaje podmieniony). Równocześnie wysyłane jest żądanie do API. W przypadku błędu, UI jest przywracane do stanu poprzedniego, a użytkownikowi wyświetlany jest komunikat o niepowodzeniu.

- tak zgadzam sie

5.  Jak UI powinno obsłużyć sytuację, gdy użytkownik próbuje wymienić posiłek, a API zwraca błąd `409 Conflict`, informujący o braku dostępnych zamienników?

    Rekomendacja: Zamiast generycznego komunikatu o błędzie, interfejs powinien wyświetlić kontekstową, nietechniczną informację zwrotną w formie "toasta" lub małego komunikatu przy przycisku, np. "Niestety, aktualnie brak dostępnych zamienników dla tego posiłku". Posiłek w planie powinien pozostać bez zmian.

- tak zgadzam sie

6.  W jaki sposób zapewnić, że użytkownik rozumie, iż modyfikacja gramatury składnika w widoku przepisu (`PATCH /planned-meals/{id}` z `ingredient_overrides`) jest zmianą lokalną dla danego dnia i nie wpływa na globalną listę zakupów (zgodnie z FR-21)?

    Rekomendacja: Bezpośrednio pod kontrolkami do zmiany gramatury (+/-) w widoku przepisu należy umieścić tekst pomocniczy (microcopy), np. "Zmiana wpłynie tylko na wartości odżywcze dzisiejszego posiłku i nie zaktualizuje listy zakupów."

- nie musimy go o tym informowac - informacja na liscie zakupow mowi ze jest to lista bez dnia biezacego

7.  Jak powinien zachować się system, gdy użytkownik zarejestruje się (np. przez Google OAuth), ale przerwie obowiązkowy onboarding przed jego ukończeniem i spróbuje zalogować się ponownie?

    Rekomendacja: Należy zaimplementować mechanizm (np. w głównym komponencie layoutu lub jako middleware), który po każdym zalogowaniu sprawdza stan `onboarding_completed` w profilu użytkownika (`GET /profiles/me`). Jeśli jest `false`, aplikacja musi bezwzględnie przekierować użytkownika do odpowiedniego kroku onboardingu, blokując dostęp do jakiejkolwiek innej części serwisu.

- dostep do wszystkich czesc systemu bedzie dozwolony a przejscie do panelu dziennego przekieruje do onboardingu

8.  Jakie stany ładowania i puste stany powinny zostać zaprojektowane dla kluczowych widoków, takich jak "Widok Dnia" i "Lista Zakupów", podczas oczekiwania na dane z API (`GET /planned-meals`, `GET /shopping-list`)?

    Rekomendacja: Należy zaprojektować komponenty "szkieletowe" (skeleton loaders), które naśladują finalny układ interfejsu (np. szare bloki w miejscu kart posiłków i pasków postępu). Dla pustej listy zakupów (co jest mało prawdopodobne, ale możliwe) należy wyświetlić komunikat, np. "Twoja lista zakupów jest pusta. Wygląda na to, że masz już wszystkie składniki!".

- tak zrobmy

9.  W jaki sposób UI ma zarządzać stanem zaznaczenia na liście zakupów, biorąc pod uwagę, że każda zmiana wywołuje osobne żądanie `PUT /shopping-list/items/{ingredientId}`?

    Rekomendacja: Stan zaznaczenia każdego elementu listy powinien być zarządzany lokalnie w komponencie. Kliknięcie checkboxa powinno natychmiast zmienić stan w UI (optimistic update), a w tle wysłać żądanie `PUT`. Należy również zastosować mechanizm "debouncing" lub "throttling", aby uniknąć wysyłania nadmiarowej liczby żądań, jeśli użytkownik szybko klika wiele pozycji.

- tak zrobmy

10. Czy istnieje preferowany układ (layout) dla "Widoku Dnia" na ekranie desktopowym, który w pełni wykorzysta dostępną przestrzeń, biorąc pod uwagę, że priorytetem jest desktop?

    Rekomendacja: Na desktopie proponuje się układ dwukolumnowy. W lewej, szerszej kolumnie, powinny znajdować się karty trzech posiłków. W prawej, węższej kolumnie, powinny być umieszczone cztery paski postępu (Kalorie, B, T, W), aby były one stale widoczne podczas przewijania listy posiłków. Na urządzeniach mobilnych układ powinien zmieniać się na jedokolumnowy, z paskami postępu na górze ekranu.

- ma byc u gory prostokat z 4 paskami a pod nim koleny prostokat z posilkami w poziomie oraz taki "timeline" na ktorym bedzie mozna ohaczac posilki oraz pokaze w ktorej czesci dnia jestesmy (aktualna godzine)
  </pytania>

<pytania>
11. W jaki sposób ma funkcjonować nowo dodany panel "Wszystkie Przepisy"? Czy ma to być prosta siatka/lista przepisów z paginacją, czy powinna zawierać opcje filtrowania (np. po typie posiłku: śniadanie, obiad, kolacja), co jest wspierane przez endpoint `GET /recipes`?

    Rekomendacja: Zaleca się dodanie prostych przycisków filtrów ("Wszystkie", "Śniadania", "Obiady", "Kolacje") nad listą przepisów. Użycie `TanStack Query` pozwoli na efektywne zarządzanie cachowaniem danych dla każdego z filtrów. Każdy przepis na liście powinien być klikalną kartą prowadzącą do widoku szczegółowego.

- u gory ma byc prostokat z przepisem a pod nim prostokaty z z tytulami przepisow i ich glownymi wlasciwosciami (kcal, macro, trudnosc) - szybkie filtrowanie miedzy wszsytkie, sniadanie, obiad, kolacja

12. Jaki dokładnie układ mają mieć posiłki w "Widoku Dnia", które mają być prezentowane "w poziomie"? Czy oznacza to trzy karty posiłków obok siebie na desktopie, które na mobile zwijają się do układu jedna pod drugą lub do poziomego slidera?

    Rekomendacja: Na desktopie proponuje się układ "flex" z trzema kartami posiłków zajmującymi równą szerokość. Na ekranach mobilnych (poniżej ustalonego breakpointu, np. 768px) układ powinien automatycznie zmienić się na pionowy (jedna karta pod drugą), aby zachować czytelność.

- tak zgadzam sie

13. Proszę o uszczegółowienie koncepcji "timeline'u" w "Widoku Dnia". Czy ma to być wizualna oś czasu (np. od 6:00 do 24:00) ze wskaźnikiem aktualnej godziny? Gdzie na tej osi umieszczone są posiłki i w jaki sposób użytkownik je "odhacza"?

    Rekomendacja: Proponuje się prostą, horyzontalną oś reprezentującą dzień. Ikony posiłków (śniadanie, obiad, kolacja) są rozmieszczone w stałych punktach. Pionowa kreska pokazuje aktualną godzinę. Kliknięcie na ikonę posiłku na osi czasu powinno działać tak samo jak przycisk "Zjedzono" (`PATCH /planned-meals/{id}`), zmieniając wygląd ikony (np. wypełnienie kolorem) i aktualizując paski postępu.

- tak zrobmy

14. Czy "odhaczenie" posiłku na nowym "timeline'ie" zastępuje przycisk "Zjedzono" na kartach posiłków, czy też oba te mechanizmy mają istnieć równolegle i być ze sobą zsynchronizowane?

    Rekomendacja: Aby uniknąć konfuzji, zaleca się posiadanie jednego, spójnego mechanizmu. Interakcja na "timeline'ie" powinna być głównym sposobem oznaczania posiłków. Karty posiłków powinny jedynie odzwierciedlać ten stan (np. poprzez zmianę stylu), ale nie zawierać duplikującego się przycisku.

- zrobmy wedlug rekomendacji

15. Jeśli użytkownik z nieukończonym onboardingiem wejdzie na stronę "Ustawienia", to czy formularz z jego danymi (waga, wzrost, etc.) powinien być w pełni edytowalny? Czy zapisanie tych danych w ustawieniach jest równoznaczne z ukończeniem onboardingu i powinno wywołać `POST /profiles/me/onboarding`?

    Rekomendacja: Tak, formularz w ustawieniach powinien być edytowalny. Jeśli użytkownik z `onboarding_completed: false` wypełni wszystkie wymagane pola i zapisze zmiany, aplikacja powinna wysłać żądanie `POST /profiles/me/onboarding`, dokończyć proces i przekierować go do "Widoku Dnia". Dla użytkowników z ukończonym onboardingiem, ten sam formularz powinien wysyłać żądanie `PATCH /profiles/me`.

- tak zrobmy

16. Co powinien zobaczyć użytkownik z nieukończonym onboardingiem po wejściu na stronę "Lista Zakupów" lub nową stronę "Wszystkie Przepisy"?

    Rekomendacja: Strona "Wszystkie Przepisy" powinna działać normalnie, ponieważ nie wymaga ona danych użytkownika. Strona "Lista Zakupów" powinna wyświetlać komponent "pustego stanu" z informacją "Aby wygenerować listę zakupów, najpierw uzupełnij swój profil i stwórz plan." oraz przyciskiem przekierowującym do onboardingu/ustawień.

- tak zrobmy

17. Gdzie dokładnie i w jakiej formie ma pojawić się informacja na liście zakupów, że jest ona generowana bez uwzględnienia bieżącego dnia?

    Rekomendacja: Na samej górze widoku "Lista Zakupów", nad listą kategorii produktów, należy umieścić dobrze widoczny, ale nieinwazyjny komponent informacyjny (np. lekko podświetlony pasek) z tekstem: "Lista zakupów obejmuje składniki na najbliższe 7 dni, począwszy od jutra."

- tak zgadzam sie

<pytania>
18. Jaki jest domyślny stan dużego prostokąta z przepisem na górze strony "Wszystkie Przepisy", zanim użytkownik kliknie na którąkolwiek z małych kart poniżej? Czy jest on pusty, pokazuje losowy "przepis dnia", czy może wyświetla się dopiero po wybraniu przepisu z listy?

    Rekomendacja: Domyślnie, przed interakcją użytkownika, duży prostokąt powinien być ukryty lub wyświetlać zachętę, np. "Wybierz przepis z listy poniżej, aby zobaczyć szczegóły". Po kliknięciu na dowolną małą kartę, duży prostokąt wypełnia się danymi z tego przepisu (`GET /recipes/{id}`), a lista poniżej pozostaje na swoim miejscu, co umożliwia szybkie przełączanie się między przepisami.

- losowy przepis

19. Po kliknięciu na kartę posiłku w "Widoku Dnia" lub na liście w panelu "Wszystkie Przepisy", użytkownik jest przenoszony do widoku szczegółowego przepisu. Jak powinien on móc wrócić do poprzedniego ekranu?

    Rekomendacja: W widoku szczegółowym przepisu, w lewym górnym rogu, powinna znajdować się wyraźna ikona strzałki w lewo z etykietą "Wróć". Kliknięcie jej powinno cofać użytkownika do ekranu, z którego przyszedł (czyli do "Widoku Dnia" lub do panelu "Wszystkie Przepisy").

- klikniecie przepisu przekieruje go do panelu Wszsytkie przepisy z aktualnie kliknietym prepisem i wtedy moze sobie wrocic do panelu widoku dnia

20. Jak interfejs ma obsługiwać dużą liczbę przepisów w panelu "Wszystkie Przepisy", biorąc pod uwagę, że API wspiera paginację (`limit` i `page`)? Czy preferowany jest przycisk "Załaduj więcej" na końcu listy, czy tradycyjna paginacja z numerami stron?

    Rekomendacja: Dla uproszczenia interfejsu w MVP, zaleca się zastosowanie przycisku "Załaduj więcej" na końcu listy przepisów. Jest to rozwiązanie bardziej przyjazne dla urządzeń mobilnych i prostsze w implementacji niż klasyczna paginacja.

- wedlug rekomendacji

21. Jak wizualnie powinien być reprezentowany na "timeline'ie" posiłek, którego zaplanowany czas już minął (np. jest godzina 15:00, a śniadanie nie jest "odhaczone"), ale który nie został oznaczony jako "zjedzony"?

    Rekomendacja: Ikona takiego posiłku na osi czasu powinna zmienić swój styl, aby subtelnie wskazywać na pominięcie akcji, np. poprzez zmianę koloru obramowania na pomarańczowy lub czerwony. Powinno to wizualnie sygnalizować użytkownikowi, że dana akcja wymaga uwagi, ale nadal pozwalać na jej wykonanie (odhaczenie posiłku).

- wedlug rekomendacji

22. W widoku "Ustawień", oprócz formularza z danymi profilowymi (waga, wzrost itp.), gdzie dokładnie powinny znajdować się opcje do zarządzania kontem, takie jak "Zmień hasło" i "Usuń konto"?

    Rekomendacja: W widoku "Ustawień" proponuje się stworzenie dwóch oddzielnych sekcji lub zakładek: "Mój Profil" (z wagą, wzrostem, celem) i "Konto" (z opcjami zmiany hasła i usunięcia konta). Opcja "Usuń konto" powinna być wyraźnie oznaczona jako akcja destrukcyjna i dodatkowo zabezpieczona modalnym oknem dialogowym z prośbą o ostateczne potwierdzenie.

- wedlug rekomendacji

23. Jaka jest ogólna strategia obsługi błędów API w interfejsie, które nie zostały wcześniej sprecyzowane (np. błędy sieciowe, błędy serwera 500)? Czy aplikacja powinna wyświetlać globalny komunikat błędu, czy próbować ponowić żądanie w tle?

        Rekomendacja: W przypadku krytycznych błędów (brak połączenia, błąd serwera) uniemożliwiających załadowanie kluczowego widoku, należy wyświetlić komponent błędu na całym ekranie z przyciskiem "Spróbuj ponownie". Dla mniej krytycznych operacji (np. nieudane zapisanie stanu checkboxa na liście zakupów), należy wyświetlić nietrwały komunikat typu "toast" w rogu ekranu z informacją o problemie i ewentualną opcją ponowienia próby. Nie zaleca się automatycznego ponawiania żądań w tle bez informacji dla użytkownika.

- wedlug rekomendacji

<pytania>
24. Czy w panelu "Wszystkie Przepisy" losowy przepis w górnym prostokącie powinien być losowany przy każdej wizycie na tej stronie, czy tylko raz na sesję użytkownika? Jak UI ma się zachowywać podczas ładowania tego przepisu?

    Rekomendacja: Proponuje się, aby przepis był losowany tylko raz na sesję użytkownika (np. po zalogowaniu), aby uniknąć dezorientacji przy każdym powrocie na stronę. Podczas ładowania, w dużym prostokącie powinien być widoczny komponent "szkieletowy" (skeleton loader), podczas gdy lista przepisów poniżej może ładować się niezależnie.

- wedlug rekomendacji

25. Potwierdzając nowy przepływ nawigacji: gdy użytkownik kliknie przepis w "Widoku Dnia", zostanie przeniesiony do widoku "Wszystkie Przepisy". Czy celem jest zachęcenie do odkrywania innych dań? Czy rozważono alternatywę, np. wyświetlenie szczegółów przepisu w oknie modalnym, co pozwoliłoby użytkownikowi pozostać w kontekście "Widoku Dnia"?

    Rekomendacja: Aby nie wybijać użytkownika z głównego zadania (śledzenia dnia), zaleca się wyświetlanie szczegółów przepisu w oknie modalnym (modal) po kliknięciu z "Widoku Dnia". Przekierowanie do strony "Wszystkie Przepisy" powinno następować tylko wtedy, gdy użytkownik wejdzie na tę stronę bezpośrednio z nawigacji głównej, co zapewni bardziej intuicyjną ścieżkę użytkownika.

- wedlug rekomendacji - okno modalne i wyglad przepisu taki sam jak widok glownego przepisu w panelu Wszystkie przepisy

26. Jak dokładnie "timeline" oraz poziomy układ trzech posiłków w "Widoku Dnia" mają adaptować się do widoku mobilnego?

    Rekomendacja: Na mobile, trzy karty posiłków powinny ułożyć się wertykalnie (jedna pod drugą). "Timeline" powinien stać się horyzontalnie przewijalny wewnątrz swojego kontenera, aby zachować funkcjonalność bez zajmowania nadmiernej przestrzeni pionowej.

- wedlug rekomendacji

27. Jeśli użytkownik wymieni posiłek dla przyszłego dnia (np. jutra), co wyzwoli zmianę na liście zakupów, to czy interfejs powinien aktywnie go o tym poinformować?

    Rekomendacja: Tak, po wymianie posiłku na przyszły dzień, powinien pojawić się krótki, nieinwazyjny komunikat "toast" z informacją: "Twój plan został zmieniony, a lista zakupów zaktualizowana."

- wedlug rekomendacji

28. Czy formularz "Zgłoś problem" powinien otwierać się jako nowa, dedykowana strona, czy jako okno modalne nad aktualnie wyświetlanym widokiem?

    Rekomendacja: Zaleca się użycie okna modalnego. Pozwoli to użytkownikowi na szybkie zgłoszenie problemu bez utraty kontekstu i opuszczania widoku, na którym się obecnie znajduje.

- wedlug rekomendacji

<pytania>

31. Jaka jest konkretna strategia odświeżania danych w tle, aby zapewnić spójność między widokami? Na przykład, jeśli użytkownik wymieni posiłek na jutro, jak widok "Listy Zakupów" dowie się, że jego dane są nieaktualne?

    Rekomendacja: Należy wdrożyć strategię unieważniania zapytań (query invalidation) przy użyciu `TanStack Query`. Po każdej akcji, która modyfikuje przyszły plan (np. `POST /planned-meals/{id}/replace`), aplikacja powinna jawnie unieważnić zapytanie powiązane z listą zakupów (`queryClient.invalidateQueries(['shopping-list'])`). Spowoduje to automatyczne odświeżenie danych w tle przy następnej wizycie użytkownika na stronie "Lista Zakupów".

- wedlug rekomendacji

33. Jakie konkretnie ekrany (widoki) są potrzebne do zrealizowania pełnego przepływu resetowania hasła (US-004)?

    Rekomendacja: Niezbędne są trzy oddzielne widoki: 1. Widok "Zresetuj hasło", zawierający pole na adres e-mail i przycisk "Wyślij link". 2. Widok "Sprawdź skrzynkę", informujący użytkownika o wysłaniu e-maila. 3. Widok "Ustaw nowe hasło", dostępny po kliknięciu w link z e-maila, zawierający dwa pola na nowe hasło i jego potwierdzenie.

- wedlug rekomendacji

<pytania>
34. Gdzie w głównej nawigacji powinna znajdować się nowo dodana pozycja "Widok Tygodnia"? Czy ma być to osobny link na równi z "Panelem Dziennym" i "Listą Zakupów"?

    Rekomendacja: Tak, należy dodać w głównej nawigacji nowy link "Widok Tygodnia". Dla zachowania porządku, sugeruje się następującą kolejność linków: "Panel Dzienny", "Widok Tygodnia", "Lista Zakupów", "Wszystkie Przepisy", "Ustawienia".

- wedlug rekomendacji

35. Jakie interakcje mają być dostępne w nowym "Widoku Tygodnia"? Czy użytkownik może klikać na posiłki w tabeli, aby zobaczyć ich szczegóły lub je wymienić?

    Rekomendacja: Każdy posiłek w tabeli "Widoku Tygodnia" powinien być klikalny i otwierać okno modalne ze szczegółami przepisu (identyczne jak w "Widoku Dnia"). Obok każdego posiłku z przyszłych dni powinien znajdować się również przycisk "Wymień", który pozwoli na jego zamianę, wywołując akcję `POST /planned-meals/{id}/replace`.

- wedlug rekomendacji

36. Jak ma zachowywać się przewijany kalendarz w "Widoku Dnia", gdy użytkownik kliknie na "wyszarzony" dzień wczorajszy?

    Rekomendacja: Zgodnie z założeniami MVP (brak danych historycznych), kliknięcie na dzień wczorajszy nie powinno wywoływać żadnej akcji. Element ten powinien być wizualnie "wyłączony" (disabled) i służyć jedynie jako punkt odniesienia w kalendarzu.

- wedlug rekomendacji

37. Jaki jest cel "wyszarzonego" ósmego dnia w kalendarzu w "Widoku Dnia" i jak ma on reagować na kliknięcie?

    Rekomendacja: Ten element również powinien być nieaktywny (disabled). Jego celem jest wizualne zasygnalizowanie użytkownikowi końca aktualnie wygenerowanego 7-dniowego planu i pokazanie, gdzie w przyszłości pojawi się kolejny dzień.

- wedlug rekomendacji

38. Jak tabelaryczny "Widok Tygodnia" powinien adaptować się do mniejszych ekranów (responsywność)? Klasyczna tabela z 7 kolumnami będzie nieczytelna na urządzeniach mobilnych.

    Rekomendacja: Na urządzeniach mobilnych "Widok Tygodnia" powinien zmienić swój układ z tabeli na listę. Każdy element listy reprezentowałby jeden dzień (np. "Poniedziałek, 28.10"), a pod nim znajdowałyby się wertykalnie ułożone trzy posiłki zaplanowane na ten dzień.

- wedlug rekomendacji

<pytania>
39. Jaki jest początkowy widok aplikacji dla użytkownika niezalogowanego? Czy powinna to być prosta strona logowania, czy może strona docelowa (landing page) z informacjami o produkcie i przyciskami "Zaloguj" oraz "Zarejestruj"?

    Rekomendacja: Dla MVP wystarczy prosta, skoncentrowana strona, która zawiera zarówno formularz logowania, jak i wyraźny link lub przycisk prowadzący do formularza rejestracji. Opcje logowania przez Google (OAuth) powinny być widoczne w obu kontekstach.

- zaczyna od ekranu Wszystkie przepisy - wejscie na inny panel skutkuje ekranem logowania/rejestracji

40. Czy interfejs użytkownika powinien zapewniać walidację formularzy w czasie rzeczywistym (np. podczas wpisywania), czy dopiero po próbie ich przesłania? Dotyczy to rejestracji, logowania, onboardingu i ustawień.

    Rekomendacja: Zaleca się walidację "on blur" (po opuszczeniu pola) oraz "on submit" (przy próbie wysłania). Takie podejście nie jest natarczywe dla użytkownika podczas wpisywania danych, ale zapewnia natychmiastową informację zwrotną po przejściu do kolejnego pola lub próbie zapisu, co jest standardem wspieranym przez `React Hook Form` i `Zod`.

- wedlug rekomendacji

41. Jakie konkretne wymagania bezpieczeństwa (poza długością) ma spełniać hasło podczas rejestracji i jak UI powinno to komunikować użytkownikowi?

    Rekomendacja: Należy zaimplementować i jasno komunikować podstawowe wymogi: minimum 8 znaków, co najmniej jedna wielka litera, jedna mała litera i jedna cyfra. Pod polem hasła powinna znajdować się dynamicznie aktualizowana lista kontrolna (checklist), która na bieżąco pokazuje, które z kryteriów zostały spełnione.

- wedlug rekomendacji

42. Co dokładnie dzieje się w interfejsie po kliknięciu "Wyloguj"? Czy jest jakiś stan przejściowy, czy użytkownik jest natychmiast przekierowywany na stronę logowania?

    Rekomendacja: Po kliknięciu "Wyloguj", należy wyczyścić lokalny stan aplikacji (np. dane użytkownika w `Zustand`, cache z `TanStack Query`) i natychmiast, bez stanu przejściowego, przekierować użytkownika na stronę logowania.

- wedlug rekomendacji ale przekierowuje na ekran Wszystkie przepisy

43. Jak interfejs aplikacji powinien zareagować, gdy token autoryzacyjny (JWT) użytkownika wygaśnie podczas aktywnej sesji?

    Rekomendacja: Aplikacja powinna globalnie przechwytywać błędy autoryzacji (HTTP 401). Po otrzymaniu takiego błędu, należy automatycznie wylogować użytkownika, wyczyścić stan i przekierować go na stronę logowania z komunikatem informacyjnym (np. "Twoja sesja wygasła. Zaloguj się ponownie.").

- wedlug rekomendacji

<pytania>
44. Jaki układ i jakie opcje (linki) powinna zawierać główna nawigacja dla niezalogowanego użytkownika, który widzi publiczną stronę "Wszystkie Przepisy"?

    Rekomendacja: Dla użytkownika niezalogowanego, główna nawigacja powinna być uproszczona i zawierać logo aplikacji, aktywny link "Wszystkie Przepisy" oraz, po prawej stronie, dwa wyraźne przyciski: "Zaloguj się" i "Zarejestruj się".

- niech widzi wszystko ale przejsci na inny ekran/panel skutkuje pojawianiem sie modala z rejestracja

45. Po pomyślnym zalogowaniu (lub rejestracji), dokąd powinien zostać przekierowany użytkownik, który próbował uzyskać dostęp do chronionej podstrony (np. "Panel Dzienny"), zanim został przeniesiony na ekran logowania?

    Rekomendacja: System powinien zapamiętać pierwotnie żądany URL (np. `/panel-dzienny`). Po udanym uwierzytelnieniu, użytkownik powinien zostać automatycznie przekierowany z powrotem na ten zapamiętany URL, a nie na domyślną stronę główną.

- po pomyslnym zalogowaniu/rejestracji ma przejsc przez onboarding a nastepnie na strone z ktorej przychodzil jak w rekomendacji

46. Czy widok "Wszystkie Przepisy" dla użytkownika niezalogowanego ma być w pełni funkcjonalny, włączając w to możliwość kliknięcia na przepis i zobaczenia jego szczegółów (wywołanie `GET /recipes/{id}`), czy ma mieć jakieś ograniczenia?

    Rekomendacja: Aby zachęcić do rejestracji, proponuje się wprowadzenie ograniczenia: użytkownik niezalogowany może przeglądać listę przepisów, ale po kliknięciu na dowolny z nich, zamiast szczegółów przepisu, powinno pojawić się okno modalne z komunikatem "Aby zobaczyć szczegóły przepisu, zaloguj się lub załóż darmowe konto" i przyciskami prowadzącymi do logowania/rejestracji.

- wedlug rekomendacji

47. Jak płynnie powinien przebiegać proces przejścia z widoku publicznego do prywatnego po zalogowaniu? Czy następuje pełne przeładowanie strony, czy tylko dynamiczna zmiana komponentów nawigacji i treści?

    Rekomendacja: Przejście powinno być jak najbardziej płynne, bez pełnego przeładowania strony. Po pomyślnym zalogowaniu (np. w oknie modalnym), komponenty na stronie (np. nawigacja) powinny dynamicznie się zaktualizować, odzwierciedlając nowy, zalogowany stan użytkownika.

- wedlug rekomendacji

48. Proszę o podsumowanie i zakończenie.
