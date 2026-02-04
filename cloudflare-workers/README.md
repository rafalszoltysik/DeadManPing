# Cloudflare Workers Proxy for Supabase Edge Functions

Ten proxy pozwala na używanie własnej domeny (np. `api.yourdomain.com`) zamiast domyślnego URL Supabase (`xyzabc123.supabase.co/functions/v1/...`) **bez płacenia za Supabase Pro** ($25/miesiąc).

## Jak to działa?

```
Klient → api.yourdomain.com/check-timeouts
         ↓
Cloudflare Worker (ten proxy)
         ↓
xyzabc123.supabase.co/functions/v1/check-timeouts
         ↓
Odpowiedź wraca przez proxy do klienta
```

Klient nigdy nie widzi URL Supabase - widzi tylko Twoją domenę.

## Wymagania

1. **Konto Cloudflare** (darmowe) - [Zarejestruj się tutaj](https://dash.cloudflare.com/sign-up)
2. **Domena zarządzana przez Cloudflare** (lub przenieś DNS do Cloudflare)
3. **Node.js** (wersja 18 lub nowsza)
4. **Wrangler CLI** (zostanie zainstalowany automatycznie)

## Instalacja

### Krok 1: Zainstaluj zależności

```bash
cd cloudflare-workers
npm install
```

### Krok 2: Zaloguj się do Cloudflare

```bash
npx wrangler login
```

To otworzy przeglądarkę i poprosi o zalogowanie do Cloudflare.

### Krok 3: Skonfiguruj zmienne środowiskowe

Musisz ustawić dwa sekrety w Cloudflare:

```bash
# URL Twojego projektu Supabase
npx wrangler secret put SUPABASE_URL
# Wpisz: https://xyzabc123.supabase.co

# Anon key z Supabase (publiczny, bezpieczny do użycia)
npx wrangler secret put SUPABASE_ANON_KEY
# Wpisz: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Gdzie znaleźć te wartości:**
- Przejdź do [Supabase Dashboard](https://supabase.com/dashboard)
- Wybierz swój projekt
- Settings → API
- `SUPABASE_URL` = "Project URL"
- `SUPABASE_ANON_KEY` = "anon public" key

### Krok 4: Skonfiguruj domenę w `wrangler.toml`

Otwórz `wrangler.toml` i zmień:

```toml
[[routes]]
pattern = "api.yourdomain.com/*"
zone_name = "yourdomain.com"
```

Na swoją domenę, np.:

```toml
[[routes]]
pattern = "api.deadmanping.com/*"
zone_name = "deadmanping.com"
```

### Krok 5: Skonfiguruj DNS w Cloudflare

1. Przejdź do [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Wybierz swoją domenę
3. Przejdź do **DNS** → **Records**
4. Dodaj nowy rekord:
   - **Type**: `AAAA`
   - **Name**: `api` (lub inny subdomen, który chcesz użyć)
   - **IPv6 address**: `100::`
   - **Proxy status**: **Proxied** (pomarańczowa chmurka) **WAŻNE!**
   - **TTL**: Auto

> **Uwaga**: `100::` to placeholder - traffic nigdy tam nie trafi, bo Worker przechwytuje go wcześniej. Ważne jest, żeby chmurka była **pomarańczowa** (Proxied), nie szara (DNS only).

### Krok 6: Wdróż Worker

```bash
npm run deploy
```

Po wdrożeniu zobaczysz coś takiego:

```
✨  Built successfully
✨  Successfully published your Worker to the following routes:
  - api.yourdomain.com/*
```

## Testowanie

### Lokalne testowanie (przed wdrożeniem)

```bash
npm run dev
```

To uruchomi lokalny serwer. Będziesz musiał ustawić zmienne środowiskowe lokalnie:

```bash
# W terminalu (Linux/Mac)
export SUPABASE_URL="https://xyzabc123.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"

# Windows (PowerShell)
$env:SUPABASE_URL="https://xyzabc123.supabase.co"
$env:SUPABASE_ANON_KEY="your-anon-key"
```

Następnie uruchom `npm run dev` i przetestuj lokalnie.

### Testowanie po wdrożeniu

```bash
# Test prostego requestu
curl https://api.yourdomain.com/check-timeouts

# Test z metodą POST
curl -X POST https://api.yourdomain.com/check-timeouts \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Jak używać w kodzie

### Przed (z URL Supabase):

```typescript
const response = await fetch('https://xyzabc123.supabase.co/functions/v1/check-timeouts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${anonKey}`
  },
  body: JSON.stringify({ data: 'test' })
})
```

### Po (z własną domeną):

```typescript
const response = await fetch('https://api.yourdomain.com/check-timeouts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${anonKey}`
  },
  body: JSON.stringify({ data: 'test' })
})
```

**Uwaga**: Worker automatycznie dodaje `apikey` header, więc możesz pominąć `Authorization` jeśli używasz anon key.

## Struktura URL

Worker obsługuje dwa formaty URL:

1. **Krótki format**: `api.yourdomain.com/check-timeouts`
   - Automatycznie przekierowuje do `/functions/v1/check-timeouts`

2. **Pełny format**: `api.yourdomain.com/functions/v1/check-timeouts`
   - Działa bezpośrednio

## Monitoring i logi

### Zobacz logi w czasie rzeczywistym:

```bash
npm run tail
```

### Zobacz logi w Cloudflare Dashboard:

1. Przejdź do [Workers Dashboard](https://dash.cloudflare.com)
2. Wybierz swojego Workera (`supabase-api-proxy`)
3. Kliknij **Logs**

## Koszty

| Plan | Miesięczny koszt | Limit requestów |
|------|------------------|-----------------|
| Cloudflare Workers Free | **$0** | 100,000/dzień |
| Cloudflare Workers Paid | $5 | 10M/miesiąc |

**Porównanie z Supabase Pro:**
- Supabase Pro: $25/miesiąc + $10/miesiąc za custom domain = **$35/miesiąc**
- Cloudflare Workers Free: **$0/miesiąc** (do 100k requestów/dzień)

Jeśli przekroczysz 100k requestów/dzień, prawdopodobnie już zarabiasz i $5/miesiąc to nic.

## Rozwiązywanie problemów

### Problem: "Worker not found" lub 404

**Rozwiązanie:**
1. Sprawdź, czy DNS record ma **pomarańczową chmurkę** (Proxied)
2. Sprawdź, czy route w `wrangler.toml` jest poprawny
3. Poczekaj kilka minut na propagację DNS

### Problem: "Unauthorized" lub 401

**Rozwiązanie:**
1. Sprawdź, czy `SUPABASE_ANON_KEY` jest poprawnie ustawiony:
   ```bash
   npx wrangler secret list
   ```
2. Jeśli nie ma, ustaw ponownie:
   ```bash
   npx wrangler secret put SUPABASE_ANON_KEY
   ```

### Problem: CORS errors

**Rozwiązanie:**
Worker automatycznie dodaje CORS headers. Jeśli nadal masz problemy:
1. Sprawdź, czy wysyłasz `OPTIONS` request (preflight)
2. Sprawdź logi: `npm run tail`

### Problem: Worker nie działa lokalnie

**Rozwiązanie:**
Upewnij się, że zmienne środowiskowe są ustawione w terminalu przed uruchomieniem `npm run dev`.

## Aktualizacja Workera

Po zmianach w kodzie:

```bash
npm run deploy
```

## Migracja z Supabase URL

Jeśli masz już kod używający Supabase URL:

1. Znajdź wszystkie wystąpienia:
   ```bash
   grep -r "supabase.co/functions" .
   ```

2. Zamień na swoją domenę:
   ```typescript
   // Przed
   const SUPABASE_FUNCTIONS_URL = 'https://xyzabc123.supabase.co/functions/v1'
   
   // Po
   const SUPABASE_FUNCTIONS_URL = 'https://api.yourdomain.com'
   ```

3. Zaktualizuj wszystkie wywołania API

## Bezpieczeństwo

- `SUPABASE_ANON_KEY` jest bezpieczny do użycia publicznie (respektuje RLS)
- Worker automatycznie dodaje `apikey` header
- CORS headers są konfigurowalne (domyślnie `*`, możesz zmienić w kodzie)
- **NIE** używaj `SUPABASE_SERVICE_ROLE_KEY` w Workerze - to klucz z pełnymi uprawnieniami!

## Wsparcie

Jeśli masz problemy:
1. Sprawdź logi: `npm run tail`
2. Sprawdź [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
3. Sprawdź [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)

---

**Gotowe!** Teraz masz własną domenę dla Supabase Edge Functions za darmo! 🎉

