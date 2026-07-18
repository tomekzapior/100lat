# Supabase guide - bdayapp

Docelowa warstwa danych działa w Supabase. Portfolio uruchamia się domyślnie bez bazy, kont i sekretów.

## Tryby danych

- Wydanie MVP używa wyłącznie frontendowej warstwy demo z danymi syntetycznymi. Aplikacja nie odczytuje jeszcze zmiennych `VITE_*` z tego przewodnika.
- `VITE_DATA_MODE` oraz `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY` opisują docelowy kontrakt przyszłego adaptera produkcyjnego.
- Po dodaniu adaptera błąd połączenia nie może po cichu przełączyć aplikacji na demo.
- UI korzysta ze wspólnego interfejsu domenowego, nie z klienta Supabase bezpośrednio.

Klucz publikowalny lub `anon` jest dostępny w przeglądarce. Bezpieczeństwo opiera się na RLS i grantach.

## Migracja i model

`supabase/migrations/202607180001_initial_schema.sql` tworzy enumy, tabele, indeksy, widoki, funkcje, RLS i bucket. Nie zawiera seedów ani prawdziwych danych.

### `profiles`

Profil rozszerza `auth.users`. `employee_id` łączy konto z pracownikiem, `display_name` podpisuje życzenie, a `role` ma wartość `member` lub `admin`. Trigger tworzy profil jako `member` i nie ufa roli w metadanych klienta. Użytkownik zmienia sam tylko `display_name`.

### `employees`

Prywatna tabela zawiera pełną datę urodzenia i opcjonalny e-mail. `anon` nie ma do niej dostępu. Dezaktywacja przez `is_active=false` usuwa osobę z katalogu bez kasowania historii. Użytkownik czyta własny rekord, administrator wszystkie. Zmiany administracyjne wykonuje backend. `avatar_path` ma format `<employee_id>/<nazwa-pliku>`.

### `wishes`

- `author_id` pochodzi z `auth.uid()` i nie jest ustawiany przez klienta.
- Życzenie doda tylko konto połączone z aktywnym pracownikiem, dla innej aktywnej osoby i maksymalnie 366 dni naprzód.
- Autor widzi własne rekordy. Przed terminem może poprawić tylko treść albo usunąć życzenie.
- Klient nie zmienia `status` ani `delivered_at`.
- Odbiorca widzi treść dopiero po doręczeniu przez `received_wishes`. Widok ukrywa UUID autora.
- Zwykłe zapytanie administratora nie odsłania prywatnej treści. Funkcja doręczająca używa roli serwisowej tylko w koniecznym zakresie.

Statusy: `scheduled`, `delivered`, `cancelled` i `failed`.

### `reminder_runs`

Serwerowy dziennik zadań `birthday_digest` i `wish_delivery` przechowuje status, liczniki, czasy i unikalny `idempotency_key`. Nie ma polityk dla `anon` ani `authenticated`. `error_summary` nie może zawierać życzeń, e-maili, tokenów ani sekretów dostawcy.

## Bezpieczne widoki

`employee_directory` pokazuje tylko aktywne osoby oraz: UUID, imię, nazwisko, nazwę preferowaną, stanowisko, dział, dzień i miesiąc urodzin oraz ścieżkę awatara. Nie ujawnia pełnej daty, roku, e-maila, roli ani identyfikatora konta. Jest celowo wykonywany z prawami właściciela, bo tabela źródłowa pozostaje zamknięta dla `anon`. Każda nowa kolumna wymaga przeglądu prywatności.

`received_wishes` działa po zalogowaniu i zwraca bieżącemu odbiorcy tylko doręczone życzenia, nazwę nadawcy, treść i czas doręczenia.

## Auth bez PIN-ów

Produkcja korzysta z Supabase Auth, na przykład linku e-mail lub firmowego OAuth. Administrator powinien używać MFA przy prawdziwych danych.

Czterocyfrowy PIN nie jest mechanizmem logowania produkcyjnego. Nie zapisujemy PIN-ów w bazie, metadanych ani `localStorage`. Ekran ze wzorca może być wyłącznie nieinteraktywnym elementem demo bez dostępu do danych.

## RLS i granty

Każda tabela w `public` ma RLS. Brak polityki oznacza brak dostępu.

| Zasób | `anon` | `authenticated` | `service_role` |
| --- | --- | --- | --- |
| `employee_directory` | bezpieczny odczyt | bezpieczny odczyt | odczyt |
| `employees` | brak | własny rekord, admin wszystkie | pełny dostęp |
| `profiles` | brak | własny profil, admin wszystkie | pełny dostęp |
| `wishes` | brak | autor: własne rekordy | doręczenie i status |
| `received_wishes` | brak | odbiorca: doręczone | niepotrzebny |
| `reminder_runs` | brak | brak | odczyt i zapis |

RLS kontroluje wiersze, nie kolumny. Migracja nadaje granty kolumnowe:

- `profiles`: update tylko `display_name`,
- `employees`: update tylko `preferred_name` i `avatar_path`,
- `wishes`: insert odbiorcy, treści i terminu; update tylko treści,
- `role`, `employee_id`, `author_id`, `status`, `delivered_at` i liczniki nie są zapisywalne z klienta.

Nie dodajemy ogólnego `grant update` do tabel z kolumnami nadającymi uprawnienia.

## Backend i przypomnienia

Tworzenie pracownika, łączenie konta, zmiana roli, dezaktywacja i wysyłka działają w Edge Functions lub równoważnym backendzie. Funkcja weryfikuje sesję lub sekret harmonogramu, ponownie sprawdza rolę, waliduje wejście, używa `service_role` wyłącznie po stronie serwera, rezerwuje klucz idempotencji i nie zwraca sekretów. `status='delivered'` oraz `delivered_at` ustawia dopiero po potwierdzeniu wysyłki.

## Storage

Publiczny bucket `employee-avatars` ma limit 2 MB i przyjmuje JPEG, PNG oraz WebP. Pracownik zapisuje tylko we własnym folderze `<employee_id>/`, administrator może zarządzać wszystkimi. Nazwa pliku nie zawiera danych osobowych. Jeśli katalog stanie się prywatny, bucket także musi być prywatny, z krótkotrwałymi podpisanymi URL-ami.

## Zmienne środowiskowe

Wzór zawiera `.env.example`. Do bundla mogą trafić tylko zmienne `VITE_*` z konfiguracją publiczną. `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` i `REMINDER_CRON_SECRET` są sekretami serwerowymi, nigdy nie dostają prefiksu `VITE_` i nie są commitowane.

## Testy bezpieczeństwa

Testujemy jako `anon`, użytkownik A, użytkownik B, administrator i proces serwerowy:

1. `anon` widzi katalog, ale nie tabele bazowe ani `reminder_runs`.
2. Katalog nie zawiera roku, pełnej daty, e-maila, roli ani ID konta.
3. A widzi swój rekord, ale nie pełny rekord B.
4. A nie zmieni roli, powiązania, daty urodzenia, aktywności, autora ani statusu.
5. A nie odczyta życzeń B ani życzeń do B przed doręczeniem.
6. Odbiorca widzi tylko własne doręczone życzenia.
7. Konto bez pracownika nie doda życzenia.
8. Nie można wysłać życzenia do siebie, nieaktywnej osoby ani dalej niż 366 dni.
9. Powtórzony `idempotency_key` powoduje konflikt zamiast drugiej wysyłki.
10. Pracownik zapisuje awatar tylko we własnym folderze i w limitach bucketa.
11. Sekrety nie występują w bundlu, logach klienta ani odpowiedzi API.

Przed produkcją ograniczamy rejestrację, włączamy silne uwierzytelnianie administratora, uruchamiamy negatywne testy RLS i ustalamy retencję oraz usuwanie danych.
