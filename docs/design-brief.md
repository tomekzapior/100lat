# Design brief — bdayapp

## 1. Feature Summary

`bdayapp` to responsywne portfolio-demo tablicy urodzinowej dla fikcyjnego zespołu. Pracownik może znaleźć solenizanta, złożyć podpisane życzenia i odczytać własne wiadomości, administrator zarządza profilami, a rekruter może przejść wszystkie kluczowe scenariusze w jawnym i resetowalnym trybie demo.

Produkt zachowuje funkcjonalny rdzeń aplikacji wzorcowej — kalendarz, countdown, PIN-y, życzenia, profile, administrację i przypomnienia — ale otrzymuje własną identyfikację „cyfrowej kartki urodzinowej”, pełnoekranową celebrację oraz pełną obsługę urządzeń mobilnych i dostępności.

## 2. Primary User Action

Najważniejszą akcją jest **wybranie solenizanta i wysłanie mu kompletnych, osobistych życzeń**. Informacja o dacie, chronologiczna lista, profil, identyfikacja autora i formularz mają prowadzić do tego celu bez konieczności poznawania struktury aplikacji.

Tryb administratora, odczyt życzeń i prezentacja projektu rekruterowi są ważnymi ścieżkami pomocniczymi, ale nie powinny odbierać pierwszeństwa gestowi złożenia życzeń.

## 3. Design Direction

Kierunek wynika z [kontekstu projektowego](../.impeccable.md): interfejs ma wyglądać jak cyfrowa kartka przygotowana przez człowieka, nie jak korporacyjny system kadrowy.

- Jasne, ciepłe tło przypomina papier, a powierzchnie różnią się tonem i fakturą zamiast przezroczystością oraz blur.
- Atramentowy kolor odpowiada za większość tekstu. Malinowy lub cynobrowy akcent prowadzi akcje, a żółty detal pojawia się tylko w momentach celebracji.
- Charakterystyczny krój display nadaje nazwom i komunikatom wydarzenia własny głos; krój tekstowy pozostaje spokojny i czytelny. Konkretna para fontów zostanie wybrana po przeglądzie katalogów, bez domyślnych wyborów kojarzonych z szablonami AI.
- Kontrolowana asymetria, delikatne przesunięcia warstw, linie, stemple i pojedyncze ilustracyjne znaki budują wrażenie kartki. Nie każda sekcja otrzymuje osobny zaokrąglony kontener.
- Konfetti na Home i fajerwerki na profilu są pełnoekranową warstwą uruchamianą wyłącznie w dniu urodzin. Mają twardy limit cząstek, pauzują w nieaktywnej karcie i nigdy nie przechwytują kliknięć. Wariant ograniczonego ruchu zachowuje emocję przez kolor i kompozycję.

Anti-reference: corporate glassmorphism, złoto na czerni, neonowe poświaty, gradientowy tekst, identyczne karty z ikoną, duże emoji jako jedyne affordance, dashboard z hero-metryką oraz dekoracje bez związku z zadaniem.

## 4. Layout Strategy

### Globalna rama

Nagłówek zawiera nazwę produktu, subtelny status „Demo”, dostęp do instrukcji trybu demo oraz jawny link do administracji. Nie ukrywamy funkcji w logo ani stopce.

Treść korzysta z płynnego kontenera. Telefon prowadzi pojedynczą, czytelną kolumną. Większe ekrany dostają kompozycję o dwóch rytmach: główny moment i działania po jednej stronie, kontekst lub lista po drugiej. Nie rozciągamy mechanicznie layoutu mobilnego.

### Strona główna

Pierwszy plan zajmuje dzisiejsze wydarzenie. Jeśli nikt nie świętuje, jego miejsce przejmuje najbliższa osoba i countdown. Kilku solenizantów jednego dnia tworzy wspólną kompozycję z osobnymi, równorzędnymi przejściami do profili.

Na desktopie hero i uporządkowana chronologicznie lista tworzą jedną dwukolumnową rozkładówkę mieszczącą się w pierwszym ekranie. Lista nie powtarza osób wyróżnionych w hero. Przy więcej niż około 15 profilach można warunkowo przywrócić wyszukiwanie lub grupowanie miesiącami. Data i dystans czasowy są rozpoznawalne bez zapamiętywania legendy.

### Profil i życzenia

Tożsamość osoby, data, countdown i krótki opis tworzą jedną sekcję wprowadzającą. Główne CTA rozpoczyna formularz życzeń w tej samej przestrzeni: jako rozwijany panel na telefonie lub sąsiednią kolumnę na desktopie. Weryfikacja i potwierdzenia są krokami panelu, nie serią nakładających się modali.

Odczyt otrzymanych życzeń jest oddzielną, chronioną akcją. Po weryfikacji wpisy układają się jak kolejne notatki na wspólnej kartce, z czytelnym podpisem i datą.

### Administracja

Panel admina ma bardziej zadaniowy rytm, ale używa tej samej typografii, kolorów i języka. Lista osób pozostaje skanowalna; dodawanie i edycja odbywają się w dedykowanym panelu lub osobnym widoku, a nie przez rozrastanie każdej pozycji listy. Akcje destrukcyjne są oddzielone od codziennej edycji.

## 5. Key States

### Globalne i strona główna

- **Pierwsza wizyta w demo:** krótka, możliwa do pominięcia informacja wyjaśnia role, fikcyjne dane i sposób resetu. Główna zawartość pozostaje widoczna.
- **Ładowanie:** stabilny szkielet zachowuje układ hero i listy; komunikat tekstowy jest dostępny dla czytnika ekranu.
- **Urodziny dziś — jedna osoba:** mocna identyfikacja solenizanta i jedno CTA.
- **Urodziny dziś — kilka osób:** równorzędne profile bez automatycznego kierowania CTA wyłącznie do pierwszej osoby.
- **Brak urodzin dziś:** najbliższa osoba, data i spokojny countdown bez sugerowania pilności.
- **Pusty zespół:** wyjaśnienie i, dla administratora, droga do dodania pierwszego profilu.
- **Błąd danych:** jasny opis problemu, ponowienie i zachowanie ostatniego poprawnego widoku, jeśli jest dostępny.
- **Długi lub nietypowy profil:** nazwy, opis i brak zdjęcia nie łamią hierarchii ani celu dotykowego.

### Składanie i odczyt życzeń

- **Formularz domyślny:** widoczne są cel, odbiorca, sposób podpisu i dwa pola treści.
- **Niepełny formularz:** walidacja wskazuje konkretne pole oraz podaje oczekiwany zakres, nie opiera się wyłącznie na nieaktywnym przycisku.
- **Weryfikacja PIN:** cztery cyfry, poprawna obsługa wklejania, klawiatury numerycznej, cofania i czytnika ekranu.
- **Błędny PIN:** błąd nie czyści bez ostrzeżenia całego kontekstu; użytkownik może spróbować ponownie lub rozpocząć reset.
- **Nie pamiętam PIN:** weryfikacja fikcyjnej tożsamości, ustawienie i potwierdzenie nowego kodu, czytelny sukces.
- **Życzenia przed datą:** spokojne potwierdzenie zawiera dokładną datę i liczbę dni.
- **Życzenia dla siebie:** neutralne potwierdzenie bez zawstydzającego tonu.
- **Duplikat w danym roku:** informacja, że życzenia już zapisano; bez ponownego formularza prowadzącego do błędu.
- **Wysyłanie:** formularz pozostaje stabilny, przycisk pokazuje postęp i blokuje duplikat akcji.
- **Sukces:** pozytywne, krótkie domknięcie oraz droga powrotu do profilu.
- **Błąd zapisu lub utrata sieci:** treść użytkownika nie znika; dostępne jest ponowienie.
- **Brak otrzymanych życzeń:** pusty stan jest dyskretny i nie sugeruje winy innych osób.
- **Lista życzeń:** obsługuje od jednego do kilkudziesięciu wpisów oraz dłuższą treść bez monotonnej ściany kart.

### Administracja

- **Brak autoryzacji i błędny PIN administratora.**
- **Lista pusta, typowa i długa.**
- **Dodawanie, edycja, upload zdjęcia i zapis w toku.**
- **Walidacja zajętego PIN-u, błędnej daty, formatu lub rozmiaru zdjęcia.**
- **Potwierdzenie usunięcia:** jasno nazywa osobę i skutek; preferowane jest odwracalne wyłączenie profilu.
- **Sukces i błąd każdej operacji:** komunikat wskazuje, co faktycznie zapisano.
- **Reset demo:** ostrzeżenie wyjaśnia, które fikcyjne zmiany zostaną cofnięte.

### Dostępność i urządzenia

- **Reduced motion:** brak ciągłych animacji, ten sam status przekazany tekstem i kolorem.
- **Klawiatura i widoczny focus:** pełny przepływ bez myszy, logiczny powrót fokusu po zamknięciu panelu.
- **Mały ekran i powiększenie 200%:** brak poziomego scrolla oraz utraty krytycznych działań.
- **Wolne połączenie:** zdjęcia mają stabilne miejsce, fallback i nie blokują treści.

## 6. Interaction Model

1. Użytkownik trafia na stronę główną i od razu rozumie, kto świętuje lub kto jest następny. Rekruter widzi oznaczenie demo i krótką drogę do ról testowych.
2. Kliknięcie lub aktywacja klawiaturą całego wiersza osoby otwiera profil. Hover jest tylko dodatkiem; focus i etykieta muszą przekazywać tę samą informację.
3. CTA „Napisz życzenia” rozwija kompozytor. Autor wybiera fikcyjną tożsamość w trybie demo i potwierdza ją PIN-em lub korzysta z jawnie opisanej ścieżki demonstracyjnej.
4. Po weryfikacji aplikacja sprawdza self-wish, duplikat i termin. Tylko właściwy przypadek pojawia się jako następny krok; wcześniejsze treści nie są tracone.
5. Użytkownik wybiera podpis, uzupełnia dwa pola i wysyła. Postęp, sukces i błąd są komunikowane wizualnie oraz przez region `aria-live`.
6. Akcja „Odczytaj moje życzenia” weryfikuje solenizanta i odsłania zapisane wpisy w profilu.
7. Administrator przechodzi jawnym linkiem do osobnego obszaru, loguje się kodem demo i wykonuje CRUD. Formularz ostrzega przed opuszczeniem niezapisanych zmian.

Animacje wejścia są krótkie i nie opóźniają interakcji. Konfetti działa na Home, a fajerwerki na profilu dzisiejszego solenizanta — analogicznie do aplikacji wzorcowej, lecz z limitami wydajności, pauzą po ukryciu karty i pełnym cleanupem. Stan `prefers-reduced-motion` całkowicie wyłącza ruch cząsteczek.

## 7. Content Requirements

### Dane profilu

- fikcyjne imię i nazwisko,
- nazwa wyświetlana,
- data urodzin bez ujawniania niepotrzebnego roku na widokach publicznych,
- krótki opis,
- zdjęcie demo lub neutralny fallback,
- techniczny identyfikator, rola i stan aktywności,
- PIN przechowywany wyłącznie w bezpiecznej formie,
- opcjonalny fikcyjny e-mail do demonstracji przypomnień.

Zakładane zakresy do zaprojektowania i testów: 0–60 profili, 0–30 życzeń na osobę, nazwy wyświetlane 2–30 znaków, opis profilu do około 240 znaków oraz każde pole życzeń 10–500 znaków. Wartości są założeniem projektowym, które należy potwierdzić przed implementacją walidacji.

### Kluczowe etykiety

- „Napisz życzenia” — główne CTA.
- „Odczytaj moje życzenia” — chroniona akcja solenizanta.
- „Za co Cię cenimy” oraz „Czego Ci życzymy” — rekomendowane, uniwersalne nazwy dwóch pól zamiast firmowego podziału biznesowego i interpersonalnego.
- „Podpiszę się jako…” — wybór podpisu.
- „Tryb demo” / „Jak testować?” / „Przywróć dane demo” — jawne elementy wersji portfolio.

### Microcopy

- Komunikaty mają nazywać czynność i skutek: „Nie udało się zapisać życzeń. Twoja treść jest bezpieczna — spróbuj ponownie”.
- Błędy PIN-u nie ujawniają danych innych osób i nie brzmią oskarżycielsko.
- Ostrzeżenie przed wcześniejszym wysłaniem zawiera datę, nie samą liczbę dni.
- Pusty stan życzeń jest neutralny: „Ta kartka dopiero czeka na pierwsze słowa”.
- Sukces domyka zadanie: „Życzenia są już na kartce Oli”.
- Wszystkie komunikaty demo wyraźnie mówią, że dane są fikcyjne i mogą zostać zresetowane.

Treść bazowa jest po polsku, lecz format dat, liczba mnoga i układ nie mogą blokować przyszłej lokalizacji. Do repozytorium nie trafiają prawdziwe fotografie, daty, adresy, PIN-y ani arkusze z aplikacji wzorcowej.

## 8. Recommended References

Podczas implementacji należy sięgnąć przede wszystkim do następujących materiałów skilla `impeccable`:

- `reference/spatial-design.md` — asymetryczna kompozycja kartki, rytm sekcji i zachowanie layoutu na szerokim ekranie.
- `reference/typography.md` — dobór pary fontów, hierarchia nazw, liczników i dłuższych życzeń.
- `reference/color-and-contrast.md` — papierowa paleta, kontrast tekstów pomocniczych i niekolorystyczne oznaczanie stanów.
- `reference/interaction-design.md` — formularz, PIN, focus management, walidacja i nieblokujące informacje zwrotne.
- `reference/motion-design.md` — pełnoekranowa celebracja Canvas, przejścia stanów i wariant reduced motion.
- `reference/responsive-design.md` — przejście od jednokolumnowego telefonu do kompozycji profil + formularz.
- `reference/ux-writing.md` — polskie etykiety, błędy, potwierdzenia i puste stany bez korporacyjnego tonu.

Po zbudowaniu reprezentatywnych ekranów warto ponownie uruchomić `critique` i `audit`, ze szczególnym naciskiem na nawigację klawiaturą, kontrast oraz skanowalność listy.

## 9. Decyzje implementacyjne

Pytania z etapu briefu zostały rozstrzygnięte przed zamknięciem MVP:

1. Widoczna nazwa produktu to **Sto lat!**, a znak bazuje na autorskim stemplu „100”.
2. Publiczny tryb demo zapisuje zmiany wyłącznie w `sessionStorage` i ma jawny reset.
3. Rekruter wybiera fikcyjną tożsamość i korzysta ze wspólnego, jawnego kodu `2026`; panel admina używa `4242`.
4. Demo pokazuje bezpieczny podgląd przypomnienia, ale nie wykonuje prawdziwej wysyłki.
5. Pola życzeń mają uniwersalne nazwy „Za co Cię cenimy” i „Czego Ci życzymy”.
6. Typografia łączy **Unbounded Variable** dla nagłówków z **Commissioner Variable** dla treści.
7. MVP ma jeden dopracowany jasny motyw. Ciemny wariant nie wnosi wartości do tej historii portfolio.

Brief został zrealizowany w aplikacji, design guide i dokumentacji technicznej.
