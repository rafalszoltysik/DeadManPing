# ⚡ Szybki start - Stripe dla DeadManPing

## 📋 Co potrzebujesz:

1. ✅ Konto Stripe (już masz)
2. ⬜ Klucze API z Stripe Dashboard
3. ⬜ 2 produkty utworzone w Stripe
4. ⬜ Webhook secret

---

## 🚀 Krok 1: Pobierz klucze API

1. Idź do: https://dashboard.stripe.com/test/apikeys
2. Skopiuj:
   - **Publishable key** (`pk_test_...`)
   - **Secret key** (`sk_test_...`) - kliknij "Reveal"

---

## 🛍️ Krok 2: Utwórz produkty

### Produkt 1: Solo ($14/miesiąc)

1. Idź do: https://dashboard.stripe.com/test/products/create
2. Wypełnij:
   ```
   Name: Solo Plan
   Description: 20 monitors, 5 minute minimum interval, Email alerts
   
   Pricing:
   - Price: 14.00
   - Currency: USD
   - Billing period: Monthly
   - ✅ Recurring (zaznacz)
   ```
3. Kliknij **"Save product"**
4. **SKOPIUJ Price ID** - znajdziesz go na 2 sposoby:
   - **Sposób 1**: W sekcji "Pricing" produktu, kliknij na cenę → Price ID będzie widoczny
   - **Sposób 2**: W sekcji "Events" na dole strony, znajdź "A new price called price_XXXXX was created" → to jest Twój Price ID

### Produkt 2: Agency ($49/miesiąc)

1. Kliknij **"+ Add product"** ponownie
2. Wypełnij:
   ```
   Name: Agency Plan
   Description: 100 monitors, 1 minute minimum interval, Email alerts, Slack/Discord integrations
   
   Pricing:
   - Price: 49.00
   - Currency: USD
   - Billing period: Monthly
   - ✅ Recurring (zaznacz)
   ```
3. Kliknij **"Save product"**
4. **SKOPIUJ Price ID** - znajdziesz go na 2 sposoby:
   - **Sposób 1**: W sekcji "Pricing" produktu, kliknij na cenę → Price ID będzie widoczny
   - **Sposób 2**: W sekcji "Events" na dole strony, znajdź "A new price called price_XXXXX was created" → to jest Twój Price ID

---

## 🔗 Krok 3: Webhook (2 opcje)

### Opcja A: Stripe CLI (dla lokalnego developmentu) ⭐ ZALECANE

**Instalacja Stripe CLI:**

**Windows:**
1. Pobierz z: https://github.com/stripe/stripe-cli/releases/latest
2. Rozpakuj `stripe_X.X.X_windows_x86_64.zip`
3. Dodaj do PATH lub użyj bezpośrednio

**Lub użyj Chocolatey:**
```powershell
choco install stripe
```

**Lub użyj Scoop:**
```powershell
scoop install stripe
```

**Po instalacji:**

1. Zaloguj się:
   ```bash
   stripe login
   ```

2. W osobnym terminalu uruchom forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Skopiuj webhook secret** - pojawi się w terminalu jako `whsec_...`

### Opcja B: Stripe Dashboard (dla produkcji)

1. Idź do: https://dashboard.stripe.com/test/webhooks
2. Kliknij **"+ Add endpoint"**
3. Wypełnij:
   - **Endpoint URL**: `https://deadmanping.com/api/webhooks/stripe`
   - **Events**: Wybierz:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
4. Kliknij **"Add endpoint"**
5. Kliknij na endpoint → **"Reveal"** → skopiuj `whsec_...`

---

## 📝 Krok 4: Zaktualizuj `.env.local`

Otwórz plik `.env.local` i dodaj:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_twoj_secret_key_tutaj
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_twoj_publishable_key_tutaj
STRIPE_WEBHOOK_SECRET=whsec_twoj_webhook_secret_tutaj

# Stripe Price IDs
STRIPE_PRICE_ID_SOLO=price_xxxxx_tutaj
STRIPE_PRICE_ID_AGENCY=price_xxxxx_tutaj
```

**Zamień wszystkie wartości na te które skopiowałeś!**

---

## ✅ Krok 5: Testowanie

1. **Zrestartuj serwer** (jeśli działa):
   ```bash
   # Zatrzymaj (Ctrl+C) i uruchom ponownie:
   npm run dev
   ```

2. **Uruchom Stripe webhook forwarding** (w osobnym terminalu):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Przetestuj w aplikacji**:
   - Zarejestruj się: http://localhost:3000/auth/signup
   - Przejdź do: http://localhost:3000/dashboard/billing
   - Kliknij "Subscribe" na jednym z planów
   - Użyj testowej karty: `4242 4242 4242 4242`
   - Data: `12/34`, CVC: `123`

4. **Sprawdź czy działa**:
   - W terminalu Stripe CLI powinieneś zobaczyć eventy
   - W aplikacji sprawdź `/dashboard/settings` - powinna być aktywna subskrypcja

---

## 🎯 Checklist

- [ ] Pobrane klucze API (`pk_test_...` i `sk_test_...`)
- [ ] Utworzony produkt "Solo Plan" z Price ID
- [ ] Utworzony produkt "Agency Plan" z Price ID
- [ ] Skonfigurowany webhook (Stripe CLI lub Dashboard)
- [ ] Wszystkie wartości dodane do `.env.local`
- [ ] Serwer zrestartowany
- [ ] Przetestowany checkout z kartą testową

---

## 🆘 Problemy?

### "Invalid API Key"
- Sprawdź czy klucze są poprawne w `.env.local`
- Upewnij się że używasz kluczy testowych (`sk_test_`, `pk_test_`)
- Zrestartuj serwer po zmianie `.env.local`

### Webhook nie działa
- Sprawdź czy Stripe CLI jest uruchomiony: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Sprawdź czy port 3000 jest wolny
- Sprawdź logi w terminalu Stripe CLI

### Subskrypcja nie aktualizuje się
- Sprawdź logi webhooków w Stripe Dashboard
- Sprawdź czy `STRIPE_WEBHOOK_SECRET` jest poprawny
- Sprawdź logi aplikacji w terminalu

---

## 📚 Przydatne linki

- [Stripe Dashboard - Products](https://dashboard.stripe.com/test/products)
- [Stripe Dashboard - API Keys](https://dashboard.stripe.com/test/apikeys)
- [Stripe Dashboard - Webhooks](https://dashboard.stripe.com/test/webhooks)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe CLI Download](https://github.com/stripe/stripe-cli/releases)

