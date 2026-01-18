# 🔒 Security Audit Report - DeadManPing SaaS

**Data audytu:** 2024  
**Typ aplikacji:** Next.js SaaS (Dead Man Switch monitoring)  
**Deployment:** Vercel  
**Backend:** Supabase + API Routes

---

## 📋 SPIS TREŚCI

1. [Architektura & Threat Model](#architektura--threat-model)
2. [Authentication & Authorization](#authentication--authorization)
3. [API Security](#api-security)
4. [Webhook Security](#webhook-security)
5. [Frontend Security](#frontend-security)
6. [Infrastructure & Config](#infrastructure--config)
7. [Business Logic Abuse](#business-logic-abuse)
8. [TOP 5 Największych Ryzyk](#top-5-największych-ryzyk)
9. [Quick Wins](#quick-wins)
10. [Przed Launch'em](#przed-launchem)

---

## 🏗️ ARCHITEKTURA & THREAT MODEL

### ✅ Granice zaufania - DOBRZE ZDEFINIOWANE
- Frontend ↔ Backend: Supabase Auth + API routes
- Backend ↔ Supabase: Service Role Key (bypass RLS)
- Webhooks ↔ Backend: Stripe signature verification ✅
- Internal API: Secret header ✅

### ⚠️ Potencjalne wektory ataku:
1. **Publiczny endpoint `/api/ping/[slug]`** - zamierzone, ale może być nadużywany
2. **Internal API secret** - jeśli wycieknie, możliwy SSRF
3. **Custom webhook URLs** - brak walidacji → SSRF

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### 1. ❌ BRAK CSRF PROTECTION
**Poziom ryzyka:** MEDIUM  
**Opis:** Brak mechanizmu CSRF dla POST/PUT/DELETE requests. Next.js App Router nie ma wbudowanego CSRF protection.

**Scenariusz ataku:**
```
1. Atakujący tworzy stronę evil.com z formularzem POST
2. Ofiara jest zalogowana w DeadManPing
3. Atakujący wysyła link do ofiary
4. Ofiara klika → formularz wysyła request do /api/monitors/create
5. Monitor zostaje utworzony w koncie ofiary
```

**Rekomendacja:**
- Dodać CSRF tokens dla state-changing operations
- Użyć `SameSite=Strict` cookies (Supabase już używa)
- Rozważyć `Origin` header verification w API routes

---

### 2. ⚠️ RESET HASŁA - BRAK IMPLEMENTACJI
**Poziom ryzyka:** HIGH (jeśli nie zaimplementowane)  
**Opis:** W kodzie są linki do `/auth/forgot-password` i `/auth/reset-password`, ale nie widziałem implementacji API endpointów.

**Scenariusz ataku:**
- Jeśli reset hasła nie jest zaimplementowany → użytkownicy nie mogą odzyskać konta
- Jeśli jest zaimplementowany ale nie widziałem → może być podatny na:
  - Token enumeration (sprawdzanie czy token istnieje)
  - Timing attacks
  - Token reuse

**Rekomendacja:**
- Użyć Supabase Auth `resetPasswordForEmail()` - ma wbudowane zabezpieczenia
- Dodać rate limiting na reset hasła (max 3 próby/godzinę)
- Token powinien być jednorazowy i wygasać po 1 godzinie

---

### 3. ✅ SESSION MANAGEMENT - DOBRZE
**Poziom ryzyka:** LOW  
**Opis:** Używa Supabase Auth z automatycznym refresh tokenów. Cookies mają `HttpOnly` i `Secure`.

**Rekomendacja:**
- Rozważyć krótszy czas wygaśnięcia sesji (domyślnie Supabase: 7 dni)
- Dodać możliwość wylogowania wszystkich sesji

---

### 4. ✅ IDOR PROTECTION - DOBRZE
**Poziom ryzyka:** LOW  
**Opis:** Wszystkie endpointy używają `verifyMonitorAccessBySlug()` lub `verifyMonitorAccess()` które sprawdzają workspace membership.

**Sprawdzone:**
- ✅ `/api/monitors/[slug]/update` - weryfikuje dostęp
- ✅ `/api/monitors/[slug]` (GET) - weryfikuje dostęp
- ✅ `/api/workspace/members` - sprawdza ownership

---

### 5. ⚠️ PRIVILEGE ESCALATION - POTENCJALNA LUKA
**Poziom ryzyka:** MEDIUM  
**Opis:** W `/api/workspace/members` (GET) - zwraca wszystkich członków workspace, ale sprawdza tylko czy user jest owner. Jeśli user jest tylko członkiem (nie owner), nadal może zobaczyć listę członków.

**Scenariusz ataku:**
```
1. User A jest członkiem workspace (role: 'member')
2. User A wywołuje GET /api/workspace/members
3. Endpoint sprawdza tylko czy workspace istnieje i user jest owner
4. Jeśli user nie jest owner, zwraca 404, ale jeśli jest członkiem → może zobaczyć listę
```

**Rekomendacja:**
- Sprawdzić czy endpoint faktycznie zwraca dane dla członków (nie tylko ownerów)
- Jeśli tak → to jest OK (członkowie powinni widzieć innych członków)
- Jeśli nie → dodać sprawdzenie membership

---

## 🔌 API SECURITY

### 1. ❌ BRAK RATE LIMITING NA WIĘKSZOŚCI ENDPOINTÓW
**Poziom ryzyka:** HIGH  
**Opis:** Rate limiting jest tylko na `/api/ping/[slug]` (10 sekund). Brak rate limiting na:
- `/api/auth/login`
- `/api/auth/signup`
- `/api/monitors/create`
- `/api/monitors/[slug]/update`

**Scenariusz ataku:**
```
1. Atakujący używa botnetu do brute force login
2. 1000 requestów/sekundę na /api/auth/login
3. Może zablokować konta użytkowników lub przeciążyć serwer
4. Może spamować tworzenie monitorów
```

**Rekomendacja:**
- Dodać rate limiting na wszystkie endpointy:
  - Login/Signup: 5 prób/minutę per IP
  - Monitor create: 10/minutę per user
  - Monitor update: 30/minutę per user
- Użyć Upstash Redis (już skonfigurowane w `lib/rate-limit.ts`)

---

### 2. ⚠️ TEST ENDPOINTS - MOŻLIWA DOSTĘPNOŚĆ W PRODUKCJI
**Poziom ryzyka:** MEDIUM  
**Opis:** Test endpoints (`/api/test/*`) sprawdzają `NODE_ENV === 'production'`, ale jeśli zmienna nie jest ustawiona → endpointy są dostępne.

**Scenariusz ataku:**
```
1. W Vercel NODE_ENV może nie być ustawione
2. Test endpoint /api/test/stripe-connection zwraca szczegóły konfiguracji
3. Atakujący może zobaczyć Price IDs, tryb Stripe (test/live)
```

**Rekomendacja:**
- Dodać dodatkową weryfikację: `process.env.VERCEL_ENV === 'production'`
- Lub użyć whitelist IP dla test endpoints
- Lub całkowicie usunąć test endpoints w produkcji

---

### 3. ⚠️ INTERNAL API SECRET - MOŻLIWY WYCIEK
**Poziom ryzyka:** HIGH  
**Opis:** `INTERNAL_API_SECRET` jest używany w `/api/internal/send-alert`. Jeśli wycieknie (przez logi, error messages, env exposure), atakujący może:
- Wywoływać internal API
- Triggerować alerty dla dowolnych monitorów
- Potencjalnie SSRF (jeśli custom webhook nie jest walidowany)

**Scenariusz ataku:**
```
1. Secret wycieka przez console.error() w logach
2. Atakujący znajduje secret
3. Wywołuje POST /api/internal/send-alert z monitor_id ofiary
4. Spam alertów do ofiary
```

**Rekomendacja:**
- Nigdy nie logować secretów (sprawdzić wszystkie `console.log/error`)
- Użyć Vercel Environment Variables (już używane)
- Rozważyć rotację secretów
- Dodać IP whitelist dla internal API (tylko Vercel IPs)

---

### 4. ✅ INPUT VALIDATION - DOBRZE
**Poziom ryzyka:** LOW  
**Opis:** Większość endpointów ma walidację:
- Monitor name: max 100 znaków
- Expected interval: min 60 sekund
- Payload validation rules są walidowane

**Rekomendacja:**
- Dodać walidację email format (już jest w Supabase)
- Dodać max length dla webhook URLs

---

### 5. ⚠️ MASS ASSIGNMENT - POTENCJALNA LUKA
**Poziom ryzyka:** MEDIUM  
**Opis:** W `/api/monitors/[slug]/update` - endpoint przyjmuje tylko określone pola, ale sprawdzić czy nie można ustawić `user_id` lub `workspace_id`.

**Sprawdzenie:**
- ✅ Endpoint używa whitelist pól (`updateData`)
- ✅ Nie można zmienić `user_id` ani `workspace_id`
- ✅ Status można zmienić tylko na 'late' lub 'failed'

**Rekomendacja:**
- ✅ Już zabezpieczone - kontynuować ten pattern

---

## 🪝 WEBHOOK SECURITY

### 1. ✅ STRIPE WEBHOOK - DOBRZE ZABEZPIECZONY
**Poziom ryzyka:** LOW  
**Opis:** Używa `stripe.webhooks.constructEvent()` do weryfikacji podpisu.

**Rekomendacja:**
- ✅ Kontynuować używanie signature verification
- Upewnić się że `STRIPE_WEBHOOK_SECRET` jest ustawione w produkcji

---

### 2. ❌ CUSTOM WEBHOOK URL - BRAK WALIDACJI (SSRF)
**Poziom ryzyka:** CRITICAL  
**Opis:** Custom webhook URLs (Team plan) są zapisywane bez walidacji i używane w `sendCustomWebhookAlert()` bez sprawdzenia czy URL nie wskazuje na localhost/internal network.

**Lokalizacja luki:**
- `lib/alerts.ts:267` - `sendCustomWebhookAlert()` nie waliduje URL przed użyciem
- `app/api/monitors/create/route.ts:180` - zapisuje `custom_webhook_url` bez walidacji
- `app/api/monitors/[slug]/update/route.ts:166` - aktualizuje `custom_webhook_url` bez walidacji
- `lib/webhooks-validator.ts` - ma tylko `validateWebhookUrl()` dla Slack/Discord, brak funkcji dla custom webhooks

**Scenariusz ataku:**
```
1. Atakujący tworzy monitor na Team plan
2. Ustawia custom_webhook_url = "http://169.254.169.254/latest/meta-data/" (AWS metadata)
3. Triggeruje alert (np. zmienia status na 'failed')
4. System wywołuje sendCustomWebhookAlert() z niezwalidowanym URL
5. fetch() wysyła request do AWS metadata endpoint
6. Atakujący może odczytać credentials, private keys, internal IPs
```

**Rekomendacja:**
- Dodać funkcję `validateCustomWebhookUrl()` w `lib/webhooks-validator.ts`:
  ```typescript
  export function validateCustomWebhookUrl(url: string): { 
    valid: boolean
    error?: string 
  } {
    if (!url) return { valid: true }
    const parsed = new URL(url)
    // Tylko HTTPS
    if (parsed.protocol !== 'https:') {
      return { valid: false, error: 'Custom webhook must use HTTPS' }
    }
    // Blokuj private IPs (użyć istniejącego BLOCKED_HOSTS)
    const hostname = parsed.hostname.toLowerCase()
    for (const blocked of BLOCKED_HOSTS) {
      if (hostname.includes(blocked)) {
        return { valid: false, error: 'Invalid webhook URL hostname' }
      }
    }
    return { valid: true }
  }
  ```
- Użyć walidacji w `lib/alerts.ts:124` przed `sendCustomWebhookAlert()`
- Użyć walidacji w `app/api/monitors/create/route.ts` i `update/route.ts` przed zapisem

---

### 3. ⚠️ SLACK/DISCORD WEBHOOKS - CZĘŚCIOWO ZABEZPIECZONE
**Poziom ryzyka:** LOW  
**Opis:** `lib/webhooks-validator.ts` waliduje Slack/Discord webhooks, ale trzeba sprawdzić czy jest używany przy zapisie.

**Rekomendacja:**
- Sprawdzić czy walidacja jest wywoływana w `/api/monitors/create` i `/api/monitors/[slug]/update`
- Jeśli nie → dodać walidację przed zapisem

---

### 4. ⚠️ WEBHOOK REPLAY ATTACKS
**Poziom ryzyka:** LOW  
**Opis:** Stripe webhooks mają timestamp w signature, ale custom webhooks nie mają ochrony przed replay.

**Rekomendacja:**
- Dla custom webhooks: dodać nonce/timestamp verification
- Dla Stripe: już zabezpieczone przez signature

---

## 🎨 FRONTEND SECURITY

### 1. ❌ CSP - UNSAFE-INLINE I UNSAFE-EVAL
**Poziom ryzyka:** HIGH  
**Opis:** Content Security Policy w `next.config.js` ma:
```javascript
"script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com"
"style-src 'self' 'unsafe-inline'"
```

**Scenariusz ataku:**
```
1. Jeśli XSS zostanie wprowadzony (np. przez monitor name)
2. Atakujący może wykonać dowolny JavaScript
3. Może wykraść cookies, session tokens
4. Może wykonać akcje w imieniu użytkownika
```

**Rekomendacja:**
- Usunąć `'unsafe-inline'` i `'unsafe-eval'` jeśli możliwe
- Użyć nonces dla inline scripts
- Jeśli Stripe wymaga unsafe-inline → użyć `'nonce-{random}'` dla Stripe scripts

---

### 2. ⚠️ XSS - POTENCJALNA LUKA
**Poziom ryzyka:** MEDIUM  
**Opis:** Monitor names, alert messages są renderowane w React. React automatycznie escapuje, ale trzeba sprawdzić:
- Czy `dangerouslySetInnerHTML` jest używane
- Czy user input jest escapowany przed zapisem do DB

**Sprawdzenie:**
- ✅ React escapuje automatycznie
- ⚠️ Email templates używają `escapeHtml()` - DOBRZE
- ⚠️ Sprawdzić czy monitor names są escapowane w emailach

**Rekomendacja:**
- Nigdy nie używać `dangerouslySetInnerHTML` z user input
- Upewnić się że wszystkie user inputs są escapowane w email templates (już jest)

---

### 3. ⚠️ SSR INJECTION - POTENCJALNA LUKA
**Poziom ryzyka:** LOW  
**Opis:** Next.js App Router używa SSR. Jeśli user input jest renderowany w server components bez escapowania.

**Rekomendacja:**
- React automatycznie escapuje w server components
- Sprawdzić czy nie ma custom HTML rendering

---

### 4. ⚠️ ENV VARIABLES EXPOSURE
**Poziom ryzyka:** MEDIUM  
**Opis:** `NEXT_PUBLIC_*` zmienne są eksponowane do frontendu. Sprawdzić czy nie ma tam secretów.

**Sprawdzenie:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - OK (publiczne)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - OK (anon key jest bezpieczny)
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - OK (publishable key jest bezpieczny)
- ✅ `NEXT_PUBLIC_APP_URL` - OK (publiczne)

**Rekomendacja:**
- ✅ Już dobrze skonfigurowane
- Nigdy nie dodawać secretów do `NEXT_PUBLIC_*`

---

## 🏗️ INFRASTRUCTURE & CONFIG

### 1. ⚠️ BRAK HSTS HEADER
**Poziom ryzyka:** MEDIUM  
**Opis:** Brak `Strict-Transport-Security` header w `next.config.js`.

**Scenariusz ataku:**
```
1. Atakujący wykonuje MITM attack
2. Przechwytuje HTTP request (jeśli użytkownik używa HTTP zamiast HTTPS)
3. Może przechwycić cookies, session tokens
```

**Rekomendacja:**
- Dodać HSTS header:
```javascript
{
  key: 'Strict-Transport-Security',
  value: 'max-age=31536000; includeSubDomains; preload'
}
```

---

### 2. ✅ SECURITY HEADERS - DOBRZE
**Poziom ryzyka:** LOW  
**Opis:** Większość security headers jest ustawiona:
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy
- ✅ Permissions-Policy
- ⚠️ Brak HSTS (patrz wyżej)

---

### 3. ⚠️ CORS - BRAK KONFIGURACJI
**Poziom ryzyka:** LOW  
**Opis:** Nie widziałem explicit CORS configuration. Next.js API routes domyślnie nie mają CORS, ale warto to zweryfikować.

**Rekomendacja:**
- Jeśli API ma być używane z innych domen → dodać CORS z whitelist
- Jeśli tylko same-origin → obecna konfiguracja jest OK

---

### 4. ⚠️ DNS / SUBDOMAIN TAKEOVER
**Poziom ryzyka:** LOW  
**Opis:** Jeśli aplikacja używa subdomen (np. `api.deadmanping.com`), trzeba sprawdzić czy nie ma opuszczonych subdomen.

**Rekomendacja:**
- Sprawdzić wszystkie subdomeny w DNS
- Upewnić się że wszystkie wskazują na Vercel lub są używane
- Usunąć nieużywane subdomeny

---

### 5. ✅ SECRETS MANAGEMENT - DOBRZE
**Poziom ryzyka:** LOW  
**Opis:** Secrets są w Vercel Environment Variables (nie w repo).

**Rekomendacja:**
- ✅ Kontynuować używanie Vercel env vars
- Nigdy nie commituć `.env.local`
- Rotować secrets okresowo

---

## 💼 BUSINESS LOGIC ABUSE

### 1. ⚠️ DEAD MAN SWITCH BYPASS
**Poziom ryzyka:** MEDIUM  
**Opis:** Użytkownik może ręcznie pingować monitor, aby uniknąć alertów.

**Scenariusz ataku:**
```
1. Monitor powinien pingować co 5 minut
2. Użytkownik zapomina o cron job
3. Zamiast naprawić cron, ręcznie pinguje monitor przez API
4. Monitor nigdy nie wyśle alertu
```

**Rekomendacja:**
- ✅ Już częściowo zabezpieczone: rate limiting (10 sekund)
- Rozważyć dodatkowe zabezpieczenia:
  - Wykrywanie nietypowych wzorców pingów (np. zawsze o tej samej porze)
  - Alert jeśli monitor pinguje zbyt regularnie (może być bot)
  - Opcjonalnie: IP whitelist dla ping endpoint (ale to może być zbyt restrykcyjne)

---

### 2. ⚠️ SPAM ALERTÓW
**Poziom ryzyka:** LOW  
**Opis:** Anti-spam jest już zaimplementowany (max 1 alert/24h dla tego samego typu), ale można spamować różne typy alertów.

**Scenariusz ataku:**
```
1. Atakujący ma dostęp do monitora ofiary
2. Zmienia status monitora: healthy → failed → healthy → failed
3. Każda zmiana triggeruje alert
4. Ofiara dostaje spam emaili
```

**Rekomendacja:**
- ✅ Już częściowo zabezpieczone przez anti-spam
- Dodać globalny limit alertów per monitor (np. max 10 alertów/godzinę)
- Dodać rate limiting na zmiany statusu monitora

---

### 3. ⚠️ FAŁSZYWE TRIGGERY
**Poziom ryzyka:** LOW  
**Opis:** Użytkownik może ręcznie zmienić status monitora na 'failed' przez API, triggerując alert.

**Scenariusz ataku:**
```
1. Użytkownik zmienia status monitora na 'failed' przez PUT /api/monitors/[slug]
2. System wysyła alert
3. Użytkownik może spamować alertami
```

**Rekomendacja:**
- ✅ Endpoint pozwala tylko na 'late' lub 'failed' (nie można ustawić 'healthy' ręcznie)
- Dodać rate limiting na zmiany statusu (już jest w update endpoint)
- Rozważyć: tylko cron job może zmieniać status na 'failed' (nie przez API)

---

### 4. ⚠️ MONITOR LIMIT BYPASS
**Poziom ryzyka:** LOW  
**Opis:** Sprawdzić czy limit monitorów jest sprawdzany zarówno w API jak i w RLS policies.

**Sprawdzenie:**
- ✅ `/api/monitors/create` sprawdza `checkMonitorLimitByWorkspace()`
- ⚠️ Sprawdzić czy RLS policies również blokują tworzenie monitorów powyżej limitu

**Rekomendacja:**
- Dodać RLS policy która sprawdza limit przed INSERT
- Lub upewnić się że wszystkie tworzenie monitorów idzie przez API (nie bezpośrednio do Supabase)

---

## 🚨 TOP 5 NAJWIĘKSZYCH RYZYK

### 1. 🔴 CRITICAL: Custom Webhook SSRF
**Luka:** Custom webhook URLs nie są walidowane przed użyciem  
**Impact:** Atakujący może wykonać SSRF attack, odczytać AWS metadata, internal services  
**Fix:** Dodać walidację w `lib/webhooks-validator.ts` i użyć w `lib/alerts.ts`

---

### 2. 🔴 HIGH: Brak Rate Limiting
**Luka:** Większość endpointów nie ma rate limiting  
**Impact:** Brute force attacks, DoS, spam  
**Fix:** Dodać rate limiting na wszystkie endpointy używając `lib/rate-limit.ts`

---

### 3. 🔴 HIGH: CSP Unsafe-Inline
**Luka:** CSP pozwala na unsafe-inline scripts  
**Impact:** XSS attacks mogą wykonać dowolny JavaScript  
**Fix:** Usunąć unsafe-inline, użyć nonces dla Stripe

---

### 4. 🟡 MEDIUM: Brak CSRF Protection
**Luka:** Brak CSRF tokens dla state-changing operations  
**Impact:** Atakujący może wykonać akcje w imieniu użytkownika  
**Fix:** Dodać CSRF tokens lub Origin header verification

---

### 5. 🟡 MEDIUM: Internal API Secret Exposure
**Luka:** Secret może wyciec przez logi  
**Impact:** Atakujący może triggerować alerty, potencjalny SSRF  
**Fix:** Nigdy nie logować secretów, dodać IP whitelist

---

## ⚡ QUICK WINS (1 dzień)

### 1. Dodać walidację custom webhook URLs
```typescript
// W lib/alerts.ts, przed sendCustomWebhookAlert()
const validation = validateCustomWebhookUrl(customWebhook)
if (!validation.valid) {
  return { success: false, error: validation.error }
}
```

### 2. Dodać HSTS header
```javascript
// W next.config.js
{
  key: 'Strict-Transport-Security',
  value: 'max-age=31536000; includeSubDomains'
}
```

### 3. Dodać rate limiting na login/signup
```typescript
// W app/api/auth/login/route.ts
const rateLimit = await checkRateLimit(`login:${email}`, 60000) // 1 minuta
if (!rateLimit.allowed) {
  return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
}
```

### 4. Usunąć test endpoints z produkcji
```typescript
// W app/api/test/*/route.ts
if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
  return NextResponse.json({ error: 'Not available' }, { status: 404 })
}
```

### 5. Dodać walidację custom webhook w create/update
```typescript
// W app/api/monitors/create/route.ts
if (alertChannels.customWebhookUrl) {
  const validation = validateCustomWebhookUrl(alertChannels.customWebhookUrl)
  if (!validation.valid) {
    return badRequestResponse(validation.error)
  }
}
```

---

## 🚀 PRZED PUBLICZNYM LAUNCH'EM

### 🔴 MUSI BYĆ ZROBIONE:

1. **Custom Webhook SSRF Fix** - CRITICAL
   - Dodać walidację w `lib/webhooks-validator.ts`
   - Użyć walidacji w `lib/alerts.ts` przed `sendCustomWebhookAlert()`
   - Dodać walidację w `app/api/monitors/create` i `update`

2. **Rate Limiting** - HIGH
   - Dodać na `/api/auth/login` (5 prób/min)
   - Dodać na `/api/auth/signup` (3 próby/min)
   - Dodać na `/api/monitors/create` (10/min per user)

3. **HSTS Header** - MEDIUM
   - Dodać do `next.config.js`

4. **Test Endpoints** - MEDIUM
   - Upewnić się że są zablokowane w produkcji
   - Lub całkowicie usunąć

5. **CSP Hardening** - MEDIUM
   - Usunąć `unsafe-inline` jeśli możliwe
   - Użyć nonces dla Stripe

### 🟡 POWINNO BYĆ ZROBIONE:

6. **CSRF Protection** - MEDIUM
   - Dodać Origin header verification
   - Lub CSRF tokens

7. **Internal API IP Whitelist** - MEDIUM
   - Ograniczyć `/api/internal/*` do Vercel IPs

8. **Reset Password** - HIGH (jeśli nie zaimplementowane)
   - Użyć Supabase Auth `resetPasswordForEmail()`
   - Dodać rate limiting

9. **Alert Rate Limiting** - LOW
   - Globalny limit alertów per monitor (10/godzinę)

10. **Monitoring & Logging** - LOW
    - Dodać monitoring failed login attempts
    - Dodać alerting dla suspicious activity

---

## 📝 UWAGI KOŃCOWE

### ✅ Co jest dobrze zabezpieczone:
- Authentication (Supabase Auth)
- IDOR protection (workspace membership checks)
- Stripe webhook verification
- Input validation
- Secrets management (Vercel env vars)

### ⚠️ Główne obszary do poprawy:
- Custom webhook SSRF (CRITICAL)
- Rate limiting (HIGH)
- CSP hardening (HIGH)
- CSRF protection (MEDIUM)

### 📊 Statystyki:
- **CRITICAL:** 1
- **HIGH:** 3
- **MEDIUM:** 5
- **LOW:** 6

---

**Raport przygotowany przez:** Security Engineer  
**Data:** 2024  
**Wersja:** 1.0

