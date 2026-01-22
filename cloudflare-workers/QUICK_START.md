# Szybki Start - Cloudflare Workers Proxy

## TL;DR - Co musisz zrobić:

### 1. Zainstaluj zależności
```bash
cd cloudflare-workers
npm install
```

### 2. Zaloguj się do Cloudflare
```bash
npx wrangler login
```

### 3. Ustaw sekrety
```bash
npx wrangler secret put SUPABASE_URL
# Wpisz: https://TWÓJ_PROJEKT.supabase.co

npx wrangler secret put SUPABASE_ANON_KEY
# Wpisz: twój_anon_key_z_supabase
```

### 4. Edytuj `wrangler.toml`
Zmień `yourdomain.com` na swoją domenę:
```toml
[[routes]]
pattern = "api.TWOJA_DOMENA.com/*"
zone_name = "TWOJA_DOMENA.com"
```

### 5. Skonfiguruj DNS w Cloudflare
- Przejdź do Cloudflare Dashboard → DNS → Records
- Dodaj rekord:
  - Type: `AAAA`
  - Name: `api`
  - IPv6: `100::`
  - Proxy: **ON** (pomarańczowa chmurka) ⚠️

### 6. Wdróż
```bash
npm run deploy
```

**Gotowe!** 🎉

Teraz możesz używać `https://api.TWOJA_DOMENA.com/check-timeouts` zamiast `https://xyzabc123.supabase.co/functions/v1/check-timeouts`

---

## Gdzie znaleźć wartości Supabase?

1. [Supabase Dashboard](https://supabase.com/dashboard)
2. Wybierz projekt
3. **Settings** → **API**
4. **Project URL** = `SUPABASE_URL`
5. **anon public** key = `SUPABASE_ANON_KEY`

---

## Testowanie

```bash
# Lokalnie
npm run dev

# Po wdrożeniu
curl https://api.TWOJA_DOMENA.com/check-timeouts
```

---

## Problemy?

- **404?** Sprawdź, czy DNS ma pomarańczową chmurkę (Proxied)
- **401?** Sprawdź sekrety: `npx wrangler secret list`
- **CORS?** Worker automatycznie dodaje CORS headers

Więcej w [README.md](./README.md)

