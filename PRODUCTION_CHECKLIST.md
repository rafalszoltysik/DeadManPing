# ✅ Checklist przed wdrożeniem na produkcję

## 🔐 1. Zmienne środowiskowe (KRYTYCZNE)

### Wymagane zmienne w Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - URL projektu Supabase
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key z Supabase
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key (NIGDY nie udostępniaj publicznie!)
- [ ] `STRIPE_SECRET_KEY` - **Użyj `sk_live_...` dla produkcji** (nie `sk_test_`)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - **Użyj `pk_live_...` dla produkcji**
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook secret z Stripe Dashboard (produkcja)
- [ ] `STRIPE_PRICE_ID_SOLO` - Price ID dla planu Solo
- [ ] `STRIPE_PRICE_ID_AGENCY` - Price ID dla planu Agency
- [ ] `RESEND_API_KEY` - API key z Resend
- [ ] `RESEND_FROM_EMAIL` - Email nadawcy (np. `DeadManPing <alerts@yourdomain.com>`)
- [ ] `NEXT_PUBLIC_APP_URL` - **URL produkcji** (np. `https://deadmanping.com`)
- [ ] `JWT_SECRET` - Losowy secret (min 64 znaki) - wygeneruj: `openssl rand -hex 32`
- [ ] `INTERNAL_API_SECRET` - Losowy secret (min 64 znaki)
- [ ] `CRON_SECRET` - Losowy secret (min 64 znaki)
- [ ] `GOOGLE_CLIENT_ID` - Client ID z Google Cloud Console
- [ ] `GOOGLE_CLIENT_SECRET` - Client Secret z Google Cloud Console
- [ ] `GOOGLE_REDIRECT_URI` - **URL produkcji** (np. `https://yourdomain.com/api/auth/google/callback`)

### Opcjonalne (ale zalecane):
- [ ] `UPSTASH_REDIS_REST_URL` - URL Redis z Upstash (dla rate limiting)
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Token Redis z Upstash
- [ ] `SENTRY_DSN` - DSN z Sentry (dla error tracking)

### ⚠️ WAŻNE:
- **NIGDY** nie używaj kluczy testowych (`sk_test_`, `pk_test_`) w produkcji
- **NIGDY** nie commituj `.env.local` do git
- Wszystkie secrets powinny być ustawione w Vercel Dashboard → Settings → Environment Variables

---

## 🗄️ 2. Baza danych (Supabase)

- [ ] Wszystkie migracje zostały uruchomione w kolejności:
  - [ ] `001_initial_schema.sql`
  - [ ] `002_cleanup_function.sql`
  - [ ] `003_schedule_cron.sql`
  - [ ] `004_add_profile_insert_policy.sql`
  - [ ] `005_update_profiles_for_custom_auth.sql`
  - [ ] `006_add_payload_validation.sql`
  - [ ] `007_pricing_and_teams.sql`
  - [ ] `008_add_grace_period.sql`
  - [ ] `009_add_warn_alert_type.sql`
- [ ] Row Level Security (RLS) jest włączone na wszystkich tabelach
- [ ] Polityki RLS są poprawnie skonfigurowane
- [ ] Extensions są włączone: `uuid-ossp`
- [ ] Google OAuth jest skonfigurowane w Supabase Dashboard → Authentication → Providers

---

## 💳 3. Stripe (KRYTYCZNE)

### Produkty i ceny:
- [ ] Utworzono produkty w **LIVE mode** (nie test mode!)
- [ ] Utworzono Price IDs dla planów:
  - [ ] Solo: $14/month
  - [ ] Agency: $49/month
- [ ] Price IDs są ustawione w zmiennych środowiskowych

### Webhooks:
- [ ] Utworzono webhook endpoint w Stripe Dashboard (LIVE mode)
- [ ] URL webhook: `https://yourdomain.com/api/webhooks/stripe`
- [ ] Subskrybowane eventy:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_failed`
- [ ] Webhook secret jest ustawiony w `STRIPE_WEBHOOK_SECRET`
- [ ] Przetestowano webhook (użyj Stripe Dashboard → Webhooks → Send test webhook)

### Klucze API:
- [ ] Używasz **LIVE keys** (`sk_live_...`, `pk_live_...`)
- [ ] Klucze są ustawione w Vercel environment variables

---

## 📧 4. Email (Resend)

- [ ] Konto Resend jest utworzone
- [ ] API key jest ustawiony w `RESEND_API_KEY`
- [ ] Domena jest zweryfikowana w Resend (dla produkcji)
- [ ] `RESEND_FROM_EMAIL` jest ustawiony na zweryfikowany email
- [ ] Przetestowano wysyłanie emaili

---

## 🔄 5. Cron Jobs (Vercel)

### ⚠️ KRYTYCZNE: Limity Vercel Hobby Plan

**Vercel Hobby plan:**
- 2 cron jobs na konto
- **Każdy cron job może być uruchomiony tylko raz dziennie** (nie co minutę!)
- Aplikacja **wymaga** sprawdzania timeoutów **co minutę** (krytyczne!)

### Rozwiązania:

#### Opcja A: Vercel Pro Plan ($20/miesiąc)
- [ ] Upgrade do Vercel Pro plan (unlimited cron invocations)
- [ ] Skonfiguruj 2 cron jobs w `vercel.json`:
  - [ ] `/api/cron/check-timeouts` - co minutę (`* * * * *`)
  - [ ] `/api/cron/check-trial-expiry` - codziennie (`0 0 * * *`)

#### Opcja B: Zewnętrzny serwis cron (dla Hobby plan)
- [ ] Użyj **cron-job.org** lub **EasyCron** (darmowe, do 2 cron jobs)
- [ ] Skonfiguruj zewnętrzny cron job:
  - [ ] URL: `https://yourdomain.com/api/cron/check-timeouts`
  - [ ] Schedule: `* * * * *` (co minutę)
  - [ ] Header: `Authorization: Bearer YOUR_CRON_SECRET`
- [ ] W `vercel.json` zostaw tylko trial expiry:
  - [ ] `/api/cron/check-trial-expiry` - codziennie (`0 0 * * *`)

#### Opcja C: GitHub Actions (dla public repos)
- [ ] Utwórz `.github/workflows/cron.yml` (patrz `CRON_SETUP.md`)
- [ ] Dodaj `CRON_SECRET` do GitHub Secrets

### Wspólne kroki:
- [ ] `CRON_SECRET` jest ustawiony w Vercel environment variables
- [ ] Przetestowano czy cron jobs działają (sprawdź logi)
- [ ] Sprawdź Vercel Dashboard → Cron Jobs (lub zewnętrzny serwis)

---

## 🌐 6. Domena i DNS

- [ ] Domena jest zakupiona
- [ ] DNS jest skonfigurowany (A/CNAME records wskazują na Vercel)
- [ ] Domena jest dodana w Vercel Dashboard → Settings → Domains
- [ ] SSL certificate jest automatycznie generowany przez Vercel
- [ ] Przetestowano dostęp przez domenę produkcyjną

---

## 🔒 7. Bezpieczeństwo

- [ ] Testowe endpointy (`/api/test/*`) są zablokowane w produkcji ✅ (już zrobione)
- [ ] CSP headers pozwalają na Stripe checkout ✅ (już zrobione)
- [ ] Wszystkie secrets są w Vercel environment variables (nie w kodzie)
- [ ] `.env.local` nie jest w git (sprawdź `.gitignore`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` nie jest używany w client-side kodzie
- [ ] Rate limiting jest skonfigurowany (opcjonalnie z Redis)

---

## 🧪 8. Testy przed wdrożeniem

### Funkcjonalne:
- [ ] Rejestracja użytkownika działa
- [ ] Logowanie działa
- [ ] Google OAuth działa
- [ ] Tworzenie monitora działa
- [ ] Ping endpoint działa (`/api/ping/[slug]`)
- [ ] Alerty są wysyłane (email/Slack/Discord)
- [ ] Stripe checkout działa
- [ ] Webhook Stripe działa (sprawdź w Stripe Dashboard)
- [ ] Upgrade/downgrade planu działa
- [ ] Cron jobs działają (sprawdź logi w Vercel)

### Bezpieczeństwo:
- [ ] Użytkownik nie może edytować monitorów innych użytkowników
- [ ] RLS policies działają poprawnie
- [ ] Limity planów są egzekwowane
- [ ] Testowe endpointy zwracają 403 w produkcji

---

## 📊 9. Monitoring i logi

- [ ] Vercel Analytics jest włączone (opcjonalnie)
- [ ] Error tracking jest skonfigurowany (Sentry - opcjonalnie)
- [ ] Logi są monitorowane w Vercel Dashboard
- [ ] Stripe webhook delivery jest monitorowany w Stripe Dashboard
- [ ] Email delivery jest monitorowany w Resend Dashboard

---

## 🚀 10. Deployment

- [ ] Kod jest w repozytorium Git
- [ ] Repozytorium jest połączone z Vercel
- [ ] Wszystkie environment variables są ustawione w Vercel
- [ ] Build przechodzi bez błędów (`npm run build`)
- [ ] Deployment jest zakończony pomyślnie
- [ ] Strona jest dostępna pod domeną produkcyjną

---

## ✅ 11. Post-deployment checklist

- [ ] Przetestowano wszystkie główne funkcje na produkcji
- [ ] Sprawdzono logi pod kątem błędów
- [ ] Przetestowano płatność (mała kwota testowa)
- [ ] Sprawdzono czy webhook Stripe działa
- [ ] Sprawdzono czy cron jobs działają
- [ ] Sprawdzono czy alerty są wysyłane
- [ ] Sprawdzono responsywność na różnych urządzeniach
- [ ] Sprawdzono SEO (robots.txt, sitemap.xml)

---

## 🔧 12. Konfiguracja Google OAuth

- [ ] OAuth 2.0 Client ID jest utworzony w Google Cloud Console
- [ ] Authorized redirect URIs zawierają:
  - [ ] `https://your-project-ref.supabase.co/auth/v1/callback` (Supabase)
  - [ ] `https://yourdomain.com/auth/callback` (produkcja)
- [ ] Client ID i Secret są ustawione w Supabase Dashboard → Authentication → Providers → Google
- [ ] Google OAuth jest włączone w Supabase

---

## ⚠️ Znane problemy do naprawienia:

1. ✅ **NAPRAWIONE**: Testowe endpointy są teraz zablokowane w produkcji
2. ✅ **NAPRAWIONE**: CSP headers pozwalają na Stripe checkout

---

## 📝 Notatki:

- Przed pierwszym deploymentem, upewnij się że wszystkie zmienne środowiskowe są ustawione
- Testuj w trybie testowym Stripe przed przejściem na live mode
- Monitoruj logi przez pierwsze kilka dni po wdrożeniu
- Miej backup planu na wypadek problemów z deploymentem

---

**Data ostatniej aktualizacji:** $(date)
**Status:** Gotowe do wdrożenia ✅

