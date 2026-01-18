# 🎯 Przewodnik konfiguracji Stripe dla DeadManPing

## Krok 1: Pobierz klucze API z Stripe Dashboard

1. **Zaloguj się** do [Stripe Dashboard](https://dashboard.stripe.com)
2. Przejdź do **Developers > API keys**
3. Upewnij się że jesteś w trybie **Test mode** (przełącznik w prawym górnym rogu)
4. Skopiuj:
   - **Publishable key** (zaczyna się od `pk_test_...`)
   - **Secret key** (zaczyna się od `sk_test_...`) - kliknij "Reveal test key"

---

## Krok 2: Utwórz produkty i ceny

### Produkt 1: Solo Plan ($14/month)

1. Przejdź do **Products** w lewym menu
2. Kliknij **"+ Add product"**
3. Wypełnij formularz:
   - **Name**: `Solo Plan`
   - **Description**: `20 monitors, 5 minute minimum interval, Email alerts`
   - **Pricing model**: `Standard pricing`
   - **Price**: `14.00`
   - **Currency**: `USD`
   - **Billing period**: `Monthly`
   - **Recurring**: ✅ (zaznacz)
4. Kliknij **"Save product"**
5. **WAŻNE**: Skopiuj **Price ID** (zaczyna się od `price_...`) - będzie potrzebny później!

### Produkt 2: Agency Plan ($49/month)

1. Kliknij **"+ Add product"** ponownie
2. Wypełnij formularz:
   - **Name**: `Agency Plan`
   - **Description**: `100 monitors, 1 minute minimum interval, Email alerts, Slack/Discord integrations`
   - **Pricing model**: `Standard pricing`
   - **Price**: `49.00`
   - **Currency**: `USD`
   - **Billing period**: `Monthly`
   - **Recurring**: ✅ (zaznacz)
3. Kliknij **"Save product"**
4. **WAŻNE**: Skopiuj **Price ID** (zaczyna się od `price_...`)

---

## Krok 3: Skonfiguruj Webhook

### Dla lokalnego developmentu (używając Stripe CLI):

1. **Zainstaluj Stripe CLI** (jeśli nie masz):
   ```bash
   # Windows (używając Scoop lub Chocolatey)
   # Lub pobierz z: https://stripe.com/docs/stripe-cli
   ```

2. **Zaloguj się do Stripe CLI**:
   ```bash
   stripe login
   ```

3. **Uruchom webhook forwarding** (w osobnym terminalu):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Skopiuj webhook signing secret** - pojawi się w terminalu jako `whsec_...`

### Dla produkcji (Vercel):

1. Przejdź do **Developers > Webhooks** w Stripe Dashboard
2. Kliknij **"+ Add endpoint"**
3. Wypełnij:
   - **Endpoint URL**: `https://deadmanping.com/api/webhooks/stripe`
   - **Events to send**: Wybierz:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
4. Kliknij **"Add endpoint"**
5. **Skopiuj Signing secret** (kliknij na endpoint → "Reveal" → skopiuj `whsec_...`)

---

## Krok 4: Dodaj zmienne do `.env.local`

Otwórz plik `.env.local` i dodaj/aktualizuj:

```bash
# ============================================
# Stripe Configuration
# ============================================
STRIPE_SECRET_KEY=sk_test_twoj_secret_key_tutaj
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_twoj_publishable_key_tutaj
STRIPE_WEBHOOK_SECRET=whsec_twoj_webhook_secret_tutaj

# Stripe Price IDs (skopiowane z Krok 2)
STRIPE_PRICE_ID_SOLO=price_xxxxx_tutaj
STRIPE_PRICE_ID_AGENCY=price_xxxxx_tutaj
```

**⚠️ WAŻNE**: 
- Dla developmentu użyj kluczy z `sk_test_` i `pk_test_`
- Dla produkcji będziesz potrzebował kluczy z `sk_live_` i `pk_live_`

---

## Krok 5: Testowanie

1. **Uruchom aplikację**:
   ```bash
   npm run dev
   ```

2. **Uruchom Stripe webhook forwarding** (w osobnym terminalu):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Przetestuj checkout**:
   - Zarejestruj się w aplikacji
   - Przejdź do `/dashboard/billing`
   - Kliknij "Subscribe" na jednym z planów
   - Użyj testowej karty: `4242 4242 4242 4242`
   - Data wygaśnięcia: dowolna przyszła data (np. `12/34`)
   - CVC: dowolne 3 cyfry (np. `123`)

4. **Sprawdź czy webhook działa**:
   - W terminalu z `stripe listen` powinieneś zobaczyć eventy
   - W aplikacji sprawdź czy subskrypcja została zaktualizowana w dashboardzie

---

## 🔍 Troubleshooting

### Webhook nie działa lokalnie?
- Upewnij się że Stripe CLI jest uruchomiony: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Sprawdź czy port 3000 jest wolny
- Sprawdź logi w terminalu Stripe CLI

### Błąd "Invalid API Key"?
- Sprawdź czy klucze w `.env.local` są poprawne
- Upewnij się że używasz kluczy testowych (`sk_test_`, `pk_test_`)
- Zrestartuj serwer deweloperski po zmianie `.env.local`

### Subskrypcja nie aktualizuje się w bazie?
- Sprawdź logi webhooków w Stripe Dashboard > Developers > Webhooks
- Sprawdź czy `STRIPE_WEBHOOK_SECRET` jest poprawny
- Sprawdź logi aplikacji w terminalu

---

## 📚 Przydatne linki

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)

