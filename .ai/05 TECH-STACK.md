## Stack Technologiczny: Aplikacja Webowa "LowCarbPlaner"

Poniższy dokument przedstawia architekturę i zestaw technologii wybranych do budowy aplikacji webowej "LowCarbPlaner". Stack został zoptymalizowany pod kątem szybkości rozwoju (Time-to-Market), wydajności dla użytkownika końcowego, skalowalności oraz spójności z ekosystemem technologicznym całej platformy (w tym przyszłej aplikacji mobilnej).

#### Podsumowanie Architektury

| Kategoria                      | Technologia / Narzędzie                         | Kluczowa Rola                                                                         |
| :----------------------------- | :---------------------------------------------- | :------------------------------------------------------------------------------------ |
| **Framework Full-stack**       | **Next.js 15+ (App Router)**                    | Fundament aplikacji, obsługa renderowania, routingu i logiki serwerowej.              |
| **Backend & Baza Danych**      | **Supabase (BaaS)**                             | Centralny system do zarządzania danymi, autentykacją i logiką biznesową.              |
| **Interfejs Użytkownika (UI)** | **Tailwind CSS + shadcn/ui**                    | Szybkie i spójne budowanie nowoczesnego i dostępnego interfejsu.                      |
| **Zarządzanie Danymi**         | **TanStack Query (React Query)**                | Efektywna synchronizacja i cachowanie danych z serwera.                               |
| **Zarządzanie Stanem**         | **Zustand**                                     | Minimalistyczne zarządzanie globalnym stanem po stronie klienta.                      |
| **Formularze i Walidacja**     | **React Hook Form + Zod**                       | Wydajna i bezpieczna obsługa formularzy oraz walidacja danych.                        |
| **Testowanie**                 | **Vitest + React Testing Library + Playwright** | Kompleksowe testowanie jednostkowe, integracyjne i end-to-end.                        |
| **Hosting i Infrastruktura**   | **Cloudflare Pages**                            | Automatyczne wdrażanie, globalna CDN, skalowanie i niezawodne środowisko produkcyjne. |
| **Automatyzacja (CI/CD)**      | **GitHub Actions**                              | Zautomatyzowany proces testowania i wdrażania aplikacji.                              |

---

### Szczegółowy Opis Komponentów

#### 1. Framework Aplikacji: Next.js

Next.js jest naszym głównym frameworkiem do budowy interfejsu i obsługi logiki po stronie serwera.

- **Architektura:** Wykorzystujemy **App Router**, który domyślnie opiera się na **React Server Components (RSC)**. Pozwala to na renderowanie większości interfejsu na serwerze, co minimalizuje ilość kodu JavaScript wysyłanego do klienta, zapewniając błyskawiczne czasy ładowania.
- **Logika Backendowa:** **Server Actions** posłużą do bezpiecznego wykonywania mutacji danych (np. tworzenie spotkania, wysyłanie prośby o dołączenie) bezpośrednio z komponentów, bez potrzeby tworzenia oddzielnych endpointów API. To znacząco upraszcza architekturę.
- **Język:** Całość projektu będzie pisana w **TypeScript**, co gwarantuje bezpieczeństwo typów i ułatwia utrzymanie kodu.

#### 2. Backend i Baza Danych: Supabase

Supabase stanowi nasz wspólny, scentralizowany backend dla wszystkich klientów (web i mobile).

- **Baza Danych:** W pełni zarządzana instancja **PostgreSQL**.
- **Autentykacja:** Gotowy system do zarządzania użytkownikami, obsługujący logowanie przez e-mail/hasło oraz dostawców OAuth (np. Google). Zapewnia spójny system tożsamości na wszystkich platformach.
- **Bezpieczeństwo:** Dostęp do danych będzie chroniony na poziomie bazy danych za pomocą **Row Level Security (RLS)**, co gwarantuje, że użytkownicy mają dostęp tylko do autoryzowanych zasobów.
- **Funkcje Serwerowe (Edge Functions):** Współdzielona logika biznesowa (np. system powiadomień) będzie zaimplementowana jako funkcje w Deno/TypeScript, wywoływane przez naszą aplikację Next.js.

#### 3. Interfejs Użytkownika (UI)

- **Styling:** **Tailwind CSS** posłuży jako silnik do stylowania. Podejście "utility-first" pozwala na błyskawiczne budowanie spójnych i responsywnych interfejsów.
- **Komponenty:** **shadcn/ui** zostanie użyte jako zbiór gotowych, w pełni dostępnych i łatwo modyfikowalnych komponentów (przyciski, formularze, modale, kalendarze), co drastycznie przyspieszy prace frontendowe.

#### 4. Zarządzanie Stanem i Danymi

- **Dane Serwerowe:** **TanStack Query (React Query)** będzie zarządzać całym cyklem życia danych pochodzących z Supabase. Odpowiada za ich pobieranie, buforowanie, synchronizację w tle i unieważnianie, co zapewnia płynne i optymistyczne działanie interfejsu.
- **Stan Globalny (Klient):** Do zarządzania prostym, globalnym stanem po stronie klienta (np. dane zalogowanego użytkownika, stan otwarcia menu mobilnego) użyjemy **Zustand**. Jest to minimalistyczne i wydajne rozwiązanie, które nie wprowadza zbędnej złożoności.

#### 5. Formularze i Walidacja

- **Zarządzanie Formularzami:** **React Hook Form** to nasz wybór do budowy wszystkich formularzy w aplikacji. Zapewnia wysoką wydajność (minimalizuje re-rendery) i doskonałą integrację z Reactem.
- **Walidacja:** **Zod** posłuży do definiowania schematów walidacji danych, zarówno w formularzach, jak i przy komunikacji z backendem. Jego integracja z TypeScriptem gwarantuje pełne bezpieczeństwo typów w całym przepływie danych.

#### 6. Testowanie

Aplikacja będzie objęta kompleksową strategią testowania na trzech poziomach:

- **Testy Jednostkowe:** **Vitest** posłuży jako szybki i nowoczesny framework do testowania jednostkowego. Jego natywna integracja z Vite zapewnia błyskawiczne wykonanie testów i doskonałe wsparcie dla TypeScript.
- **Testy Komponentów:** **React Testing Library** będzie używana do testowania komponentów React w sposób zbliżony do rzeczywistego użycia. Skupia się na testowaniu zachowania komponentów z perspektywy użytkownika, a nie implementacji.
- **Testy End-to-End (E2E):** **Playwright** posłuży do automatyzacji testów pełnych scenariuszy użytkownika w rzeczywistej przeglądarce. Playwright oferuje:
  - Wsparcie dla wszystkich głównych przeglądarek (Chrome, Firefox, Safari, Edge).
  - Niezawodne czekanie na elementy i automatyczną obsługę dynamicznych treści.
  - Możliwość testowania na różnych rozmiarach ekranu (desktop, tablet, mobile).
  - Nagrywanie testów i generowanie screenshotów przy błędach.
  - Doskonałą integrację z CI/CD pipeline.

#### 7. Infrastruktura, Hosting i CI/CD

- **Kontrola Wersji:** Kod źródłowy będzie przechowywany na platformie **GitHub**.
- **Hosting:** Aplikacja Next.js będzie hostowana na platformie **Cloudflare Pages**. Cloudflare zapewnia automatyczne wdrażanie bezpośrednio z repozytorium GitHub, globalną sieć CDN dla błyskawicznych czasów ładowania na całym świecie, automatyczne skalowanie oraz wbudowane zabezpieczenia DDoS i SSL. To eliminuje potrzebę zarządzania serwerami i kontenerami, znacząco upraszczając infrastrukturę.
- **Automatyzacja (CI/CD):** Integracja **Cloudflare Pages z GitHub** automatycznie uruchamia proces CI/CD przy każdym pushu do repozytorium:
  1.  Uruchamia testy jednostkowe i komponentów (**Vitest** i **React Testing Library**).
  2.  Uruchamia testy E2E (**Playwright**) na kluczowych scenariuszach użytkownika.
  3.  Sprawdza jakość kodu (**ESLint**, **Prettier**).
  4.  Buduje aplikację Next.js w trybie produkcyjnym.
  5.  Wdraża nową wersję na globalną sieć Cloudflare z podglądem dla pull requestów.
