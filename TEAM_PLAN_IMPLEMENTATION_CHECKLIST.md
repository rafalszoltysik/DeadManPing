# Team Plan Implementation Checklist

## ✅ Co już mamy (gotowe):

1. **Email alerts** - ✓ Działa w `lib/alerts.ts`
2. **Slack integration** - ✓ Działa w `lib/alerts.ts` i `components/SettingsForm.tsx`
3. **Discord integration** - ✓ Działa w `lib/alerts.ts` i `components/SettingsForm.tsx`
4. **Podstawowe monitorowanie** - ✓ Wszystkie podstawowe funkcje działają

---

## ❌ Co trzeba dodać dla planu Team:

### 1. **Plan "team" w bazie danych i limitach**
   - [ ] Dodać `'team'` do `subscription_tier` CHECK constraint w `profiles` table
   - [ ] Dodać `team` do `TIER_LIMITS` w `lib/limits.ts`:
     ```typescript
     team: {
       monitors: 500,
       minInterval: 30, // 30 seconds
     }
     ```
   - [ ] Dodać plan Team do `PRICING_PLANS` w `lib/stripe.ts`
   - [ ] Utworzyć price w Stripe Dashboard i dodać `STRIPE_PRICE_ID_TEAM` do env

### 2. **30-sekundowy interwał**
   - [ ] Zaktualizować walidację w `app/dashboard/monitors/new/page.tsx` (obecnie minimum to 60s)
   - [ ] Zaktualizować `expected_interval_seconds` CHECK constraint w bazie (obecnie `>= 60`)
   - [ ] Zaktualizować komunikat błędu w limitach

### 3. **Custom Webhooks (dla Team planu)**
   - [ ] Dodać kolumnę `custom_webhook_url` do tabeli `profiles`
   - [ ] Dodać pole w `components/SettingsForm.tsx` (tylko dla Team planu)
   - [ ] Dodać obsługę custom webhooków w `lib/alerts.ts`
   - [ ] Dodać walidację URL w `lib/webhooks-validator.ts`

### 4. **API Access (REST API dla monitorów)**
   - [ ] Utworzyć endpoint `/api/v1/monitors` (GET - lista, POST - create)
   - [ ] Utworzyć endpoint `/api/v1/monitors/[id]` (GET, PUT, DELETE)
   - [ ] Utworzyć endpoint `/api/v1/monitors/[id]/pings` (GET - historia)
   - [ ] Dodać autentykację API (API keys w tabeli `api_keys`)
   - [ ] Dodać rate limiting per tier (wyższe limity dla Team)
   - [ ] Dodać dokumentację API

### 5. **Zaawansowana Analityka**
   - [ ] Dodać wykresy uptime (wykres liniowy z historią statusów)
   - [ ] Dodać statystyki: uptime %, średni czas między pingami, success rate
   - [ ] Dodać eksport danych (CSV/JSON)
   - [ ] Dodać filtry czasowe (ostatni dzień/tydzień/miesiąc)
   - [ ] Dodać komponent `AnalyticsDashboard` w `components/`

### 6. **Priorytetowe wsparcie**
   - [ ] Dodać flagę `priority_support: true` dla Team planu (tylko informacyjne)
   - [ ] Można dodać badge w UI

### 7. **Wyższe limity API**
   - [ ] Dodać rate limiting per tier:
     - Solo: 100 req/hour
     - Agency: 500 req/hour  
     - Team: 2000 req/hour
   - [ ] Dodać middleware do API endpoints

### 8. **UI/UX dla Team planu**
   - [ ] Dodać przycisk "Team - $99/mo" w `components/SettingsForm.tsx`
   - [ ] Dodać Team plan do `app/page.tsx` (pricing section)
   - [ ] Zaktualizować `app/dashboard/billing/page.tsx`
   - [ ] Dodać wskaźniki premium features w dashboardzie

---

## 📋 Priorytety implementacji:

### Faza 1 (Minimum Viable - żeby móc sprzedać plan):
1. ✅ Dodać plan "team" do bazy i limitów (500 monitorów, 30s interwał)
2. ✅ Dodać do Stripe i billing
3. ✅ Zaktualizować walidację interwałów
4. ✅ Dodać do UI (pricing page, billing page)

### Faza 2 (Core features):
5. ✅ Custom webhooks
6. ✅ Podstawowe API (GET monitors, GET pings)
7. ✅ Podstawowa analityka (uptime %, wykres)

### Faza 3 (Premium features):
8. ✅ Pełne REST API (CRUD)
9. ✅ Zaawansowana analityka (eksport, filtry)
10. ✅ Rate limiting per tier

---

## 🔧 Pliki do modyfikacji:

1. `supabase/migrations/004_add_team_plan.sql` - nowa migracja
2. `lib/limits.ts` - dodać team tier
3. `lib/stripe.ts` - dodać team plan
4. `app/dashboard/monitors/new/page.tsx` - walidacja 30s
5. `components/SettingsForm.tsx` - custom webhooks
6. `lib/alerts.ts` - obsługa custom webhooks
7. `app/api/v1/` - nowe API endpoints
8. `app/page.tsx` - pricing section
9. `app/dashboard/billing/page.tsx` - team plan
10. `components/AnalyticsDashboard.tsx` - nowy komponent

---

## ⚠️ Uwagi:

- **30-sekundowy interwał** wymaga zmiany w bazie (CHECK constraint)
- **Custom webhooks** - można zacząć od prostego pola URL, później dodać więcej opcji
- **API** - można zacząć od prostego GET, później rozszerzyć
- **Analityka** - można użyć biblioteki jak `recharts` lub `chart.js`

