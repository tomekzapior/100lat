# Sto lat!

Publiczne demo portfolio: firmowy kalendarz urodzin z prywatnymi kartkami
życzeń. Aplikacja przypomina, kto z zespołu świętuje, prowadzi przez
podpisanie krótkich życzeń i pokazuje je solenizantowi w jego dniu. Całość
domyka panel administracyjny do zarządzania profilami.

Pomysł jest organizacyjny, nie techniczny. O terminach pamięta aplikacja,
a nie pojedyncze osoby, więc nikt nie zostaje pominięty. Zamiast
przypadkowej wiadomości na czacie zespół dostaje wspólny rytuał: każdy w
minutę zostawia kilka osobistych słów, a jubilat czyta wszystko na swojej
kartce.

**Żywe demo: [do uzupełnienia po publikacji na Netlify]**

Autor: **Tomasz Zapiór** ·
[LinkedIn](https://www.linkedin.com/in/tomasz-zapi%C3%B3r)

[![Quality](https://github.com/tomekzapior/100lat/actions/workflows/quality.yml/badge.svg)](https://github.com/tomekzapior/100lat/actions/workflows/quality.yml)

[English version](README.en.md)

![Strona główna z dzisiejszymi solenizantkami i listą kolejnych urodzin](docs/screens/home.jpg)

## Sedno pomysłu: demo, które nigdy nie jest puste

Kalendarz urodzin podpięty pod sztywne daty umiera w dniu, w którym nikt
nie świętuje. To demo rozwiązuje ten problem:

- Zestaw danych generuje się **względem dnia otwarcia aplikacji**
  ([`src/data/demoSeed.ts`](src/data/demoSeed.ts)): dwie osoby świętują
  zawsze dzisiaj, kolejna za cztery dni, reszta rozkłada się na cały rok.
- Przy zmianie dnia stan re-seeduje się automatycznie, a uszkodzone dane
  sesji odrzuca pełna walidacja
  ([`src/data/parseDemoState.ts`](src/data/parseDemoState.ts)) z bezpiecznym
  powrotem do seeda.
- Wszystkie zmiany (nowe profile, życzenia, zdjęcia) żyją w sesji
  przeglądarki i wracają do stanu początkowego jednym przyciskiem.
- W dniu urodzin strona główna odpala konfetti, a profil solenizanta
  fajerwerki; oba efekty mają limity cząstek, pauzę w nieaktywnej karcie
  i wyłączają się przy `prefers-reduced-motion`.

Dzięki temu rekruter zawsze trafia na środek akcji: jest komu złożyć
życzenia, jest kartka do odczytania i są dane do zarządzania.

## Co pokazuje ten projekt

- Myślenie produktowe: reguły, których taka aplikacja naprawdę potrzebuje
  (jeden wpis autora na kartkę rocznie, życzenia przed terminem trafiają
  na właściwy rok celebracji, ochrona ostatniego administratora), zapisane
  w PRD i wymuszone w kodzie.
- Zaprojektowany system, nie szablon: metafora kartki z sitodruku, tokeny
  OKLCH, stemple dat, taśmy klejące, dwa kroje variable (Unbounded i
  Commissioner) i celebracja Canvas z własnym silnikiem cząstek.
- Odporna warstwa danych: walidacja stanu na granicy sesji, kompresja
  zdjęć w przeglądarce przed zapisem i jawny komunikat, gdy zapis w
  `sessionStorage` zawiedzie, zamiast fałszywego sukcesu.
- Testowalna logika i UI: daty z 29 lutego i granicą roku, walidacja
  uszkodzonego stanu, pełny CRUD administratora i główne przepływy,
  razem 26 testów Vitest.
- Dyscyplina responsywności: od 320 px bez poziomego scrolla, kompozycja
  7/5 na desktopie od 1120 px, największa skala dopiero od 1920 px.
- Schemat Supabase/PostgreSQL z RLS i ograniczonymi widokami gotowy w
  [`supabase/migrations`](supabase/migrations); podpięcie go pod ten sam
  interfejs domenowy to następny kamień milowy.

## Ekrany

| | |
|---|---|
| ![Strona główna](docs/screens/home.jpg) Strona główna: dzisiejsza celebracja i kalendarz | ![Profil](docs/screens/profile.jpg) Profil solenizantki z wejściem do życzeń |
| ![Admin](docs/screens/admin.jpg) Panel administratora: katalog i edycja z podglądem | ![O projekcie](docs/screens/about.jpg) Strona projektu: decyzje i zawartość repo |

## Jak przetestować

Demo nie wymaga konta. Kody są celowo jawne i opisane w aplikacji
(przycisk **Instrukcja**):

- kod pracownika (życzenia): `2026`
- kod administratora: `4242`

Trzy scenariusze: złóż życzenia z profilu solenizanta, odczytaj kartkę
kodem pracownika, wejdź do sekcji Admin i dodaj albo ukryj profil.
Przycisk **Przywróć dane demo** cofa wszystkie zmiany sesji.

## Kierunek designu: kartka z sitodruku

Ciepły papier zamiast bieli, atrament zamiast czerni, malinowy akcent
marki i żółty zarezerwowany dla celebracji: dzisiejsze hero, stemple dat,
pigułki terminów do siedmiu dni. Warstwy wyglądają jak przyklejone taśmą,
a przyciski mają twardy offset zamiast rozmytych cieni.

- Krój nagłówkowy: **Unbounded Variable** dla nazw, stempli i haseł.
- Krój tekstowy: **Commissioner Variable** dla treści i formularzy.
- Tokeny OKLCH i warstwy stylów w [`src/styles`](src/styles)
  (base, pages, admin, responsive).
- Ruch tylko transform/opacity, w całości wyłączany przez
  `prefers-reduced-motion`.

## Jak demo mapuje się na pełną wersję

| Demo (to repo, w przeglądarce) | Pełna wersja (następny etap) |
|---|---|
| Wybór fikcyjnej tożsamości i jawne kody | Supabase Auth i profile połączone z pracownikami |
| Stan w `sessionStorage` z walidacją i re-seedem | Postgres z RLS, grantami kolumnowymi i ograniczonymi widokami |
| Kompresja avatara w przeglądarce (canvas, JPEG) | Storage bucket z limitem rozmiaru i ścieżką per pracownik |
| Reguła jednego wpisu rocznie liczona na kliencie | Unikalny indeks `recipient + author + rok` w bazie |
| Podgląd przypomnienia e-mail bez wysyłki | Resend uruchamiany z harmonogramu przez Supabase Edge Function |
| Ochrona ostatniego administratora w warstwie danych | Ta sama reguła jako polityka i trigger po stronie bazy |

SQL dla prawej kolumny już istnieje:
[`supabase/migrations`](supabase/migrations), a kontrakt środowiska
opisuje [`.env.example`](.env.example).

## Stack

Vite · React 19 · TypeScript (strict) · własny system CSS na tokenach
OKLCH (tooling Tailwind v4) · React Router · Vitest · oxlint ·
lucide-react · fonty variable z @fontsource. Poza Reactem, routerem
i ikonami zero zależności runtime.

## Uruchomienie lokalne

```bash
npm install
npm run dev        # http://127.0.0.1:5173
```

## Komendy

```bash
npm run dev         # serwer deweloperski
npm run typecheck   # tsc, tryb strict
npm run lint        # oxlint
npm test            # vitest
npm run build       # build produkcyjny
```

## Zmienne środowiskowe

Demo działa bez żadnych zmiennych. Plik [`.env.example`](.env.example)
opisuje kontrakt dla przyszłego adaptera Supabase i sekretów serwerowych
(Resend, service role). Nigdy nie commitować `.env` ani realnych kluczy;
wartości serwerowe nie dostają prefiksu `VITE_`.

## Testy

- `src/lib/dates.test.ts`: 29 lutego, przejście roku, rok celebracji dla
  życzeń pisanych przed terminem, etykiety dystansu, normalizacja
  polskich znaków.
- `src/lib/validation.test.ts`: limity i komunikaty pól życzeń oraz
  profilu.
- `src/data/parseDemoState.test.ts`: odrzucanie uszkodzonego stanu sesji
  (zła wersja, zepsuta data, nieznany enum, relacja do nieistniejącej
  osoby).
- `src/App.test.tsx`: celebracje, reduced motion, pełny przepływ życzeń,
  odczyt kartki, CRUD administratora z cofnięciem, ochrona ostatniego
  administratora, fallback po uszkodzonej sesji i ostrzeżenie przy
  niedziałającym zapisie.

## Dokumentacja produktu

- [Wymagania produktowe (PRD)](docs/prd.md)
- [Brief projektowy](docs/design-brief.md)
- [Design guide](docs/design-guide.md)
- [Audyt jakości](docs/audit-report.md)
- [Przewodnik Supabase](docs/supabase-guide.md)

## Nota

To nie jest zanonimizowana kopia żadnego projektu firmowego. To publiczne
demo napisane od zera, inspirowane ogólną klasą problemu: firmowe
urodziny, prywatne życzenia i lekka administracja zespołem. Wszystkie
osoby, zdjęcia i wpisy są fikcyjne.
