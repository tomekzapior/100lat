# bdayapp - kontekst projektu

Portfolio-demo aplikacji dla zespołu, które pokazuje nadchodzące urodziny, przypomina o nich i pozwala składać prywatne życzenia.

## Stack

React 19 + Vite 8 + TypeScript 6 + semantyczny system CSS (tooling Tailwind CSS 4) + Supabase.
Hosting: Netlify. Repo: GitHub. Baza i auth: Supabase (Postgres, RLS, Storage, Edge Functions). Tryb demo działa bez zewnętrznej bazy i używa wyłącznie danych syntetycznych.

## Komendy

- `npm run dev` - lokalny dev na 127.0.0.1:5173, hot reload
- `npm run build` - build produkcyjny, uruchamiany przed commitem
- `npm run lint` - kontrola statyczna kodu
- `npm run test` - testy jednostkowe

## Konwencje

Reguły projektu znajdują się w `.claude/rules/`: stack i architektura (`stack.md`), bezpieczeństwo Supabase (`supabase-rls.md`), skalowanie Tailwind (`tailwind.md`) oraz styl tekstów PL (`styl-pl.md`).

## Dokumentacja

Źródło prawdy o produkcie: `docs/prd.md`. System wizualny: `docs/design-guide.md`. Warstwa danych: `docs/supabase-guide.md`. Materiały wizualne i ustalenia: `docs/design/`.

## Korzystanie ze skilli

Przy zadaniach produktowych, badawczych, biznesowych, designerskich i dokumentacyjnych korzystaj z zainstalowanych skilli. Pełna mapa: `docs/skills-map.md`.

- Produkt i PRD: create-prd, user-stories, shape, prioritize-features
- Discovery i research: user-personas, customer-journey-map, pre-mortem
- Design i UI: shape, frontend-design, impeccable, layout, typeset, colorize, responsive-design, critique, polish
- Teksty i legal: grammar-check, release-notes, privacy-policy
- Dane: sql-queries, dummy-dataset

## Styl tekstów

Wszystkie teksty PL, zarówno w UI, jak i dokumentacji, są konkretne i naturalne. Bez em dash, pustych superlatywów, korporacyjnych ogólników i emoji w interfejsie formalnym. Pełna lista znajduje się w `.claude/rules/styl-pl.md`.
