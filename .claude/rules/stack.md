# Stack i architektura

React 19 + Vite 8 + TypeScript 6 + własny system CSS + Supabase.

- Frontend: React, Vite i TypeScript. Produkcyjny interfejs używa semantycznych klas oraz tokenów z `src/index.css`; Tailwind 4 pozostaje dostępny jako tooling, ale nie należy dublować istniejącego systemu utility classes.
- Baza: Supabase Postgres. Dostęp do danych kontrolują RLS i funkcje serwerowe.
- Demo: lokalny adapter danych z danymi syntetycznymi. Nie wymaga sekretów ani konta.
- Hosting: Netlify dla frontu, Supabase dla bazy i auth.
- Komendy: `npm run dev`, `npm run build`, `npm run lint`, `npm run test`.
- Kod dzielony według funkcji: `features`, `components`, `lib`, `data`, `types`.
- Priorytetem jest działająca aplikacja i czytelny kod. Commit dopiero na wyraźne polecenie.
