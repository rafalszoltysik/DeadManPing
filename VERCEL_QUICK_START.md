# 🚀 Vercel - Szybki Start

Krótki przewodnik konfiguracji środowisk Production i Development na Vercel.

## ⚡ 5-minutowa konfiguracja

### 1. Połącz projekt z Git (2 min)

1. Zaloguj się do [Vercel Dashboard](https://vercel.com/dashboard)
2. **Add New** → **Project**
3. Wybierz repozytorium GitHub/GitLab/Bitbucket
4. Vercel automatycznie wykryje Next.js

### 2. Ustaw Production Branch (30 sek)

1. **Settings** → **Git**
2. **Production Branch**: `main` (lub `master`)
3. ✅ **Automatic deployments from Git**: Enabled

### 3. Dodaj zmienne środowiskowe (2 min)

1. **Settings** → **Environment Variables**
2. Dodaj wszystkie zmienne z `env.example`
3. Dla każdej zmiennej wybierz środowiska:
   - ✅ **Production** - dla brancha `main`
   - ✅ **Preview** - dla brancha `dev` i innych

**WAŻNE**: Użyj różnych kluczy dla prod i dev:
- **Production**: Stripe Live keys (`sk_live_...`, `pk_live_...`)
- **Preview/Dev**: Stripe Test keys (`sk_test_...`, `pk_test_...`)

### 4. Gotowe! 🎉

Teraz:
- **Push do `main`** → automatyczne wdrożenie do Production
- **Push do `dev`** → automatyczne wdrożenie jako Preview

## 📋 Lista zmiennych środowiskowych

Skopiuj wszystkie z `env.example` i dodaj do Vercel:

### Wymagane dla Production:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY (sk_live_...)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_live_...)
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
RESEND_FROM_EMAIL
NEXT_PUBLIC_APP_URL (https://yourdomain.com)
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI (https://yourdomain.com/api/auth/google/callback)
JWT_SECRET
INTERNAL_API_SECRET
CRON_SECRET
```

### Dla Preview/Dev:
Te same zmienne, ale z wartościami dla development (test keys).

## 🔄 Workflow

```bash
# Development
git checkout dev
# wprowadź zmiany
git push origin dev
# → Vercel automatycznie wdraża jako preview

# Production
git checkout main
git merge dev
git push origin main
# → Vercel automatycznie wdraża do production
```

## 📚 Pełna dokumentacja

Zobacz **[VERCEL_ENVIRONMENTS_SETUP.md](./VERCEL_ENVIRONMENTS_SETUP.md)** dla szczegółowej konfiguracji.

## ❓ Problemy?

**Zmienne nie działają w preview?**
→ Upewnij się, że są zaznaczone dla środowiska **Preview**, nie tylko Production.

**Cron jobs nie działają w preview?**
→ Cron jobs w Vercel działają tylko w Production. To normalne.

**Webhook nie działa?**
→ Skonfiguruj osobny webhook w Stripe dla preview URL.
