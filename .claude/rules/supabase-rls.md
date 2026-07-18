# Bezpieczeństwo Supabase

RLS kontroluje wiersze, nie kolumny. Przy tabelach z kolumnami nadającymi uprawnienia ustaw także granty kolumnowe.

```sql
revoke all on public.<tabela> from anon;
revoke all on public.<tabela> from authenticated;
grant select on public.<tabela> to authenticated;
-- opcjonalnie: grant update (bezpieczne_kolumny) on public.<tabela> to authenticated;
```

Zasady:

- RLS włączone na każdej tabeli w schemacie `public`, domyślnie deny.
- Klucz anon jest publiczny. Bezpieczeństwo opiera się na RLS, nie na ukrywaniu klucza.
- Klucz `service_role` nigdy nie trafia do frontu ani zmiennej z prefiksem `VITE_`.
- Sekrety do Resend i operacji administracyjnych działają tylko po stronie serwera.
- Publiczny widok pracowników zwraca wyłącznie bezpieczne kolumny. Bez roku urodzenia, e-maila, roli i danych do odzyskiwania dostępu.
- Testy negatywne RLS sprawdzają dostęp obcego użytkownika do cudzych danych.
