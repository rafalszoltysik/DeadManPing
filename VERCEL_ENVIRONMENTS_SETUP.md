# Konfiguracja środowisk Production i Development na Vercel

Ten dokument opisuje jak skonfigurować środowiska Production i Development na Vercel z automatycznymi wdrożeniami z Git.

## 📋 Przegląd

Vercel automatycznie tworzy środowiska na podstawie branchy Git:
- **Production**: automatycznie wdraża z brancha `main` (lub `master`)
- **Preview**: automatycznie wdraża z innych branchy (np. `dev`, `staging`, feature branche)
- **Development**: można skonfigurować osobne środowisko dla brancha `dev`

## 🚀 Krok 1: Konfiguracja projektu na Vercel

### 1.1. Połącz projekt z Git

1. Zaloguj się do [Vercel Dashboard](https://vercel.com/dashboard)
2. Kliknij **"Add New..."** → **"Project"**
3. Wybierz repozytorium z GitHub/GitLab/Bitbucket
4. Vercel automatycznie wykryje projekt Next.js

### 1.2. Konfiguracja środowisk

Vercel automatycznie tworzy:
- **Production**: z brancha `main`
- **Preview**: z innych branchy

Aby dodać osobne środowisko Development:

1. W ustawieniach projektu → **Settings** → **Git**
2. Ustaw **Production Branch** na `main`
3. Wszystkie inne branche będą automatycznie tworzyć Preview deployments

## 🔧 Krok 2: Konfiguracja zmiennych środowiskowych

### 2.1. Production Environment Variables

1. Przejdź do **Settings** → **Environment Variables**
2. Dodaj wszystkie zmienne z `env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY` (użyj klucza **live** dla production)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (użyj klucza **live**)
   - `STRIPE_WEBHOOK_SECRET` (webhook secret dla production)
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` (użyj zweryfikowanego domeny)
   - `NEXT_PUBLIC_APP_URL` (URL production, np. `https://deadmanping.com`)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` (URL production callback)
   - `JWT_SECRET`
   - `INTERNAL_API_SECRET`
   - `CRON_SECRET`
   - `UPSTASH_REDIS_REST_URL` (opcjonalnie)
   - `UPSTASH_REDIS_REST_TOKEN` (opcjonalnie)

3. Dla każdej zmiennej wybierz środowiska:
   - ✅ **Production** - tylko dla production
   - ✅ **Preview** - dla preview deployments (dev, staging)
   - ✅ **Development** - dla lokalnego development (opcjonalnie)

### 2.2. Development Environment Variables

Dla środowiska development (preview deployments z brancha `dev`):

1. Dodaj te same zmienne, ale z wartościami dla development:
   - `STRIPE_SECRET_KEY` - użyj klucza **test**
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - użyj klucza **test**
   - `STRIPE_WEBHOOK_SECRET` - webhook secret dla test mode
   - `NEXT_PUBLIC_APP_URL` - URL preview deployment (Vercel automatycznie ustawia)
   - `GOOGLE_REDIRECT_URI` - URL preview deployment callback
   - `RESEND_FROM_EMAIL` - może być `onboarding@resend.dev` dla dev

2. Ustaw dla każdej zmiennej:
   - ❌ **Production** - NIE zaznaczaj
   - ✅ **Preview** - zaznacz (będzie działać dla brancha `dev`)
   - ✅ **Development** - opcjonalnie

## 🌿 Krok 3: Konfiguracja branchy Git

### 3.1. Struktura branchy

Zalecana struktura:
- `main` - production branch (automatyczne wdrożenia do production)
- `dev` - development branch (automatyczne wdrożenia jako preview)
- `feature/*` - feature branche (automatyczne wdrożenia jako preview)

### 3.2. Automatyczne wdrożenia

Vercel automatycznie:
- ✅ Wdraża `main` → Production
- ✅ Wdraża `dev` i inne branche → Preview
- ✅ Tworzy unikalny URL dla każdego preview deployment

## 📝 Krok 4: Konfiguracja vercel.json

### 4.1. Production (main branch)

Plik `vercel.json` w głównym katalogu jest używany dla production:

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

### 4.2. Development (dev branch)

Dla środowiska development możesz:
- Użyć tego samego `vercel.json` (crony będą działać również w preview)
- Lub utworzyć `vercel.dev.json` i użyć go tylko w branchu `dev`

## 🔄 Krok 5: Automatyczne wdrożenia

### 5.1. Jak to działa

1. **Push do `main`**:
   - Automatycznie wdraża do Production
   - Używa zmiennych środowiskowych z Production
   - URL: `https://your-project.vercel.app`

2. **Push do `dev`**:
   - Automatycznie wdraża jako Preview
   - Używa zmiennych środowiskowych z Preview
   - URL: `https://your-project-git-dev-your-team.vercel.app`

3. **Push do feature branch**:
   - Automatycznie wdraża jako Preview
   - URL: `https://your-project-git-feature-name-your-team.vercel.app`

### 5.2. Konfiguracja w Vercel Dashboard

1. **Settings** → **Git**
   - **Production Branch**: `main`
   - **Auto-deploy**: ✅ Enabled (domyślnie włączone)

2. **Settings** → **Deployments**
   - **Automatic deployments from Git**: ✅ Enabled
   - **Deploy Hooks**: można skonfigurować dla manual deployments

## 🔐 Krok 6: Konfiguracja bezpieczeństwa

### 6.1. Różne klucze dla prod i dev

**WAŻNE**: Używaj różnych kluczy dla production i development:

- **Production**:
  - Stripe: Live keys (`sk_live_...`, `pk_live_...`)
  - Supabase: Production project
  - Google OAuth: Production credentials

- **Development**:
  - Stripe: Test keys (`sk_test_...`, `pk_test_...`)
  - Supabase: Development project (lub ten sam z testowymi danymi)
  - Google OAuth: Development credentials

### 6.2. Webhooks

Dla każdego środowiska skonfiguruj osobne webhooks:

- **Production**: `https://your-domain.com/api/webhooks/stripe`
- **Development**: `https://your-preview-url.vercel.app/api/webhooks/stripe`

## 📊 Krok 7: Monitorowanie

### 7.1. Vercel Dashboard

- **Deployments**: zobacz wszystkie wdrożenia
- **Analytics**: metryki dla production
- **Logs**: logi dla każdego środowiska

### 7.2. Różne domeny

- **Production**: własna domena (np. `deadmanping.com`)
- **Development**: automatyczny URL Vercel (np. `deadmanping-git-dev.vercel.app`)

## 🎯 Przykładowy workflow

1. **Development**:
   ```bash
   git checkout dev
   # wprowadź zmiany
   git commit -m "feat: new feature"
   git push origin dev
   # Vercel automatycznie wdraża jako preview
   ```

2. **Production**:
   ```bash
   git checkout main
   git merge dev
   git push origin main
   # Vercel automatycznie wdraża do production
   ```

## ✅ Checklist konfiguracji

- [ ] Projekt połączony z Git w Vercel
- [ ] Production branch ustawiony na `main`
- [ ] Wszystkie zmienne środowiskowe dodane dla Production
- [ ] Wszystkie zmienne środowiskowe dodane dla Preview (dev)
- [ ] Różne klucze Stripe dla prod i dev
- [ ] Różne webhook secrets dla prod i dev
- [ ] Google OAuth skonfigurowany dla obu środowisk
- [ ] Cron jobs skonfigurowane w `vercel.json`
- [ ] Automatyczne wdrożenia włączone
- [ ] Test wdrożenia z brancha `dev`
- [ ] Test wdrożenia z brancha `main`

## 🆘 Rozwiązywanie problemów

### Problem: Zmienne środowiskowe nie działają w preview

**Rozwiązanie**: Upewnij się, że zmienne są zaznaczone dla środowiska **Preview**, nie tylko Production.

### Problem: Cron jobs nie działają w preview

**Rozwiązanie**: Cron jobs w Vercel działają tylko w Production. Dla preview użyj alternatywnych rozwiązań (np. manual triggers).

### Problem: Webhook nie działa w preview

**Rozwiązanie**: Skonfiguruj osobny webhook endpoint w Stripe dla preview URL i użyj odpowiedniego `STRIPE_WEBHOOK_SECRET`.

## 📚 Dodatkowe zasoby

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Git Integration](https://vercel.com/docs/concepts/git)
- [Vercel Preview Deployments](https://vercel.com/docs/concepts/deployments/preview-deployments)
