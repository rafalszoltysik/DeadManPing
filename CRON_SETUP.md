# Cron Job Setup Guide

## Vercel (Production)

Cron job jest już skonfigurowany w `vercel.json` i będzie automatycznie uruchamiany przez Vercel.

### Wymagane kroki:

1. **Ustaw zmienną środowiskową `CRON_SECRET` w Vercel:**
   - Przejdź do: Vercel Dashboard → Twój projekt → Settings → Environment Variables
   - Dodaj: `CRON_SECRET` = (wygeneruj losowy string, min. 64 znaki)
   - Możesz wygenerować: `openssl rand -hex 32`

2. **Wdróż aplikację:**
   - Vercel automatycznie wykryje `vercel.json` i skonfiguruje cron joby
   - Cron job będzie uruchamiany co minutę (`* * * * *`)

3. **Sprawdź czy działa:**
   - Przejdź do: Vercel Dashboard → Twój projekt → Cron Jobs
   - Powinieneś zobaczyć: `/api/cron/check-timeouts` z harmonogramem `* * * * *`
   - Sprawdź logi w Vercel Functions, aby zobaczyć czy cron job się wykonuje

## Lokalne testowanie

Aby przetestować cron job lokalnie, możesz:

### Opcja 1: Ręczne wywołanie (curl)

```bash
# Ustaw CRON_SECRET w .env.local
CRON_SECRET=your_test_secret

# Wywołaj endpoint
curl -X GET "http://localhost:3000/api/cron/check-timeouts" \
  -H "Authorization: Bearer your_test_secret"
```

### Opcja 2: Użyj node-cron do symulacji

```bash
npm install --save-dev node-cron
```

Utwórz plik `scripts/test-cron.js`:

```javascript
const cron = require('node-cron')
const fetch = require('node-fetch')

const CRON_SECRET = process.env.CRON_SECRET || 'your_test_secret'
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Uruchom co minutę (podobnie jak w produkcji)
cron.schedule('* * * * *', async () => {
  console.log('Running cron job...')
  try {
    const response = await fetch(`${BASE_URL}/api/cron/check-timeouts`, {
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`
      }
    })
    const data = await response.json()
    console.log('Cron job result:', data)
  } catch (error) {
    console.error('Cron job error:', error)
  }
})

console.log('Cron job scheduler started. Press Ctrl+C to stop.')
```

Uruchom: `node scripts/test-cron.js`

## Weryfikacja działania

1. **Sprawdź logi Vercel:**
   - Vercel Dashboard → Twój projekt → Functions → `/api/cron/check-timeouts`
   - Powinieneś widzieć wywołania co minutę

2. **Sprawdź w bazie danych:**
   - Monitor z `status = 'healthy'` i `last_ping_at` starszym niż `expected_interval_seconds + grace_period_seconds` powinien zostać zmieniony na `status = 'late'`

3. **Test ręczny:**
   - Utwórz monitor z interwałem 1 minuta
   - Poczekaj 2 minuty bez wysyłania pingu
   - Monitor powinien automatycznie zmienić status na `late`

## Troubleshooting

### Cron job nie działa:
- ✅ Sprawdź czy `CRON_SECRET` jest ustawiony w Vercel
- ✅ Sprawdź czy `vercel.json` jest w głównym katalogu projektu
- ✅ Sprawdź logi w Vercel Functions
- ✅ Upewnij się, że aplikacja jest wdrożona (nie tylko w preview)

### Cron job zwraca 401 Unauthorized:
- ✅ Sprawdź czy `CRON_SECRET` w Vercel jest taki sam jak w kodzie
- ✅ Sprawdź czy header `Authorization: Bearer {CRON_SECRET}` jest poprawny

### Monitory nie zmieniają statusu na 'late':
- ✅ Sprawdź logi cron joba - czy znajduje spóźnione monitory?
- ✅ Sprawdź czy `next_expected_ping_at` lub `last_ping_at` są poprawnie ustawione
- ✅ Sprawdź czy logika w `check-timeouts/route.ts` jest poprawna

