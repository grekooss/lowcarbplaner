<conversation_summary>
<decisions>

1.  **Nawigacja główna**: Zostanie zastosowany stały, pionowy pasek nawigacyjny po lewej stronie (desktop) oraz ukryte menu hamburgerowe (mobile). Kolejność linków to: "Panel Dzienny", "Widok Tygodnia", "Lista Zakupów", "Wszystkie przepisy", "Profil". Dla użytkowników niezalogowanych nawigacja jest widoczna, ale próba dostępu do sekcji chronionych (innych niż "Wszystkie przepisy") wywoła modal logowania/rejestracji.
2.  **Onboarding**: Będzie to proces wieloetapowy. Stan formularza będzie zarządzany przez Zustand. Dane numeryczne (waga, wzrost) będą wprowadzane za pomocą suwaków (`Slider`) z opcją bezpośredniego wpisania wartości. Niedokończony onboarding wymaga rozpoczęcia go od nowa przy następnej próbie dostępu do panelu dziennego, jednak użytkownik może go ukończyć, edytując dane w Ustawieniach.
3.  **Panel Dzienny**: Będzie zawierał przewijany kalendarz na 7 dni (+ wczoraj i +1 dzień w przyszłości, oba nieaktywne). Poniżej znajdą się 4 paski postępu makroskładników, a pod nimi 3 karty posiłków w układzie poziomym. Dodatkowy element to horyzontalny "timeline" dnia, na którym użytkownik będzie "odhaczał" zjedzone posiłki, co będzie główną metodą interakcji.
4.  **Widok Tygodnia**: Będzie to osobna pozycja w nawigacji. Na desktopie będzie to widok tabelaryczny, a na mobile lista dni, które rozwijają się, pokazując posiłki. Umożliwi on podgląd szczegółów przepisu (w modalu) oraz wymianę dań.
5.  **Lista Zakupów**: Będzie dynamicznie aktualizowana po każdej zmianie w planie na przyszłe dni. Nie będzie uwzględniać bieżącego dnia. Stan zaznaczenia produktów będzie przechowywany w Zustand, aby przetrwał nawigację w ramach jednej sesji. Produkty będą pogrupowane według kategorii.
6.  **Wszystkie przepisy**: Będzie to strona startowa dla użytkowników niezalogowanych. Na górze wyświetlany będzie losowy przepis (losowany raz na sesję), a poniżej lista przepisów z filtrami (śniadanie, obiad, kolacja) i paginacją typu "Załaduj więcej". Niezalogowani użytkownicy zobaczą modal z prośbą o rejestrację po kliknięciu na przepis. Zalogowani zobaczą szczegóły.
7.  **Zarządzanie stanem i API**: Stan serwera będzie zarządzany przez `TanStack Query`, z wykorzystaniem unieważniania zapytań (`queryClient.invalidateQueries`) do odświeżania danych po mutacjach. Dla kluczowych akcji (oznaczanie posiłków, zmiana gramatury) zostanie zastosowane podejście "optimistic UI". Zmiany gramatury będą wysyłane do API z opóźnieniem (`debouncing`).
8.  **Obsługa błędów i stanów ładowania**: Zostaną zaimplementowane szkielety interfejsu (skeleton UI) dla kluczowych widoków. Globalny system obsługi błędów będzie wyświetlał zrozumiałe komunikaty "Toast". Długotrwałe operacje (np. generowanie planu) będą komunikowane przez nieblokujące powiadomienia lub szkielety UI na odpowiednich widokach.
9.  **Dostęp Offline**: W ramach MVP zrezygnowano z PWA. Zamiast tego, 7-dniowy plan posiłków będzie zapisywany w `localStorage`, a interfejs poinformuje użytkownika (za pomocą bannera), gdy przegląda dane w trybie offline.
10. **Uwierzytelnianie i przepływy**: Widok logowania i rejestracji będzie zrealizowany jako jeden ekran z zakładkami. Aplikacja zapamięta docelowy URL, na który użytkownik próbował wejść przed logowaniem. Po wygaśnięciu tokenu JWT użytkownik zostanie automatycznie wylogowany i przekierowany na stronę "Wszystkie przepisy".
11. **Responsywność**: Aplikacja będzie w pełni responsywna. Kluczowe widoki, takie jak "Panel Dzienny" i "Widok Tygodnia", będą miały dedykowane układy mobilne (np. zmiana tabeli na listę, elementy wertykalnie zamiast horyzontalnie).
12. **Interakcje i UX**: Wymiana posiłku, szczegóły przepisu (z poziomu "Panelu Dziennego") oraz formularz "Zgłoś problem" będą otwierane w oknach modalnych. Destrukcyjne akcje (reset planu) będą wymagały dwuetapowego potwierdzenia. Zaznaczenie posiłku jako zjedzonego spowoduje dodanie zielonego obramowania do karty.
    </decisions>
    <matched_recommendations>
13. **Zarządzanie stanem**: Zastosowanie biblioteki `Zustand` do zarządzania globalnym stanem UI (formularz onboardingu, stan zaznaczeń na liście zakupów) oraz `TanStack Query` do zarządzania stanem serwera (pobieranie, cachowanie, mutacje i unieważnianie danych).
14. **Optymistyczne UI**: Wdrożenie mechanizmu "optimistic updates" dla często wykonywanych akcji (np. oznaczanie posiłków jako zjedzone, modyfikacja gramatury), co zapewnia natychmiastową odpowiedź interfejsu.
15. **Obsługa stanów ładowania**: Implementacja komponentów szkieletowych (skeleton loaders) dla kluczowych widoków ("Panel Dzienny", "Lista Zakupów") w celu poprawy postrzeganej wydajności podczas oczekiwania na dane z API.
16. **Strategia obsługi błędów**: Stworzenie globalnego systemu obsługi błędów, który tłumaczy błędy API na zrozumiałe dla użytkownika komunikaty wyświetlane za pomocą komponentu "Toast", unikając technicznego żargonu.
17. **Spójność UI**: Wykorzystanie komponentów z biblioteki `shadcn/ui` (Modal, Alert, Slider, etc.) do budowy spójnego i dostępnego interfejsu, w tym formularzy, okien dialogowych i powiadomień.
18. **Responsywność**: Projektowanie widoków z myślą o adaptacji do różnych rozmiarów ekranu, ze szczególnym uwzględnieniem zmiany układów tabelarycznych i horyzontalnych na wertykalne listy na urządzeniach mobilnych.
19. **Wydajność interakcji**: Zastosowanie techniki "debouncing" przy obsłudze częstych żądań do API (np. przy zmianie gramatury), aby zminimalizować obciążenie serwera i zapewnić płynność działania interfejsu.
20. **Przepływy użytkownika**: Wykorzystanie okien modalnych do zadań kontekstowych (wymiana posiłku, szczegóły przepisu, zgłaszanie problemu), aby utrzymać użytkownika w bieżącym widoku i nie przerywać jego ścieżki.
    </matched_recommendations>
    <ui_architecture_planning_summary>

### a. Główne wymagania dotyczące architektury UI

Architektura UI opiera się na podejściu "desktop-first", ale z pełną responsywnością. Główną nawigację stanowi stały, pionowy pasek po lewej stronie na desktopie, który na urządzeniach mobilnych przechodzi w ukryte menu typu "hamburger". Aplikacja rozróżnia stan zalogowany i niezalogowany, oferując publiczny dostęp do widoku "Wszystkie Przepisy" i wymagając uwierzytelnienia do pozostałych, spersonalizowanych sekcji.

### b. Kluczowe widoki, ekrany i przepływy użytkownika

- **Publiczny dostęp**: Niezalogowany użytkownik ląduje na stronie "Wszystkie Przepisy". Może przeglądać listę i używać filtrów. Próba zobaczenia szczegółów przepisu lub nawigacji do innej sekcji wywołuje modal logowania/rejestracji.
- **Uwierzytelnianie**: Obejmuje jeden ekran z zakładkami "Logowanie" i "Rejestracja", obsługę OAuth (Google) oraz trzystopniowy przepływ resetowania hasła.
- **Onboarding**: Obowiązkowy, wieloetapowy proces po pierwszej rejestracji, prowadzący do wygenerowania planu. Przerwanie go wymaga rozpoczęcia od nowa przy próbie dostępu do `Panelu Dziennego`.
- **Panel Dzienny**: Centralny widok aplikacji. Zawiera przewijany kalendarz, podsumowanie makro w formie pasków postępu, poziomy układ kart posiłków oraz innowacyjny "timeline" do oznaczania posiłków jako zjedzonych.
- **Widok Tygodnia**: Widok tabelaryczny (desktop) lub lista (mobile) prezentujący plan na cały tydzień, z opcją podglądu i wymiany posiłków.
- **Lista Zakupów**: Automatycznie generowana i aktualizowana lista składników na 6 przyszłych dni, pogrupowana według kategorii.
- **Profil i Ustawienia**: Sekcja, gdzie użytkownik może aktualizować swoje dane (co powoduje regenerację planu), zarządzać kontem (zmiana hasła, reset planu) oraz zgłaszać problemy.

### c. Strategia integracji z API i zarządzania stanem

Aplikacja wykorzystuje hybrydowe podejście do zarządzania stanem:

- **TanStack Query** jest fundamentem komunikacji z API. Obsługuje pobieranie danych (`useQuery`), ich cachowanie, mutacje (`useMutation`) oraz automatyczne odświeżanie poprzez unieważnianie zapytań (`queryClient.invalidateQueries`) po kluczowych akcjach (np. wymiana posiłku unieważnia listę zakupów).
- **Zustand** służy do zarządzania efemerycznym, globalnym stanem UI, który nie jest synchronizowany z serwerem, takim jak dane z wieloetapowego formularza onboardingu czy stan zaznaczenia na liście zakupów.
- **Optimistic UI** i **Debouncing** są stosowane w celu poprawy responsywności interfejsu i optymalizacji liczby wywołań API.
- **localStorage** pełni rolę mechanizmu zapasowego dla dostępu offline do planu posiłków.

### d. Kwestie dotyczące responsywności, dostępności i bezpieczeństwa

- **Responsywność**: Wszystkie kluczowe widoki, w tym złożone układy jak "Widok Dnia" i "Widok Tygodnia", posiadają zdefiniowane zachowanie na urządzeniach mobilnych, najczęściej przechodząc na układ wertykalny.
- **Dostępność (Accessibility)**: Podstawowa dostępność jest zapewniona przez wykorzystanie semantycznych komponentów z biblioteki `shadcn/ui` (opartej na Radix UI), która dba o obsługę klawiatury i atrybuty ARIA. Należy dodatkowo zadbać o etykietowanie przycisków-ikon.
- **Bezpieczeństwo**: Interfejs będzie wspierał politykę silnych haseł (z walidacją i listą kontrolną w czasie rzeczywistym). Obsługa wygaśnięcia tokenu JWT jest zdefiniowana – aplikacja automatycznie wyloguje użytkownika i przekieruje go na stronę logowania.

### e. Wszelkie nierozwiązane kwestie lub obszary wymagające dalszego wyjaśnienia

W toku dyskusji wszystkie kluczowe kwestie architektoniczne dla MVP zostały rozwiązane i uzgodnione. Nie zidentyfikowano żadnych istotnych, nierozwiązanych problemów, które blokowałyby rozpoczęcie prac deweloperskich.
</ui_architecture_planning_summary>
<unresolved_issues>
Brak zidentyfikowanych nierozwiązanych kwestii na tym etapie planowania architektury UI dla MVP.
</unresolved_issues>
</conversation_summary>
