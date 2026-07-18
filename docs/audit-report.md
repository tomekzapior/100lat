# Audyt jakości — Sto lat!

Data: 18 lipca 2026  
Zakres: aplikacja React, tryb demo, dokumentacja, responsywność i build produkcyjny.

## Metoda

Audyt wykonano po zamknięciu głównych funkcji i po dwóch niezależnych
przeglądach UX. Obejmował:

- ręczny skan semantyki, ARIA, formularzy, focusu, animacji i tokenów,
- porównanie implementacji z `docs/design-guide.md`,
- zrzuty i pomiary przy 1916 × 1007 oraz 1440 × 900,
- emulację widoku 390 × 844 i kontrolę 320 px,
- przejście mobilnego admina z automatycznym focusem na edytor,
- testy kontrastu kanonicznych par kolorów,
- lint, TypeScript, 15 testów jednostkowych/integracyjnych i build Vite,
- skan repozytorium pod kątem sekretów, danych i nazw z aplikacji wzorcowej.

CLI `impeccable` został uruchomiony trzykrotnie, również po zaakceptowaniu
instalacji, ale nie zwrócił wyniku przed limitem czasu. Nie przypisano mu
niezweryfikowanych ustaleń; zastąpiły go dwa niezależne przeglądy i ręczny skan
deterministycznych antywzorców.

## Audit Health Score

| # | Wymiar | Wynik | Najważniejsze ustalenie |
| --- | --- | ---: | --- |
| 1 | Accessibility | 4/4 | Semantyczne formularze, skip link, focus management, AA i jawne statusy |
| 2 | Performance | 3/4 | 314 kB JS przed gzipem, lokalne fonty i kontrolowane limity c{stek Canvas |
| 3 | Responsive Design | 4/4 | Brak overflow przy 320 px, etykiety mobile i cele dotykowe min. 44 px |
| 4 | Theming | 4/4 | Jeden celowy jasny motyw, OKLCH i scentralizowane tokeny |
| 5 | Anti-Patterns | 4/4 | Brak glassmorphismu, gradient text, neonowego dark UI i dashboardowej siatki kart |
| **Razem** |  | **19/20** | **Excellent — minor polish** |

## Anti-Patterns Verdict

**Pass.** Interfejs nie wygląda jak generyczna realizacja AI. Metafora kartki,
sitodruk, stempel, asymetria i typografia tworzą rozpoznawalny język. Gradient
występuje wyłącznie w funkcjonalnym szkielecie ładowania. Po audycie usunięto
dekoracyjny side-stripe i szablonową siatkę 2×2 ze strony projektu.

## Executive Summary

- wynik: **19/20**,
- otwarte problemy: **P0 0 / P1 0 / P2 0 / P3 2**,
- wszystkie wykryte naruszenia AA, mobile i focusu zostały poprawione,
- główne flow jest w pełni pokryte testami integracyjnymi,
- build nie zawiera danych, sekretów ani firmowych assetów.

## Rewizja „wow pass”

- Zachowanie scen celebracyjnych porównano z aplikacją referencyjną. Home używa
  ciągłego konfetti Canvas 2D, a dzisiejszy profil uruchamia sekwencje
  fajerwerków z kilkoma typami eksplozji.
- Efekty mają limity cząstek, DPR ograniczony do 2, pauzę dla ukrytej karty,
  pełny cleanup oraz wariant bez animacji dla `prefers-reduced-motion`.
- Desktopowy Home przebudowano na rozkładówkę 7/5. Przy 1916 × 1007 i
  1440 × 900 cała treść mieści się bez pionowego i poziomego scrolla.
- Usunięto obie wyszukiwarki: przy ośmiu profilach zajmowały miejsce bez
  skracania realnej ścieżki użytkownika.
- Profil zmniejszono do jednej zwartej karty; „Jan Krawiec” pozostaje w jednym
  wierszu, a widok 390 px nie ma poziomego overflow.
- „O projekcie” używa zwartej redakcyjnej rozkładówki: hero i cztery decyzje
  są widoczne w pierwszym ekranie 1916 × 1007, a końcowe CTA nie konkuruje z hero.
- Admin ma osobną gęstość dla katalogu i edycji. Na 390 × 844 pierwszy profil
  kończy się przed dolną krawędzią viewportu; desktopowy edytor przejmuje szerszą
  kolumnę i nie ma poziomego overflow.

## Naprawione ustalenia

### P1

1. Podniesiono kontrast tekstów na `sun` i `mint`; pary używane w UI mają
   minimum 4.5:1.
2. Mobilny admin przenosi edytor przed katalog, przewija do niego i fokusuje
   nagłówek; zamknięcie oraz zapis przywracają focus do wyzwalacza.
3. Zmiana trasy fokusuje główną treść, a otwarcie flow życzeń fokusuje opisany
   region.
4. Etykiety nawigacji i znacznik demo pozostają widoczne przy 320 px.
5. Reset z panelu instrukcji wymaga osobnego potwierdzenia.

### P2

1. Wszystkie cele interaktywne mają minimum 44 × 44 px.
2. Każdy krok pisania życzeń ma bezpośredni powrót do profilu, a błędy pól
   znikają po rozpoczęciu korekty.
3. Konfetti i fajerwerki działają wyłącznie w kontekście dzisiejszych urodzin,
   respektują `prefers-reduced-motion` i pauzują poza aktywną kartą.
4. Data profilu używa elementu `time`, a techniczny skrót MM-DD zastąpiono
   naturalną instrukcją.
5. Dodano wsparcie `forced-colors` i `100svh`.

## Pozostałe ustalenia

### P3 — testy asystujące wymagają jeszcze realnych urządzeń

**Kategoria:** Accessibility / Responsive  
**Wpływ:** automaty i emulacja nie zastępują pełnego przejścia VoiceOver/NVDA
oraz fizycznego telefonu.  
**Rekomendacja:** przed publiczną premierą wykonać krótkie przejście
klawiaturą, NVDA i Safari iOS.

### P3 — duży arkusz semantycznego CSS

**Lokalizacja:** `src/index.css`  
**Kategoria:** Performance / Maintainability  
**Wpływ:** nie pogarsza obecnie czasu działania, ale kolejne funkcje mogą
zwiększać ryzyko dryfu komponentów.  
**Rekomendacja:** przy następnym większym wydaniu podzielić style według
warstw: tokens, primitives, pages i responsive.

## Pozytywne ustalenia

- naturalny polski język i konkretne recovery w błędach,
- progressive disclosure w dwuetapowym formularzu życzeń,
- miękkie ukrywanie profilu z akcją „Cofnij”,
- natywny dialog z przywróceniem focusu,
- brak zewnętrznych requestów w trybie demo,
- syntetyczny seed zależny od bieżącej daty,
- RLS i ograniczone widoki opisane w migracji Supabase,
- osobne stany loading, empty, error, duplicate, confirm i success,
- Netlify SPA redirect, nagłówki bezpieczeństwa i workflow CI.

## Rekomendowane działania

1. **P3 `/audit`** — powtórzyć po podłączeniu produkcyjnego adaptera danych.
2. **P3 `/polish`** — wykonać ostatni real-device pass przed publikacją.

Po obecnym `/polish` aplikacja spełnia ustalony poziom portfolio-ready.

## Aneks: drugi audyt i poprawki (18 lipca 2026, wieczór)

Niezależny przegląd kodu (Codex) ocenił wersję po redesignie na 16/20
i wskazał 1×P1, 7×P2 i 3×P3. Najważniejsze ustalenia zostały wdrożone
tego samego dnia:

- **P1, zapis zdjęć:** avatar jest zmniejszany w przeglądarce do 512 px
  i zapisywany jako JPEG (typowo 30-60 KB zamiast do ~2,7 MB base64),
  a błąd zapisu `sessionStorage` pokazuje trwałe ostrzeżenie zamiast
  fałszywego sukcesu. Zweryfikowane na żywym flow: 255 KB pliku
  wejściowego kończy jako 39 KB w stanie sesji.
- **P2, granica danych:** `parseDemoState` waliduje każdą osobę i każde
  życzenie (format daty, enumy, relacje, unikalność id) i przy uszkodzonym
  stanie wraca do seeda.
- **P2, ostatni administrator:** odebranie roli w edycji jest blokowane tą
  samą regułą co ukrycie profilu, z komunikatem w formularzu.
- **P2, granica roku:** życzenia zapisują rok najbliższej celebracji
  odbiorcy (`getCelebrationYear`), więc wpis z 31 grudnia na styczniowe
  urodziny nie znika po północy.
- **P2, obietnica adaptera:** projekt jest jawnie demo-only. Nieużywany
  klient `@supabase/supabase-js` usunięty, `.env.example` i przewodnik
  Supabase opisują kontrakt jako docelowy, nie istniejący przełącznik.
- **P2, wielkość plików:** `index.css` podzielony na warstwy
  `src/styles/{base,pages,admin,responsive}.css`; z `AdminPage` wydzielone
  `AdminGate`, `ReminderPreview` i `ResetConfirmPanel`.
- **P2, testy:** pokrycie wzrosło z 15 do 26 testów: CRUD administratora
  z cofnięciem, ochrona ostatniego administratora, uszkodzona sesja,
  awaria zapisu, rok celebracji i walidacja stanu.
- **P2/P3, dostępność i konfiguracja:** pola wymagane mają `required`,
  licznik znaków nie odzywa się po każdym klawiszu, mobilna nawigacja
  ma 0.7 rem zamiast 0.6 rem, przyciski dostały stan `:active`,
  a TypeScript działa z włączonym `strict`.

Świadomie odłożone: dekompozycja silnika `Fireworks.tsx` i wewnętrzny
podział `PersonEditor.tsx` (spójne, izolowane moduły; refaktor bez zmiany
zachowania ma niższy priorytet niż publikacja) oraz konfiguracja
formattera.
