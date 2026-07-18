# PRD: Sto lat!

Status: wersja robocza do realizacji  
Typ produktu: publiczne portfolio-demo  
Język pierwszej wersji: polski

## 1. Summary

Sto lat! to publiczna aplikacja demonstracyjna dla fikcyjnego zespołu. Pozwala sprawdzić najbliższe urodziny, znaleźć osobę, złożyć jej prywatne życzenia i przejść przez panel administracyjny. Produkt ma pokazać rekruterowi gotowy proces, jakość wykonania i rozsądne podejście do prywatności, bez użycia prawdziwych danych i bez zapisu do firmowych systemów.

## 2. Contacts

| Osoba | Rola | Udział |
| --- | --- | --- |
| Do uzupełnienia | Właściciel produktu i autor portfolio | Zakres, priorytety, odbiór wydania |
| Do uzupełnienia | Projektant produktu | Przepływy, makiety, system wizualny, dostępność |
| Do uzupełnienia | Programista | Implementacja, testy, publikacja |
| Do uzupełnienia | Recenzent spoza projektu | Test zadaniowy i ocena zrozumiałości demo |

W małym projekcie jedna osoba może pełnić pierwsze trzy role. Recenzent powinien zobaczyć aplikację dopiero wtedy, gdy wersja testowa działa bez dodatkowych wyjaśnień.

## 3. Background

Punktem wyjścia jest wewnętrzna aplikacja urodzinowa używana z firmowym brandingiem i prawdziwymi danymi. Jej główne procesy są sprawdzone: lista urodzin, profil osoby, prywatne życzenia, odczyt życzeń, panel administratora i przypomnienie o urodzinach. Kod wzorcowy ma jednak cechy, których nie należy przenosić do publicznego portfolio:

- dane osobowe i firmowe zasoby,
- czterocyfrowy PIN traktowany jak pełne zabezpieczenie,
- publiczny widok bazy pobierany przez `select(*)`,
- pusty plik migracji bazy, który nie pozwala odtworzyć reguł dostępu,
- jeden duży plik z całym interfejsem,
- brak testów i pełnej obsługi dostępności,
- firmowe domeny, logotypy i adres nadawcy wiadomości.

Nowa wersja ma zachować sens produktu i charakter interakcji, ale będzie osobnym projektem. Wszystkie osoby, zdjęcia, opisy, daty i życzenia będą syntetyczne. Publiczne demo nie będzie wysyłać e-maili ani modyfikować zewnętrznej bazy. Zapis zmian będzie ograniczony do sesji przeglądarki, a użytkownik będzie mógł przywrócić dane początkowe jednym przyciskiem.

Projekt powstaje teraz, ponieważ autor chce mieć w portfolio działający produkt, który można ocenić w kilka minut. Sam zrzut ekranu nie pokazuje obsługi stanów, jakości formularzy, zachowania na telefonie ani decyzji dotyczących danych. Interaktywne demo pozwala to sprawdzić bez udostępniania systemu firmowego.

Pierwsza wersja nie jest systemem HR i nie powinna być używana z danymi prawdziwego zespołu. Wdrożenie produkcyjne dla organizacji wymagałoby osobnego zakresu, uwierzytelniania, zgód, polityki retencji i audytu backendu.

## 4. Objective

### Cel produktu

Stworzyć publiczne demo, które w krótkiej sesji pokazuje pełny proces aplikacji urodzinowej: od znalezienia osoby, przez złożenie życzeń, po zarządzanie fikcyjnym zespołem. Demo ma działać bez rejestracji, jasno opisywać swoje ograniczenia i chronić projekt przed przypadkowym użyciem prawdziwych danych.

Cel wspiera portfolio autora na trzy sposoby:

- rekruter może sam sprawdzić produkt zamiast opierać się na opisie,
- decyzje produktowe, projektowe i techniczne są widoczne w jednym spójnym przykładzie,
- kod można omówić podczas rozmowy bez ujawniania rozwiązań oraz danych byłego lub obecnego pracodawcy.

### Key results

| KR | Miernik | Warunek i termin |
| --- | --- | --- |
| KR1 | Ukończenie głównego zadania przez odwiedzającego | W ciągu dwóch tygodni od publikacji co najmniej 4 z 5 osób testowych znajdą najbliższe urodziny i złożą życzenia bez pomocy, w czasie do 3 minut |
| KR2 | Jakość wersji mobilnej | Przed publikacją wynik Lighthouse dla wersji produkcyjnej wyniesie co najmniej 90 dla wydajności, 95 dla dostępności i 95 dla dobrych praktyk |
| KR3 | Prywatność demo | Przed każdym wdrożeniem skan repozytorium oraz ręczny przegląd potwierdzą 0 prawdziwych rekordów osobowych, 0 sekretów i 0 odwołań do firmowych domen |
| KR4 | Pokrycie procesów | Przed publikacją wszystkie scenariusze P0 przejdą na szerokościach 320, 768, 1024 i 1440 px oraz przy obsłudze samą klawiaturą |
| KR5 | Stabilność | W ciągu pierwszych dwóch tygodni po publikacji nie wystąpi błąd blokujący wejście, przegląd kalendarza, składanie życzeń, odczyt życzeń ani reset danych demo |

## 5. Market segments

Segmenty opisują sytuację i zadanie użytkownika. Wiek, stanowisko i branża nie definiują tutaj potrzeby.

### Osoba składająca życzenia

**Job:** Kiedy zbliżają się urodziny członka zespołu, chcę szybko sprawdzić termin i zostawić osobistą wiadomość, żebym nie przegapił okazji i nie musiał szukać informacji w kilku miejscach.

Ograniczenia:

- wizyta trwa zwykle kilka minut,
- użytkownik może korzystać z telefonu,
- formularz powinien być zrozumiały bez instrukcji,
- życzenia mają być odczytywane przez właściwą osobę, choć w publicznym demo jest to tylko symulacja prywatności.

### Osoba odbierająca życzenia

**Job:** Kiedy mam urodziny, chcę otworzyć zebrane wiadomości w jednym miejscu, żebym mógł je spokojnie przeczytać i wiedzieć, kto się podpisał.

Ograniczenia:

- użytkownik musi rozumieć, która tożsamość demo jest aktywna,
- pusty stan powinien wyjaśniać, dlaczego nie ma wiadomości,
- demo nie może sugerować, że jawny kod demonstracyjny stanowi prawdziwe zabezpieczenie.

### Administrator fikcyjnego zespołu

**Job:** Kiedy zmienia się skład zespołu lub dane profilu, chcę dodać, poprawić albo ukryć osobę, żeby kalendarz pozostał aktualny.

Ograniczenia:

- wszystkie zmiany dotyczą wyłącznie bieżącej sesji,
- formularz nie zbiera roku urodzenia ani danych kontaktowych,
- zdjęcie jest opcjonalne, ma limit typu i rozmiaru,
- administrator musi mieć szybki sposób przywrócenia zestawu początkowego.

### Rekruter lub osoba przeglądająca portfolio

**Job:** Kiedy oceniam autora projektu, chcę w kilka minut zobaczyć działający proces, stany brzegowe i jakość wykonania, żebym mógł ocenić jego sposób myślenia oraz poziom pracy.

Ograniczenia:

- odwiedzający nie zna wcześniejszej aplikacji,
- może nie chcieć zakładać konta,
- często zacznie od telefonu albo małego okna,
- potrzebuje krótkiego wyjaśnienia trybu demo i łatwego dostępu do procesu administratora.

## 6. Value propositions

| Segment | Oczekiwany efekt | Usuwany problem | Przewaga rozwiązania |
| --- | --- | --- | --- |
| Osoba składająca życzenia | Szybko znajduje osobę i wysyła dwuczęściową wiadomość z wybranym podpisem | Pamiętanie dat i zbieranie życzeń w luźnych kanałach | Termin, profil, formularz i potwierdzenie są częścią jednego procesu |
| Osoba odbierająca życzenia | Czyta wszystkie wiadomości w uporządkowanej formie | Wiadomości rozproszone po czatach i poczcie | Każde życzenie pokazuje część zawodową, osobistą, podpis i czas dodania |
| Administrator | Sprawnie zarządza zestawem osób demo | Ręczna edycja danych w kodzie | Formularze CRUD, podgląd avatara i reset danych są dostępne w aplikacji |
| Rekruter | Ocenia produkt na podstawie działania | Portfolio złożone z samych obrazów i deklaracji | Demo obejmuje codzienny proces, panel administracyjny, stany błędów, dostępność i opis decyzji |

### Value curve

**Usuwamy:** prawdziwe dane, zależność od firmowych usług, obowiązkową rejestrację, wysyłkę prawdziwych wiadomości i pozorne zabezpieczenie oparte na PIN-ie.

**Ograniczamy:** liczbę pól, czas wejścia do demo, liczbę kroków przed pierwszą interakcją oraz liczbę zewnętrznych zależności.

**Zwiększamy:** czytelność stanów, jakość wersji mobilnej, obsługę klawiatury, przewidywalność formularzy oraz jawność zasad trybu demo.

**Dodajemy:** pełnoekranowe konfetti i fajerwerki, wybór roli i tożsamości demo, reset zestawu, podgląd przypomnienia, testowane stany brzegowe i warstwę danych, którą można później wymienić na backend.

## 7. Solution

### 7.1 UX and prototypes

#### Wejście do demo

Pierwsza wizyta otwiera krótką planszę z trzema informacjami:

1. wszystkie osoby i wiadomości są fikcyjne,
2. zmiany pozostają w tej karcie przeglądarki,
3. rolę można zmienić w dowolnym momencie.

Główny przycisk prowadzi do widoku pracownika. Drugi link otwiera opis projektu. Planszę można później przywołać z menu pomocy.

#### Flow pracownika

1. Strona główna pokazuje dzisiejsze i najbliższe urodziny.
2. Użytkownik wybiera osobę z krótkiej listy ułożonej według najbliższego terminu.
3. Profil pokazuje datę, opis, avatar i licznik czasu.
4. Użytkownik wybiera „Złóż życzenia”.
5. Wybiera fikcyjną tożsamość autora. Opcjonalny ekran kodu demo odtwarza zachowanie wzorca, ale zawiera widoczną informację, że kod nie chroni prawdziwych danych.
6. System sprawdza życzenia dla samego siebie, powtórzenie w tym samym roku i termin przed urodzinami.
7. Użytkownik wpisuje cechę zawodową oraz osobistą i wybiera podpis.
8. Po wysłaniu widzi potwierdzenie oraz jasny następny krok.
9. W widoku swojej fikcyjnej osoby może otworzyć otrzymane życzenia.

#### Flow administratora

1. Użytkownik przełącza rolę na „Administrator demo”.
2. Panel wyjaśnia, że operacje są lokalne i odwracalne.
3. Administrator dodaje osobę, edytuje profil, zmienia avatar albo ukrywa wpis.
4. Po każdej operacji widzi komunikat z wynikiem.
5. „Przywróć dane demo” wymaga potwierdzenia i odtwarza zestaw początkowy.

#### Flow rekrutera

1. Rekruter uruchamia demo bez konta.
2. Krótka ścieżka „Pokaż możliwości” wskazuje dzisiejszą celebrację, profil, życzenia i panel administratora.
3. Wycieczkę można pominąć. Aplikacja nie blokuje samodzielnego zwiedzania.
4. Link „O projekcie” prowadzi do krótkiego opisu zakresu, technologii, prywatności i ograniczeń demo.

#### Układ i stany

- Mobile: jedna kolumna, dolny lub zwarty górny pasek działań, pola formularzy w jednej kolumnie.
- Tablet: wyśrodkowana treść w jednej kolumnie.
- Szeroki desktop: hero i chronologiczna lista tworzą kompozycję 7/5 mieszczącą się w pierwszym ekranie przy 100% zoomu.
- Minimalna obsługiwana szerokość: 320 px, bez przewijania poziomego.
- Każdy proces ma stan ładowania, pusty stan, błąd, sukces i możliwość ponowienia.
- Dialogi mają nazwę, opis, focus trap, obsługę Escape i powrót fokusu do elementu otwierającego.
- Animacje respektują `prefers-reduced-motion`. Treść pozostaje pełna po ich wyłączeniu.

Przed implementacją należy przygotować makiety dla pięciu widoków: wejście do demo, strona główna, profil, formularz życzeń i panel administratora. Każda makieta powinna mieć wariant mobile oraz desktop.

### 7.2 Key features

| ID | Funkcja | Wymaganie odbiorowe |
| --- | --- | --- |
| F-01 | Tryb demo | Aplikacja startuje z syntetycznym zestawem, oznacza demo w stałym miejscu i nie wysyła danych poza przeglądarkę |
| F-02 | Strona główna | Pokazuje co najmniej jedne urodziny „dzisiaj”, najbliższy kolejny termin i listę posortowaną według liczby dni |
| F-03 | Kompaktowy kalendarz | Nie powtarza osób wyróżnionych w hero; przy zestawie demo mieści hero i kolejne daty w pierwszym ekranie na 1916×1007 i 1440×900 przy 100% zoomu |
| F-04 | Profil osoby | Pokazuje avatar, pseudonim, nazwę, dzień i miesiąc urodzin, opis oraz odliczanie. Nie pokazuje wieku ani roku urodzenia |
| F-05 | Życzenia | Wymaga dwóch treści, pozwala wybrać bezpieczny wariant podpisu i blokuje pusty lub zbyt długi wpis |
| F-06 | Reguły życzeń | Obsługuje powtórzenie w tym samym roku, życzenia dla siebie i wiadomość wysyłaną przed terminem |
| F-07 | Odczyt życzeń | Aktywna fikcyjna osoba widzi własne wiadomości z podpisem i czasem dodania. Inne osoby nie widzą tej listy w zwykłym flow |
| F-08 | Panel administratora | Pozwala dodać, edytować i ukryć osobę. Nie pozwala usunąć ostatniego administratora demo |
| F-09 | Avatary | Obsługuje przygotowane grafiki, emoji oraz lokalny podgląd pliku `image/*` do 2 MB. Plik nie opuszcza przeglądarki |
| F-10 | Reset danych | Przywraca seed po potwierdzeniu i usuwa zmiany z bieżącej sesji |
| F-11 | Motyw i ruch | Używa jednego dopracowanego jasnego motywu, pokazuje Canvas konfetti na Home oraz fajerwerki na dzisiejszym profilu, ogranicza liczbę cząstek i całkowicie wyłącza ruch zgodnie z preferencją systemu |
| F-12 | Przypomnienie demo | Udostępnia podgląd wiadomości przypominającej o urodzinach, ale nie ma funkcji wysyłki |
| F-13 | Informacje o projekcie | Opisuje cel, zakres demo, użyte technologie, zasady danych i odsyła do repozytorium |

#### Reguły danych

- Seed zawiera wyłącznie wymyślone osoby, opisy i życzenia.
- Zestaw zawsze zapewnia osobę z urodzinami dzisiaj oraz osobę z terminem w ciągu siedmiu dni. Daty są wyliczane dla strefy `Europe/Warsaw`.
- Osoba ma pola: `id`, `displayName`, `nickname`, `birthdayMd`, `about`, `avatar`, `isAdmin`, `isActive`, `createdAt`.
- Życzenie ma pola: `id`, `recipientId`, `authorId`, `professionalText`, `personalText`, `signature`, `wishYear`, `createdAt`.
- Para `recipientId + authorId + wishYear` jest unikalna.
- Treść każdego pola jest renderowana jako tekst. Aplikacja nie wstrzykuje wpisanej treści do HTML.
- Rok urodzenia, e-mail, telefon, adres i dane zatrudnienia pozostają poza modelem.

#### Wymagania jakościowe

- Zgodność z WCAG 2.2 AA w zakresie użytych ekranów i kontrolek.
- Pełna obsługa klawiatury i widoczny fokus.
- Minimalny obszar dotyku 44 na 44 px.
- Kontrast tekstu i kontrolek zgodny z AA.
- Brak utraty treści formularza po przypadkowym zamknięciu dialogu bez potwierdzenia.
- Czytelny komunikat dla błędu i pustej listy.
- Testy dat obejmują koniec roku, zmianę czasu oraz 29 lutego.
- Produkcyjny build nie zawiera sekretów, adresów firmowych ani plików pochodzących z aplikacji wzorcowej.

### 7.3 Technology

Pierwsze wydanie korzysta z obecnego szkieletu: React 19, TypeScript i Vite 8. Kod należy podzielić na moduły domenowe, komponenty i warstwę danych. Nie należy odtwarzać układu z całym produktem w jednym pliku.

Proponowany podział:

- `features/birthdays`: hero, chronologiczna lista, profil, celebracja i obliczenia dat,
- `features/wishes`: formularz, reguły, odczyt i podpis,
- `features/admin`: zarządzanie osobami i reset,
- `components`: wspólne kontrolki oraz dialogi,
- `data`: typowany interfejs repozytorium i implementacja demo,
- `lib`: daty, walidacja i dostępność,
- `content`: syntetyczny seed oraz teksty aplikacji.

Publiczne wydanie używa `DemoRepository` z kopią seeda w `sessionStorage`. Interfejs repozytorium powinien pozwolić później dodać `SupabaseRepository`, ale kod Supabase i sekrety nie są częścią pierwszego wydania. Dzięki temu demo nie ma publicznego punktu zapisu, który można spamować, i nie udaje systemu gotowego do przechowywania danych osobowych.

Wymagane zabezpieczenia techniczne:

- walidacja wszystkich danych na granicy repozytorium,
- limity długości tekstu i rozmiaru pliku,
- brak `dangerouslySetInnerHTML` dla treści użytkownika,
- brak prawdziwych kluczy w zmiennych `VITE_*`,
- nagłówki bezpieczeństwa dla hostingu statycznego,
- automatyczny lint, typecheck, testy i build w CI,
- testy komponentów dla formularzy oraz testy end-to-end dla procesów P0.

### 7.4 Assumptions

| Założenie | Ryzyko | Sposób sprawdzenia |
| --- | --- | --- |
| Rekruter poświęci demo od 2 do 5 minut | Główna wartość może pozostać niewidoczna | Test zadaniowy z co najmniej 5 osobami i pomiar czasu |
| Brak rejestracji zwiększy liczbę ukończonych sesji | Użytkownik może nie rozumieć aktywnej tożsamości | Test dwóch wersji wejścia: wybór roli od razu albo po otwarciu profilu |
| Lokalny zapis wystarczy do portfolio | Część odbiorców może oczekiwać działającego backendu | Na stronie projektu jasno opisać architekturę demo i plan adaptera Supabase |
| Dwa pola życzeń tworzą ciekawszy wpis niż jedno | Formularz może wydawać się zbyt długi | Obserwować porzucenia podczas testu i zebrać krótką opinię po zadaniu |
| Chronologiczna lista wystarczy przy mniej niż 15 profilach | Przy większym seedzie lista może być mniej wygodna | Przetestować zestaw 12-20 osób i warunkowo dodać search lub filtr miesiąca dopiero po wykryciu potrzeby |
| Polski interfejs nie utrudni oceny portfolio | Rekruter spoza Polski może nie przejść procesu | Przygotować angielską wersję w kolejnym wydaniu, jeśli pojawi się taki odbiorca |

## 8. Release

### Zakres pierwszego wydania

P0 obejmuje:

- wejście i oznaczenie trybu demo,
- syntetyczny seed oraz lokalny zapis sesji,
- stronę główną w układzie jednego ekranu i kompaktowy profil,
- składanie oraz odczyt życzeń,
- reguły duplikatu, własnego profilu i terminu przed urodzinami,
- panel administratora z dodaniem, edycją, ukryciem i resetem,
- jeden dopracowany jasny motyw,
- pełnoekranowe konfetti i fajerwerki z limitami wydajności oraz trybem ograniczonego ruchu,
- podgląd przypomnienia,
- stronę „O projekcie”,
- responsive layout, dostępność, testy i publikację statyczną.

Poza pierwszym wydaniem pozostają:

- prawdziwe konta i reset hasła,
- zewnętrzna baza danych,
- prawdziwa wysyłka e-maili, SMS lub push,
- import arkuszy i kalendarzy,
- dane rzeczywistych osób,
- wiele organizacji,
- panel analityczny,
- pełna wersja angielska,
- aplikacja instalowalna i tryb offline.

### Plan prac

| Etap | Zakres | Szacunek dla jednej osoby |
| --- | --- | --- |
| 1. Fundament | Makiety, typy danych, seed, repozytorium demo, tokeny wizualne | 1-2 dni robocze |
| 2. Główne procesy | Home, celebracja Canvas, profil, życzenia, panel administratora | 3-5 dni roboczych |
| 3. Jakość | Responsive, dostępność, stany błędów, testy, strona projektu | 2-3 dni robocze |
| 4. Publikacja | Build produkcyjny, skan danych, test przeglądarek, hosting | 1 dzień roboczy |

Całość powinna zamknąć się w około półtora do dwóch tygodni pracy jednej osoby. Zakres można skrócić przez odłożenie podglądu przypomnienia i wycieczki po demo, ale nie przez pominięcie dostępności, prywatności lub testów głównych procesów.

### Warunki publikacji

Wydanie może trafić do portfolio, gdy:

1. wszystkie KR możliwe do sprawdzenia przed publikacją mają wynik pozytywny,
2. testy P0 przechodzą w CI,
3. produkcyjny build działa po odświeżeniu każdej publicznej ścieżki,
4. przegląd repozytorium nie znajduje prawdziwych danych, sekretów ani firmowych zasobów,
5. tryb demo i jego ograniczenia są widoczne przed pierwszym zapisem,
6. wersja mobilna działa przy 320 px i przy powiększeniu tekstu do 200%,
7. dostępna jest szybka droga powrotu do poprzedniego statycznego wdrożenia.

### Kolejne wydania

Po zebraniu opinii można rozważyć:

- adapter Supabase z prawdziwym uwierzytelnianiem, RLS, rate limitingiem i migracjami w repozytorium,
- filtrowanie według miesiąca oraz widok kalendarza,
- eksport wydarzenia do kalendarza,
- wersję angielską,
- prywatne wdrożenie dla małego zespołu po przygotowaniu zasad danych i zgód,
- bezpieczne powiadomienia uruchamiane po stronie serwera z dziennikiem wysyłek i ochroną przed duplikatami.
