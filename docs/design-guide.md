# Design guide - Sto lat!

## Źródła i kierunek

Folder `docs/design/` nie zawiera brandbooka ani gotowego logo. Kierunek powstał z audytu aplikacji wzorcowej, kontekstu w `.impeccable.md` i briefu `docs/design-brief.md`. Decyzje opisują cel i uzasadnienie, bez eksponowania procesu narzędziowego w publicznej części portfolio.

Metaforą jest cyfrowa kartka urodzinowa wydrukowana metodą sitodruku. Interfejs ma być serdeczny, lekko figlarny i dopracowany. Nie kopiujemy firmowego dark mode, glassmorphismu, złotych gradientów, neonowych poświat ani jednakowej siatki kart.

Rozpoznawalny element produktu to duży stempel daty połączony z warstwami papieru. Stempel pokazuje „dzisiaj” albo liczbę dni do wydarzenia. Może wychodzić poza główną oś kompozycji, ale nie zasłania treści.

## Paleta

Kolory w kodzie zapisujemy jako OKLCH. Wartości HEX służą do dokumentacji i narzędzi, które nie obsługują OKLCH.

| Token | OKLCH | HEX | Rola |
| --- | --- | --- | --- |
| `paper` | `oklch(95.6% 0.018 86.1)` | `#F6F0E3` | tło strony |
| `paper-raised` | `oklch(98.4% 0.017 84.6)` | `#FFF9ED` | formularz, kartka, dialog |
| `paper-deep` | `oklch(90.4% 0.026 82.4)` | `#E8DECC` | drugie tło, separator i disabled |
| `ink` | `oklch(27.6% 0.019 190.6)` | `#1D2B2A` | tekst, główne CTA i mocne obramowania |
| `ink-muted` | `oklch(49.3% 0.016 159.5)` | `#5A645E` | tekst pomocniczy i granice pól |
| `berry` | `oklch(55.3% 0.173 20.5)` | `#C33A45` | marka i celebracja |
| `berry-dark` | `oklch(43.7% 0.141 19.7)` | `#8F2530` | link i akcent tekstowy |
| `sun` | `oklch(85% 0.146 90.5)` | `#F2C94C` | data, powierzchnia hero w dniu urodzin, pigułka terminu do 7 dni i pojedyncze detale celebracyjne |
| `mint` | `oklch(85.5% 0.038 170.7)` | `#B8D8CC` | spokojna powierzchnia sukcesu |
| `success` | `oklch(46.8% 0.078 164.8)` | `#27684F` | tekst i ikona sukcesu |
| `warning` | `oklch(45.7% 0.093 65.5)` | `#7A4B12` | tekst i ikona ostrzeżenia |
| `danger` | `oklch(47.2% 0.146 24.7)` | `#9D2F2F` | błąd i akcja destrukcyjna |

`ink` na `paper` ma kontrast 12.92:1, `ink-muted` na `paper` 5.41:1, `success` na `paper` 5.82:1, `warning` na `paper-raised` 7.04:1, a `danger` na `paper-raised` 6.95:1. Na `mint` i `sun` używamy tekstu `ink`. Żółty nie jest samodzielnym kolorem statusu. Stan zawsze ma ikonę lub etykietę, nie sam kolor.

Semantyka: `action = ink`, `on-action = paper-raised`, `focus-inner = paper-raised`, `focus-outer = ink`, `danger = danger`, `success-surface = mint`, `on-success = ink`, `warning-surface = sun`, `on-warning = ink`. Zasada 60-30-10: papier dominuje, atrament buduje strukturę i prowadzi akcje, berry oraz sun występują rzadko.

## Typografia

Fonty są hostowane lokalnie przez pakiety Fontsource, żeby uniknąć opóźnienia zewnętrznego CSS.

- Display: `Unbounded Variable`, wagi 650 i 800. Nazwa produktu, stempel daty, krótkie nagłówki wydarzeń.
- Tekst: `Commissioner Variable`, wagi 400, 500, 650 i 700. Nawigacja, formularze, opisy i dane.
- Fallback: `system-ui, sans-serif`.

Słowa marki: serdeczna, figlarna, rzemieślnicza. Unbounded przypomina drukowany plakat, a Commissioner zachowuje czytelność w formularzach.

| Rola | Rozmiar | Interlinia | Waga |
| --- | --- | --- | --- |
| display hero | `clamp(2.25rem, 7vw, 5rem)` | 0.95 | 800 |
| h1 widoku | `clamp(2rem, 4vw, 3.25rem)` | 1.05 | 650 |
| h2 | `1.563rem` | 1.2 | 700 |
| h3 | `1.25rem` | 1.3 | 650 |
| body | `1rem` | 1.55 | 400 |
| metadata | `0.875rem` | 1.4 | 500 |
| caption | `0.75rem` | 1.35 | 650 |

Tekst ciągły ma maksymalnie 68 znaków w wierszu. Daty i liczniki używają `font-variant-numeric: tabular-nums`. Unbounded nie służy do długich opisów, admina ani etykiet formularzy. Caption 0.75 rem dotyczy wyłącznie niekrytycznych adnotacji; instrukcje i statusy mają minimum 0.875 rem. Przed publikacją sprawdzamy polskie diakrytyki, długie nazwy na 320 px, 400% zoom, CLS i fallback. `font-synthesis: none`.

## Skala i przestrzeń

Skala 4 px: `space-2xs = 4`, `space-xs = 8`, `space-sm = 12`, `space-md = 16`, `space-lg = 24`, `space-xl = 32`, `space-2xl = 48`, `space-3xl = 64`, `space-4xl = 96`. Aliasy: `cluster-gap = space-sm`, `stack-gap = space-lg`, `section-gap = space-3xl`.

- Powiązane elementy: 8 lub 12 px.
- Pole formularza i opis błędu: 8 px.
- Grupy formularza: 24 px.
- Sekcje widoku: 48 lub 64 px.
- Główny kontener: `min(calc(100% - 2 * padding), clamp(73.75rem, 78vw, 92.5rem))`. Szerokość rośnie płynnie od laptopa do dużego monitora.
- Boczne paddingi: 16 px na telefonie, 24 px na tablecie, 32 px na laptopie, 48 px od 1920 px.

Nie opakowujemy każdej sekcji w kartę. Kartka obejmuje główny moment albo zadanie. Lista osób korzysta z rytmu wierszy i linii, a życzenia wyglądają jak kolejne notatki na jednej powierzchni.

Gramatyka sitodruku ma trzy ograniczenia: maksymalnie dwie warstwy atramentu, jeden kontrolowany błąd rejestracji i jeden obrócony arkusz na widok. Nie dodajemy dekoracyjnego szumu bez funkcji. Na widoku występuje najwyżej jeden dominujący stempel, jedna główna warstwa kartki i jeden przycisk z twardym offsetem.

Główną kartkę zadania może przyklejać krótka taśma w kolorze mint lub sun, obrócona do 3 stopni. Taśma pełni rolę obróconego arkusza widoku, więc występuje najwyżej jedna: na profilu (sun w dniu urodzin, mint poza nim) i na panelu życzeń (sun). Górna krawędź strony ma stały pasek berry o wysokości 5 px, który daje marce obecność na każdym widoku.

## Kształt, obramowanie i głębia

- Mały promień: 6 px dla pól i etykiet.
- Średni promień: 12 px dla paneli.
- Duży promień: 24 px tylko dla głównej kartki lub pełnego panelu.
- Obramowanie podstawowe: 1 px `paper-deep`.
- Obramowanie mocne: 2 px `ink`.
- Przycisk główny: twardy offset 3 px w kolorze `ink`, bez rozmycia.
- Główna kartka: subtelny cień papieru `0 18px 50px color-mix(in oklch, var(--ink) 12%, transparent)`.

Nie używamy kolorowych pasów po lewej ani prawej stronie elementu. Nie używamy gradientowego tekstu. Warstwy papieru mogą mieć delikatny obrót do 1.2 stopnia, ale treść formularza pozostaje pozioma.

## Breakpointy i responsywność

Podejście mobile-first:

- baza: 360-639 px, jedna kolumna;
- `sm` 640 px: więcej miejsca w hero, dwa pola obok siebie tylko gdy nadal są czytelne;
- `md` 768 px: pozioma nawigacja, szersze wiersze zespołu;
- `lg` 1024 px: profil i formularz mogą korzystać z dodatkowej szerokości;
- `wide` 1120 px przy wysokości co najmniej 640 px: Home przechodzi w kompozycję 7/5 mieszczącą hero i listę w pierwszym ekranie; niższy próg wysokości obejmuje laptopy FullHD z paskami przeglądarki;
- od 1120 px niezależnie od wysokości: „O projekcie” używa redakcyjnej rozkładówki, a Admin zwiększa gęstość bez powiększania tekstu;
- `2xl` 1920 px: większy kontener i odstępy, bez powiększania podstawowego tekstu.

Komponentowe zmiany zależą od container queries. Wskaźnik i hover są dodatkiem tylko przy `(hover: hover)`. Touch target ma `min-inline-size` i `min-block-size` 44 px oraz co najmniej 8 px odstępu od innego celu. Pełne panele są scrollowalne i używają `min-height: 100svh` z `100dvh` jako ulepszeniem. Dekoracyjne obroty nie mogą poszerzać obszaru scrolla. Używamy `env(safe-area-inset-*)` dla stałych elementów.

Admin zmienia proporcje zależnie od zadania: pusty workspace daje więcej miejsca
katalogowi, a podczas edycji formularz przejmuje szerszą kolumnę i układa pola
w dwóch kolumnach. Na telefonie stempel staje się pigułką, akcje zajmują dwa
rzędy, wiersze zachowują datę obok osoby, a pusty panel roboczy nie powiela CTA.

## Komponenty i stany

### Przycisk

Primary używa `ink`, tekstu `paper-raised`, obramowania `ink` i twardego offsetu. Secondary ma tło `paper-raised` i obramowanie `ink`. Ghost nie ma powierzchni, ale ma pełny touch target. Priorytet stanów: `disabled > loading > active > hover`. Focus-visible jest niezależną warstwą: 2 px `paper-raised` oraz zewnętrzne 4 px `ink`, bez opóźnienia. Loading zachowuje szerokość, ustawia `aria-busy` i blokuje duplikat. Error i success są stanami przepływu, nie wariantami przycisku.

### Pole

Widoczna etykieta znajduje się nad polem. Placeholder jest przykładem, nie etykietą. Dwukolorowy focus odpowiada przyciskom. Błąd znajduje się pod polem i jest połączony przez `aria-describedby`. Walidacja uruchamia się po blur albo przy wysłaniu. Stany: default, hover, focus, filled, invalid, disabled, read-only i autofill. Input ma minimum 1 rem, żeby telefon nie powiększał widoku.

### Wiersz osoby

Cały wiersz jest linkiem. Zawiera avatar, nazwę, datę i dystans czasowy. Nie dublujemy akcji w środku. Hover przesuwa wiersz o 2 px tylko dla myszy, focus pozostaje widoczny bez ruchu.

### Stempel daty

Ma obramowanie 2 px ink, tło sun lub paper-raised i Unbounded. Tekst zawsze objaśnia znaczenie: „dzisiaj”, „za 4 dni”, „22 lipca”. Obrót maksymalnie 2 stopnie. Domyślne tło stempla to sun; gdy stempel leży na żółtej powierzchni celebracyjnej, przechodzi na paper-raised.

### Dialog i panel

Native `dialog` służy do instrukcji demo oraz nieodwracalnego potwierdzenia. Formularz życzeń i edycja osoby są panelami w układzie strony. Dialog zamyka Escape, zatrzymuje focus i zwraca go do wyzwalacza.

### Toast

Region `aria-live`, maksymalnie jeden komunikat naraz. Sukces znika po 4 sekundach, błąd pozostaje do zamknięcia. Komunikat nazywa skutek i możliwy następny krok.

Toast jest dodatkiem. Po wysłaniu życzeń panel pokazuje trwały sukces z imieniem odbiorcy, skutkiem i następnym krokiem. Gest domykający to stempel „na kartce”, bez konfetti przy każdym zapisie. Reduced motion pokazuje tę samą opieczętowaną kompozycję bez animacji.

### PIN i pola wyboru

Przy ośmiu profilach nie pokazujemy wyszukiwarki. Chronologiczna lista jest szybsza do przeskanowania i zajmuje mniej miejsca. Search wraca warunkowo dopiero przy co najmniej około 15 profilach; dla większej liczby autorów wybór może stać się searchable comboboxem.

Kod demo korzysta z jednego pola `inputmode=numeric` z etykietą, `autocomplete=one-time-code`, obsługą wklejania i Backspace. Nie rozbijamy kodu na cztery pola. Błąd nie czyści draftu ani wybranej tożsamości.

### Upload i status operacji

Upload przyjmuje `image/*` do 2 MB, pokazuje nazwę, rozmiar, podgląd i błąd w tym samym kontekście. Formularz ma podsumowanie błędów po nieudanym submit i przenosi do niego focus. Dezaktywacja profilu daje akcję „Cofnij”.

## Wzorce UI

- Strona główna zaczyna się od dzisiejszych albo najbliższych urodzin. Na szerokim ekranie hero i lista tworzą jedną rozkładówkę; lista nie powtarza osób wyróżnionych w hero. W dniu urodzin kartka hero ma powierzchnię sun i pokazuje avatary solenizantów pod stemplem; poza dniem urodzin kartka zostaje na paper-raised, a kolor niesie stempel. Na liście termin do 7 dni dostaje pigułkę sun z obramowaniem ink.
- Przycisk „Instrukcja" w nagłówku używa berry: to ścieżka rekrutera i jedyny stały akcent marki w ramie aplikacji.
- Profil utrzymuje formularz życzeń w tym samym kontekście. Krok 1 pokazuje autora i kod demo. Krok 2 pokazuje podpis, dwa pola treści i wysłanie. Odbiorca pozostaje stałym kontekstem, nie polem formularza. Draft przeżywa błędny kod i cofnięcie kroku.
- Administracja ma osobny widok. Link nie jest ukryty w stopce.
- Demo pokazuje kody testowe, opisuje fikcyjne dane i ma funkcję resetu.
- Usunięcie profilu w demo jest miękkie i oferuje cofnięcie.
- Loading używa szkieletu o stabilnym rozmiarze. Błąd nie usuwa wprowadzonej treści.

### Hierarchia widoków

| Widok | Primary | Secondary, maksymalnie 2 | Tertiary |
| --- | --- | --- | --- |
| Home | Otwórz profil dzisiejszego solenizanta | Najbliższa osoba | Jak testować, administracja |
| Profil | Napisz życzenia | Odczytaj moją kartkę, wróć do zespołu | Informacja demo |
| Admin | Zapisz osobę | Dodaj profil, przywróć profil | Podgląd e-mail, reset demo, powrót |

### Ścieżka portfolio

„Jak testować?” otwiera nieblokujący panel, nigdy automatyczny onboarding. Panel ma trzy scenariusze: złóż życzenia, odczytaj kartkę, sprawdź administrację. Pokazuje jawne kody demo i przycisk resetu. Na telefonie administracja pozostaje opisana tekstem, nie samą ikoną.

## Ruch

- Naciśnięcie i focus: 100-150 ms.
- Panel i zmiana kroku: 200-300 ms.
- Wejście hero: 500-650 ms, jeden raz.
- Konfetti działa na Home tylko wtedy, gdy ktoś świętuje dzisiaj; fajerwerki działają wyłącznie na takim profilu. Canvas ma limit cząstek, DPR maksymalnie 2, pauzę po ukryciu karty, pełny cleanup i `pointer-events:none`.
- Animujemy wyłącznie transform i opacity. Bez bounce i elastic.
- `prefers-reduced-motion: reduce` całkowicie usuwa Canvas i pozostawia statyczny stempel oraz kolor celebracji.

## Dostępność

- Cel: WCAG 2.2 AA.
- Body co najmniej 1rem, resize tekstu 200% i reflow przy 320 CSS px oraz 400% zoom bez utraty funkcji i poziomego scrolla.
- Focus-visible ma kontrast co najmniej 3:1.
- Każda ikona interaktywna ma etykietę.
- Nawigacja ma skip link do `main`.
- Zapis życzeń jest komunikowany przez `aria-live`.
- Sukces używa `role=status`; `role=alert` jest zarezerwowane dla pilnych błędów.
- Kolor nie jest jedynym nośnikiem stanu.
- Formularze działają klawiaturą, a kolejność focusu odpowiada kolejności wizualnej.
- Daty używają elementu `time`, dokument ma `lang=pl`, a Canvas celebracji jest `aria-hidden`, bez migania i z `pointer-events:none`.
- Tryb `forced-colors` zachowuje obramowania, focus i rozpoznawalne przyciski.

## Kryteria oceny

Przed zamknięciem ekranu sprawdzamy hierarchię przez squint test, rytm odstępów, brak poziomego scrolla na 360 px, kontrast, focus, reduced motion oraz AI slop test z `impeccable`. Po pierwszej implementacji uruchamiamy `critique`, następnie `audit` i `polish`.

| Test | Zakres |
| --- | --- |
| Viewport | 320, 360, 390×844, 768, 1024, 1440, 1916×1007 i 1920 px; przy 1916×1007 Home, profil oraz hero z decyzjami „O projekcie” mieszczą się w pierwszym ekranie; przy 390×844 pierwszy profil Admina jest widoczny bez poziomego overflow |
| Powiększenie | resize tekstu 200%, zoom 400% |
| Sterowanie | klawiatura, pointer coarse, pointer fine |
| Preferencje | reduced motion, forced colors |
| Treść | długie polskie nazwy, 0/1/60 profili, 0/30 życzeń |
| Sieć i fonty | wolne ładowanie, fallback fontów, brak CLS |
| Automatyzacja | test kontrastów z kanonicznych HEX oraz brak rozjazdu z OKLCH |
