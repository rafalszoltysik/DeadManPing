# Konfiguracja generowania typów na Vercel

## Automatyczne generowanie typów podczas builda

Typy są automatycznie generowane przed każdym buildem dzięki `prebuild` script w `package.json`.

## Wymagane zmienne środowiskowe w Vercel

Aby generowanie typów działało na Vercel, musisz dodać następującą zmienną środowiskową:

### SUPABASE_ACCESS_TOKEN

1. **Pobierz token:**
   - Przejdź do: https://supabase.com/dashboard/account/tokens
   - Kliknij "Generate new token"
   - Skopiuj wygenerowany token

2. **Dodaj do Vercel:**
   - Przejdź do: https://vercel.com/dashboard → Twój projekt → Settings → Environment Variables
   - Dodaj zmienną:
     - **Name:** `SUPABASE_ACCESS_TOKEN`
     - **Value:** (wklej token)
     - **Environment:** Production, Preview, Development (zaznacz wszystkie)

3. **Redeploy:**
   - Po dodaniu zmiennej, zrób redeploy projektu
   - Typy będą automatycznie generowane podczas builda

## Jak to działa

1. `prebuild` script uruchamia się automatycznie przed `npm run build`
2. Skrypt `generate-types.ts` sprawdza czy `SUPABASE_ACCESS_TOKEN` jest ustawiony
3. Jeśli tak, używa tokenu do autentykacji zamiast wymagać logowania
4. Typy są generowane i zapisywane do `lib/types/database.ts`
5. Następnie uruchamia się normalny build Next.js

## Alternatywa: Ręczne generowanie typów

Jeśli nie chcesz automatycznego generowania podczas builda:

1. Usuń `prebuild` script z `package.json`
2. Generuj typy lokalnie po każdej migracji
3. Commit i push wygenerowanych typów do repozytorium

## Troubleshooting

### Błąd: "Failed to generate types automatically"

**Przyczyna:** Brak `SUPABASE_ACCESS_TOKEN` lub nieprawidłowy token

**Rozwiązanie:**
1. Sprawdź czy token jest ustawiony w Vercel Environment Variables
2. Upewnij się, że token jest ważny (nie wygasł)
3. Wygeneruj nowy token jeśli potrzeba

### Typy nie są aktualizowane

**Przyczyna:** Typy są generowane tylko podczas builda, nie po każdej migracji

**Rozwiązanie:**
- Po każdej migracji bazy danych, zrób redeploy na Vercel
- Lub generuj typy lokalnie i commit do repozytorium

