# Instrukcja - Cloudflare Workers Proxy dla Supabase

## Co zostało zaimplementowane?

Stworzyłem kompletny system proxy, który pozwala na używanie własnej domeny (np. `api.deadmanping.com`) zamiast domyślnego URL Supabase (`xyzabc123.supabase.co/functions/v1/...`) **bez płacenia za Supabase Pro**.

### Struktura plików:

```
cloudflare-workers/
├── src/
│   └── index.ts          # Główny kod Workera (proxy)
├── wrangler.toml         # Konfiguracja Cloudflare
├── package.json          # Zależności i skrypty
├── tsconfig.json         # Konfiguracja TypeScript
├── .gitignore           # Pliki do ignorowania
├── README.md            # Pełna dokumentacja (EN)
├── QUICK_START.md       # Szybki start (EN)
└── INSTRUKCJA_PL.md     # Ta instrukcja
```

## Co musisz zrobić jako użytkownik?

### Krok 1: Przygotowanie

1. **Miej konto Cloudflare** (darmowe)
   - Jeśli nie masz: [Zarejestruj się](https://dash.cloudflare.com/sign-up)

2. **Miej domenę zarządzaną przez Cloudflare**
   - Jeśli domena jest gdzie indziej, przenieś DNS do Cloudflare (darmowe)
   - Lub dodaj domenę do Cloudflare

3. **Zainstaluj Node.js** (jeśli nie masz)
   - Wersja 18 lub nowsza
   - Sprawdź: `node --version`

### Krok 2: Instalacja

```bash
cd cloudflare-workers
npm install
```

To zainstaluje:
- `wrangler` (CLI do zarządzania Workers)
- `@cloudflare/workers-types` (typy TypeScript)
- `typescript`

### Krok 3: Logowanie do Cloudflare

```bash
npx wrangler login
```

To otworzy przeglądarkę i poprosi o zalogowanie. Po zalogowaniu możesz zamknąć przeglądarkę.

### Krok 4: Konfiguracja zmiennych środowiskowych

Musisz ustawić dwa sekrety w Cloudflare:

#### 4a. SUPABASE_URL

```bash
npx wrangler secret put SUPABASE_URL
```

Gdy zostaniesz zapytany, wpisz URL Twojego projektu Supabase:
```
https://xyzabc123.supabase.co
```

**Gdzie to znaleźć:**
1. Przejdź do [Supabase Dashboard](https://supabase.com/dashboard)
2. Wybierz swój projekt
3. **Settings** → **API**
4. Skopiuj "Project URL"

#### 4b. SUPABASE_ANON_KEY

```bash
npx wrangler secret put SUPABASE_ANON_KEY
```

Gdy zostaniesz zapytany, wpisz anon key:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYzEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjM4OTg3NjU0LCJleHAiOjE5NTQ1NjM2NTR9.xyz...
```

**Gdzie to znaleźć:**
- W tym samym miejscu co SUPABASE_URL
- "anon public" key (to jest bezpieczny klucz publiczny)

### Krok 5: Konfiguracja domeny

Otwórz plik `wrangler.toml` i zmień:

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

**Uwaga:** Jeśli chcesz użyć innego subdomeny (nie `api`), zmień to również w DNS (Krok 6).

### Krok 6: Konfiguracja DNS w Cloudflare

1. Przejdź do [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Wybierz swoją domenę
3. Przejdź do **DNS** → **Records**
4. Kliknij **Add record**
5. Wypełnij:
   - **Type**: `AAAA`
   - **Name**: `api` (lub inny subdomen, który chcesz użyć)
   - **IPv6 address**: `100::`
   - **Proxy status**: **Proxied** (pomarańczowa chmurka) **TO JEST WAŻNE!**
   - **TTL**: Auto
6. Kliknij **Save**

> **Dlaczego `100::`?** To placeholder IPv6. Traffic nigdy tam nie trafi, bo Cloudflare Worker przechwytuje go wcześniej. Ważne jest, żeby chmurka była **pomarańczowa** (Proxied), nie szara (DNS only).

### Krok 7: Wdrożenie

```bash
npm run deploy
```

Po wdrożeniu zobaczysz coś takiego:

```
✨  Built successfully
✨  Successfully published your Worker to the following routes:
  - api.deadmanping.com/*
```

**Gotowe!** 🎉

## Testowanie

### Lokalne testowanie (przed wdrożeniem)

```bash
# Ustaw zmienne środowiskowe (Linux/Mac)
export SUPABASE_URL="https://xyzabc123.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"

# Windows PowerShell
$env:SUPABASE_URL="https://xyzabc123.supabase.co"
$env:SUPABASE_ANON_KEY="your-anon-key"

# Uruchom lokalny serwer
npm run dev
```

### Testowanie po wdrożeniu

```bash
# Test prostego requestu
curl https://api.deadmanping.com/check-timeouts

# Test z metodą POST
curl -X POST https://api.deadmanping.com/check-timeouts \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Jak używać w kodzie

### Przed (z URL Supabase):

```typescript
const response = await fetch(
  'https://xyzabc123.supabase.co/functions/v1/check-timeouts',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`
    },
    body: JSON.stringify({ data: 'test' })
  }
)
```

### Po (z własną domeną):

```typescript
const response = await fetch(
  'https://api.deadmanping.com/check-timeouts',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`
    },
    body: JSON.stringify({ data: 'test' })
  }
)
```

**Uwaga:** Worker automatycznie dodaje `apikey` header, więc możesz pominąć `Authorization` jeśli używasz anon key.

## Struktura URL

Worker obsługuje dwa formaty:

1. **Krótki**: `api.deadmanping.com/check-timeouts`
   - Automatycznie przekierowuje do `/functions/v1/check-timeouts`

2. **Pełny**: `api.deadmanping.com/functions/v1/check-timeouts`
   - Działa bezpośrednio

## Monitoring

### Zobacz logi w czasie rzeczywistym:

```bash
npm run tail
```

### Zobacz logi w Cloudflare Dashboard:

1. [Workers Dashboard](https://dash.cloudflare.com)
2. Wybierz `supabase-api-proxy`
3. Kliknij **Logs**

## Rozwiązywanie problemów

### Problem: "Worker not found" lub 404

**Rozwiązanie:**
1. Sprawdź, czy DNS record ma **pomarańczową chmurkę** (Proxied)
2. Sprawdź, czy route w `wrangler.toml` jest poprawny
3. Poczekaj kilka minut na propagację DNS (zwykle 1-2 minuty)

### Problem: "Unauthorized" lub 401

**Rozwiązanie:**
1. Sprawdź sekrety:
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

## Koszty

| Plan | Miesięczny koszt | Limit requestów |
|------|------------------|-----------------|
| **Cloudflare Workers Free** | **$0** | 100,000/dzień |
| Cloudflare Workers Paid | $5 | 10M/miesiąc |

**Porównanie:**
- Supabase Pro + Custom Domain: **$35/miesiąc**
- Cloudflare Workers Free: **$0/miesiąc** (do 100k/dzień)

Jeśli przekroczysz 100k requestów/dzień, prawdopodobnie już zarabiasz i $5/miesiąc to nic.

## Aktualizacja

Po zmianach w kodzie:

```bash
npm run deploy
```

## Bezpieczeństwo

- `SUPABASE_ANON_KEY` jest bezpieczny do użycia publicznie (respektuje RLS)
- Worker automatycznie dodaje `apikey` header
- CORS headers są konfigurowalne (domyślnie `*`)
- **NIE** używaj `SUPABASE_SERVICE_ROLE_KEY` - to klucz z pełnymi uprawnieniami!

## Wsparcie

Jeśli masz problemy:
1. Sprawdź logi: `npm run tail`
2. Sprawdź [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
3. Sprawdź [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)

---

**Gotowe!** Teraz masz własną domenę dla Supabase Edge Functions za darmo! 🎉

