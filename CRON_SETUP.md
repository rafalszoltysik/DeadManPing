# Cron Job Setup Guide

## ⚠️ Ważne: Limity Vercel Cron Jobs

### Vercel Hobby Plan
- **2 cron jobs** na konto
- **Każdy cron job może być uruchomiony tylko raz dziennie** (triggered once a day)
- **Brak gwarancji dokładnego czasu** (np. `0 1 * * *` może uruchomić się między 1:00 a 1:59)

### Problem
Aplikacja **wymaga** sprawdzania timeoutów monitorów **co minutę** - to jest **krytyczne** dla działania systemu.

### Rozwiązania dla Hobby Plan

#### ✅ Opcja 1: Zewnętrzny serwis cron (ZALECANE dla Hobby)

Użyj darmowego serwisu do wywoływania endpointu. **Ważne**: Aplikacja wspiera interwały 30-sekundowe (Team plan), więc potrzebujesz **dwóch cron jobs**:

**cron-job.org** (darmowy, do 2 cron jobs):
1. Zarejestruj się na https://cron-job.org
2. Utwórz **jeden cron job** (co minutę):
   - **URL**: `https://yourdomain.com/api/cron/check-timeouts`
   - **Schedule**: `* * * * *` (co minutę - minimum w cron-job.org)
   - **Method**: GET
   - **Headers**: `Authorization: Bearer YOUR_CRON_SECRET`
3. Zapisz i aktywuj

**⚠️ Ważne - sprawdzanie co minutę dla 30s interwałów:**
- Cron-job.org pozwala minimum **1 minutę** (nie 30 sekund)
- **To jest wystarczające** nawet dla monitorów z 30s interwałem, bo:
  - Grace period daje bufor (zwykle 1 godzina = 3600s)
  - Monitor z 30s interwałem zostanie wykryty jako "late" w ciągu **~90 sekund** (30s interwał + 60s sprawdzanie)
  - To jest akceptowalne dla większości przypadków użycia
- Jeśli naprawdę potrzebujesz dokładniejszego sprawdzania (< 60s), rozważ:
  - Upgrade do Vercel Pro (unlimited cron invocations)
  - Lub użyj innego serwisu który wspiera sekundy (np. EasyCron z płatnym planem)

**EasyCron** (darmowy, do 2 cron jobs):
1. Zarejestruj się na https://www.easycron.com
2. Utwórz cron job z podobnymi ustawieniami (co minutę)

**Dlaczego sprawdzanie co minutę jest OK dla 30s interwałów:**
- Grace period (zwykle 1 godzina) daje duży bufor bezpieczeństwa
- Monitor z 30s interwałem zostanie wykryty jako "late" w ciągu **~90 sekund** (30s interwał + 60s sprawdzanie)
- To jest akceptowalne dla większości przypadków użycia
- Jeśli potrzebujesz dokładniejszego sprawdzania, rozważ upgrade do Vercel Pro

**GitHub Actions** (darmowy, unlimited dla public repos):
1. Utwórz plik `.github/workflows/cron.yml`:
```yaml
name: Check Timeouts
on:
  schedule:
    - cron: '* * * * *'  # Every minute
  workflow_dispatch:  # Allow manual trigger

jobs:
  check-timeouts:
    runs-on: ubuntu-latest
    steps:
      - name: Call API
        run: |
          curl -X GET "https://yourdomain.com/api/cron/check-timeouts" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```
2. Dodaj `CRON_SECRET` do GitHub Secrets

#### ✅ Opcja 2: Supabase pg_cron (jeśli dostępne)

Jeśli masz dostęp do pg_cron w Supabase:
1. Użyj migracji `003_schedule_cron.sql`
2. Skonfiguruj pg_cron w Supabase Dashboard
3. Ustaw wywołanie HTTP do endpointu co minutę

#### ✅ Opcja 3: Upgrade do Vercel Pro Plan

Vercel Pro plan ($20/miesiąc):
- **40 cron jobs** na konto
- **Unlimited cron invocations** (możesz uruchamiać co minutę)
- Dokładne wykonanie cron jobs

---

## Konfiguracja dla Vercel Pro Plan

Jeśli masz Vercel Pro plan, możesz użyć standardowej konfiguracji:

### Wymagane kroki:

1. **Ustaw zmienną środowiskową `CRON_SECRET` w Vercel:**
   - Przejdź do: Vercel Dashboard → Twój projekt → Settings → Environment Variables
   - Dodaj: `CRON_SECRET` = (wygeneruj losowy string, min. 64 znaki)
   - Możesz wygenerować: `openssl rand -hex 32`

2. **Skonfiguruj `vercel.json`:**
```json
{
  "crons": [
    {
      "path": "/api/cron/check-timeouts",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/check-trial-expiry",
      "schedule": "0 0 * * *"
    }
  ]
}
```

3. **Wdróż aplikację:**
   - Vercel automatycznie wykryje `vercel.json` i skonfiguruje cron jobs
   - Sprawdź w Vercel Dashboard → Cron Jobs

---

## Konfiguracja dla Vercel Hobby Plan (z zewnętrznym cron)

### Krok 1: Ustaw zmienne środowiskowe

Ustaw `CRON_SECRET` w Vercel (jak wyżej).

### Krok 2: Skonfiguruj `vercel.json` (tylko dla trial expiry)

```json
{
  "crons": [
    {
      "path": "/api/cron/check-trial-expiry",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Krok 3: Skonfiguruj zewnętrzny cron dla check-timeouts

Użyj jednej z opcji powyżej (cron-job.org, EasyCron, GitHub Actions).

---

## Lokalne testowanie

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

---

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

---

## Troubleshooting

### Cron job nie działa:
- ✅ Sprawdź czy `CRON_SECRET` jest ustawiony w Vercel
- ✅ Sprawdź czy `vercel.json` jest w głównym katalogu projektu
- ✅ Sprawdź logi w Vercel Functions
- ✅ Upewnij się, że aplikacja jest wdrożona (nie tylko w preview)
- ✅ Jeśli używasz zewnętrznego cron, sprawdź logi w serwisie (cron-job.org, EasyCron, etc.)

### Cron job zwraca 401 Unauthorized:
- ✅ Sprawdź czy `CRON_SECRET` w Vercel jest taki sam jak w kodzie
- ✅ Sprawdź czy header `Authorization: Bearer {CRON_SECRET}` jest poprawny
- ✅ Sprawdź czy zewnętrzny serwis wysyła poprawny header

### Monitory nie zmieniają statusu na 'late':
- ✅ Sprawdź logi cron joba - czy znajduje spóźnione monitory?
- ✅ Sprawdź czy `next_expected_ping_at` lub `last_ping_at` są poprawnie ustawione
- ✅ Sprawdź czy logika w `check-timeouts/route.ts` jest poprawna
- ✅ Sprawdź czy cron job faktycznie się wykonuje (sprawdź logi)

### Vercel Hobby plan - cron uruchamia się tylko raz dziennie:
- ⚠️ To jest limit planu Hobby - użyj zewnętrznego serwisu cron (cron-job.org, EasyCron, GitHub Actions)
- ⚠️ Lub rozważ upgrade do Vercel Pro plan ($20/miesiąc)
