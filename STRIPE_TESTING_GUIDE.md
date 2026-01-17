# 🧪 Przewodnik testowania Stripe w trybie sandbox

Ten przewodnik pomoże Ci przetestować integrację Stripe w trybie testowym (sandbox), aby upewnić się, że wszystko działa poprawnie **bez płacenia prawdziwych pieniędzy**.

## 🚀 Szybki start

1. **Sprawdź konfigurację** - Otwórz: `http://localhost:3000/api/test/stripe-connection`
2. **Uruchom Stripe CLI** - `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. **Przetestuj checkout** - Użyj karty testowej: `4242 4242 4242 4242`

**Karty testowe Stripe:**
- ✅ Sukces: `4242 4242 4242 4242`
- ❌ Odrzucona: `4000 0000 0000 0002`
- 🔐 3D Secure: `4000 0025 0000 3155`

---

## ✅ Krok 1: Weryfikacja konfiguracji

### Sprawdź zmienne środowiskowe

Upewnij się, że w pliku `.env.local` masz **klucze testowe** (zaczynające się od `sk_test_` i `pk_test_`):

```bash
# ✅ POPRAWNIE - klucze testowe
STRIPE_SECRET_KEY=sk_test_51AbCdEf...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEf...

# ❌ BŁĘDNIE - klucze produkcyjne (nie używaj w testach!)
STRIPE_SECRET_KEY=sk_live_51AbCdEf...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51AbCdEf...
```

### Sprawdź tryb w Stripe Dashboard

1. Przejdź do: https://dashboard.stripe.com/test/apikeys
2. Upewnij się, że widzisz przełącznik **"Test mode"** w prawym górnym rogu
3. Jeśli widzisz "Live mode", kliknij przełącznik aby przejść do trybu testowego

---

## 🧪 Krok 2: Test połączenia z API

### Opcja A: Użyj wbudowanego endpointu testowego ⭐ ZALECANE

Uruchom aplikację i sprawdź endpoint testowy:

```bash
npm run dev
```

Następnie w przeglądarce otwórz:
```
http://localhost:3000/api/test/stripe-connection
```

Lub użyj curl:
```bash
curl http://localhost:3000/api/test/stripe-connection
```

Ten endpoint automatycznie sprawdzi:
- ✅ Czy klucze API są skonfigurowane
- ✅ Czy używasz kluczy testowych (sk_test_) czy produkcyjnych (sk_live_)
- ✅ Czy połączenie z Stripe API działa
- ✅ Czy Price IDs są skonfigurowane
- ✅ Czy Price IDs istnieją w Twoim koncie Stripe
- ✅ Czy webhook secret jest skonfigurowany

**Przykładowa odpowiedź:**
```json
{
  "summary": {
    "overall": "success",
    "totalChecks": 6,
    "passed": 5,
    "warnings": 1,
    "errors": 0
  },
  "results": [
    {
      "status": "success",
      "message": "✅ Using TEST mode API keys (safe for testing)"
    },
    {
      "status": "success",
      "message": "✅ Successfully connected to Stripe API"
    }
  ]
}
```

### Opcja B: Test ręczny przez Stripe Dashboard

1. Przejdź do: https://dashboard.stripe.com/test/logs
2. Wykonaj jakąkolwiek akcję w aplikacji (np. próbę utworzenia checkout)
3. Sprawdź czy w logach pojawiają się requesty do Stripe API

---

## 💳 Krok 3: Test płatności z kartami testowymi

### Karty testowe Stripe

Stripe udostępnia specjalne karty testowe, które **nigdy nie pobierają prawdziwych pieniędzy**:

#### ✅ Karta sukcesu (płatność przechodzi):
```
Numer karty: 4242 4242 4242 4242
Data wygaśnięcia: dowolna przyszła data (np. 12/34)
CVC: dowolne 3 cyfry (np. 123)
Kod pocztowy: dowolny (np. 12345)
```

#### ❌ Karta odrzucona (płatność nie przechodzi):
```
Numer karty: 4000 0000 0000 0002
Data wygaśnięcia: 12/34
CVC: 123
```

#### ⚠️ Karta wymagająca autoryzacji 3D Secure:
```
Numer karty: 4000 0025 0000 3155
Data wygaśnięcia: 12/34
CVC: 123
```

### Pełna lista kart testowych:
📚 [Stripe Test Cards Documentation](https://stripe.com/docs/testing)

---

## 🔄 Krok 4: Test procesu checkout

### 1. Uruchom aplikację i Stripe CLI

**Terminal 1 - Aplikacja:**
```bash
npm run dev
```

**Terminal 2 - Stripe Webhook Forwarding:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**WAŻNE:** Skopiuj `whsec_...` secret który pojawi się w terminalu i dodaj do `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Przetestuj checkout w aplikacji

1. Zaloguj się do aplikacji: http://localhost:3000/auth/login
2. Przejdź do: http://localhost:3000/dashboard/billing
3. Kliknij "Subscribe" na dowolnym planie
4. W formularzu Stripe Checkout użyj karty testowej:
   - **Numer:** `4242 4242 4242 4242`
   - **Data:** `12/34`
   - **CVC:** `123`
5. Kliknij "Pay"

### 3. Sprawdź wyniki

**W terminalu Stripe CLI powinieneś zobaczyć:**
```
2024-01-15 10:30:45   --> checkout.session.completed [evt_xxx]
2024-01-15 10:30:45   --> customer.subscription.created [evt_xxx]
```

**W aplikacji:**
- Przekierowanie do `/dashboard?session_id=cs_test_...`
- W `/dashboard/settings` powinna być aktywna subskrypcja

**W Stripe Dashboard:**
- Przejdź do: https://dashboard.stripe.com/test/payments
- Powinieneś zobaczyć płatność testową
- Przejdź do: https://dashboard.stripe.com/test/subscriptions
- Powinieneś zobaczyć aktywną subskrypcję testową

---

## 🔍 Krok 5: Weryfikacja webhooków

### Sprawdź czy webhooki działają

1. **W terminalu Stripe CLI** powinieneś widzieć eventy:
   ```
   --> checkout.session.completed
   --> customer.subscription.created
   --> customer.subscription.updated
   ```

2. **W Stripe Dashboard:**
   - Przejdź do: https://dashboard.stripe.com/test/webhooks
   - Kliknij na endpoint
   - Sprawdź sekcję "Recent events" - powinny być tam eventy z testów

3. **W logach aplikacji** (terminal gdzie działa `npm run dev`):
   - Sprawdź czy nie ma błędów związanych z webhookami
   - Powinny być logi o przetwarzaniu eventów

---

## 🧹 Krok 6: Test anulowania subskrypcji

### Anuluj subskrypcję testową

1. W aplikacji przejdź do: `/dashboard/settings`
2. Kliknij "Manage Subscription" (jeśli dostępne)
3. Lub w Stripe Dashboard: https://dashboard.stripe.com/test/subscriptions
4. Znajdź subskrypcję testową i kliknij "Cancel subscription"

### Sprawdź czy webhook działa

W terminalu Stripe CLI powinieneś zobaczyć:
```
--> customer.subscription.deleted [evt_xxx]
```

W aplikacji subskrypcja powinna zostać zaktualizowana na "free" tier.

---

## 🐛 Rozwiązywanie problemów

### Problem: "Invalid API Key"

**Rozwiązanie:**
1. Sprawdź czy w `.env.local` masz klucze testowe (`sk_test_`, `pk_test_`)
2. Sprawdź czy nie ma błędów w kopiowaniu (spacje, znaki specjalne)
3. Zrestartuj serwer: `npm run dev`

### Problem: Webhook nie działa

**Rozwiązanie:**
1. Upewnij się że Stripe CLI jest uruchomiony:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
2. Sprawdź czy port 3000 jest wolny
3. Sprawdź czy `STRIPE_WEBHOOK_SECRET` w `.env.local` jest aktualny (może się zmienić po restarcie Stripe CLI)
4. Sprawdź logi w terminalu Stripe CLI

### Problem: Subskrypcja nie aktualizuje się w aplikacji

**Rozwiązanie:**
1. Sprawdź logi webhooków w Stripe Dashboard
2. Sprawdź logi aplikacji w terminalu
3. Sprawdź czy `STRIPE_WEBHOOK_SECRET` jest poprawny
4. Sprawdź czy baza danych (Supabase) jest dostępna

### Problem: "Price ID not found"

**Rozwiązanie:**
1. Sprawdź czy produkty są utworzone w Stripe Dashboard (tryb testowy!)
2. Sprawdź czy Price IDs w `.env.local` są poprawne:
   ```bash
   STRIPE_PRICE_ID_STARTER=price_xxxxx
   STRIPE_PRICE_ID_PRO=price_xxxxx
   STRIPE_PRICE_ID_TEAM=price_xxxxx
   ```
3. Upewnij się że używasz Price IDs z trybu testowego (nie produkcyjnego)

---

## ✅ Checklist testowania

Przed przejściem na produkcję upewnij się że:

- [ ] Klucze API są testowe (`sk_test_`, `pk_test_`)
- [ ] Stripe Dashboard jest w trybie testowym
- [ ] Produkty są utworzone w trybie testowym
- [ ] Price IDs są poprawne w `.env.local`
- [ ] Stripe CLI działa i przekazuje webhooki
- [ ] Checkout działa z kartą testową `4242 4242 4242 4242`
- [ ] Webhooki są odbierane i przetwarzane
- [ ] Subskrypcja jest tworzona w bazie danych
- [ ] Anulowanie subskrypcji działa poprawnie
- [ ] Wszystkie eventy są logowane w Stripe Dashboard

---

## 📚 Przydatne linki

- [Stripe Test Mode Dashboard](https://dashboard.stripe.com/test)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe API Reference](https://stripe.com/docs/api)

---

## 🎯 Podsumowanie

**Pamiętaj:**
- ✅ W trybie testowym **NIGDY nie pobierasz prawdziwych pieniędzy**
- ✅ Wszystkie płatności są symulowane
- ✅ Możesz testować dowolnie wiele razy
- ✅ Karty testowe działają tylko w trybie testowym
- ⚠️ Przed produkcją zmień klucze na `sk_live_` i `pk_live_`

**Gotowy do produkcji?**
Przeczytaj: `DEPLOYMENT.md` aby dowiedzieć się jak przejść na klucze produkcyjne.

