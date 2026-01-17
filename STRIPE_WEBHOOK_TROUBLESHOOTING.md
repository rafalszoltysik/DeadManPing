# 🔧 Rozwiązywanie problemów z webhookami Stripe

## Problem: Płatność przeszła, ale subskrypcja się nie zaktualizowała

### Krok 1: Sprawdź czy Stripe CLI działa

**Uruchom w osobnym terminalu:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Powinieneś zobaczyć:**
```
> Ready! Your webhook signing secret is whsec_xxxxx (^C to quit)
```

**Jeśli nie widzisz tego komunikatu:**
- Sprawdź czy Stripe CLI jest zainstalowane: `stripe --version`
- Zaloguj się: `stripe login`
- Sprawdź czy port 3000 jest wolny

### Krok 2: Sprawdź webhook secret w .env.local

1. Skopiuj `whsec_...` z terminala Stripe CLI
2. Dodaj do `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_twoj_secret_tutaj
   ```
3. **Zrestartuj serwer** (`npm run dev`)

### Krok 3: Sprawdź logi w terminalu

Po wykonaniu płatności testowej, sprawdź:

**W terminalu Stripe CLI:**
```
2024-01-15 10:30:45   --> checkout.session.completed [evt_xxx]
```

**W terminalu aplikacji (npm run dev):**
```
[Webhook] Received event: checkout.session.completed
[Webhook] Checkout session completed: { sessionId: '...', workspaceId: '...' }
[Webhook] Price ID from subscription: price_xxxxx
[Webhook] Determined tier: starter
[Webhook] Workspace updated successfully
```

### Krok 4: Sprawdź Price IDs

**W terminalu aplikacji zobaczysz:**
```
[Webhook] Environment Price IDs: {
  STARTER: 'price_xxxxx',
  PRO: 'price_xxxxx',
  ...
}
```

**Porównaj z:**
1. Stripe Dashboard → Products → sprawdź Price ID dla planu Starter
2. `.env.local` → `STRIPE_PRICE_ID_STARTER` - musi być identyczny!

**WAŻNE:** Price ID musi być z trybu testowego (jeśli używasz kluczy testowych).

### Krok 5: Sprawdź czy webhook został wywołany

**W Stripe Dashboard:**
1. Przejdź do: https://dashboard.stripe.com/test/webhooks
2. Kliknij na endpoint
3. Sprawdź sekcję "Recent events"
4. Powinieneś zobaczyć `checkout.session.completed`

**Jeśli nie ma eventów:**
- Webhook nie został wywołany
- Sprawdź czy Stripe CLI działa
- Sprawdź czy aplikacja działa na `localhost:3000`

### Krok 6: Ręczne wywołanie webhooka (dla testów)

Jeśli webhook nie został automatycznie wywołany, możesz go wywołać ręcznie:

1. W Stripe Dashboard → Webhooks → kliknij na event
2. Kliknij "Send test webhook"
3. Wybierz `checkout.session.completed`
4. Kliknij "Send test webhook"

Lub użyj Stripe CLI:
```bash
stripe trigger checkout.session.completed
```

### Krok 7: Sprawdź bazę danych

**Sprawdź czy workspace został zaktualizowany:**

1. W Supabase Dashboard → Table Editor → `workspaces`
2. Znajdź swój workspace (po `owner_id`)
3. Sprawdź kolumny:
   - `subscription_tier` - powinno być `starter`
   - `subscription_status` - powinno być `active` lub `trialing`
   - `stripe_customer_id` - powinno być wypełnione

### Krok 8: Sprawdź czy workspaceId jest poprawny

**W logach webhooka zobaczysz:**
```
[Webhook] Checkout session completed: { workspaceId: '...' }
```

**Sprawdź:**
1. Czy `workspaceId` nie jest `null` lub `undefined`
2. Czy workspace o tym ID istnieje w bazie danych

**Jeśli `workspaceId` jest `null`:**
- Sprawdź czy w `create-checkout` jest przekazywane `workspaceId` w metadata

## Najczęstsze problemy

### Problem 1: "Webhook signature verification failed"

**Rozwiązanie:**
- Sprawdź czy `STRIPE_WEBHOOK_SECRET` w `.env.local` jest aktualny
- Skopiuj nowy secret z terminala Stripe CLI
- Zrestartuj serwer

### Problem 2: "Price ID not found" lub tier pozostaje "free"

**Rozwiązanie:**
- Sprawdź czy Price ID w `.env.local` jest identyczny z tym w Stripe Dashboard
- Upewnij się że używasz Price ID z trybu testowego (jeśli używasz kluczy testowych)
- Sprawdź logi webhooka - zobaczysz porównanie Price IDs

### Problem 3: Workspace nie został zaktualizowany

**Rozwiązanie:**
- Sprawdź logi webhooka - czy `workspaceId` jest przekazane
- Sprawdź czy workspace istnieje w bazie danych
- Sprawdź czy nie ma błędów w logach aplikacji

### Problem 4: Webhook nie jest wywoływany

**Rozwiązanie:**
- Upewnij się że Stripe CLI działa: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Sprawdź czy aplikacja działa na `localhost:3000`
- Sprawdź czy endpoint `/api/webhooks/stripe` istnieje i działa

## Testowanie webhooka

### 1. Uruchom wszystko:
```bash
# Terminal 1 - Aplikacja
npm run dev

# Terminal 2 - Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 2. Wykonaj testową płatność:
- Przejdź do `/dashboard/billing`
- Kliknij "Subscribe" na planie Starter
- Użyj karty: `4242 4242 4242 4242`

### 3. Sprawdź logi:
- W terminalu Stripe CLI powinieneś zobaczyć event
- W terminalu aplikacji powinieneś zobaczyć logi `[Webhook]`
- W Stripe Dashboard powinieneś zobaczyć płatność i webhook

### 4. Sprawdź bazę danych:
- Workspace powinien mieć `subscription_tier: 'starter'`
- Profile powinien mieć zaktualizowany tier

## Debugowanie

Jeśli nadal nie działa, dodaj więcej logów:

1. Sprawdź logi w terminalu aplikacji
2. Sprawdź logi w terminalu Stripe CLI
3. Sprawdź logi w Stripe Dashboard → Webhooks → Events
4. Sprawdź bazę danych w Supabase

## Kontakt z pomocą

Jeśli problem nadal występuje:
1. Skopiuj wszystkie logi z terminali
2. Zrób screenshot z Stripe Dashboard (webhooks, events)
3. Sprawdź czy wszystkie zmienne środowiskowe są poprawne

