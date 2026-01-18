# 🔧 Konfiguracja Google OAuth w Supabase

## ✅ Najlepsze rozwiązanie: Supabase Auth OAuth

**Zalety:**
- ✅ **Automatyczne łączenie kont** - Supabase automatycznie łączy konta z tym samym emailem
- ✅ **Jeden system auth** - wszystko przez `auth.users` (email/password + Google OAuth)
- ✅ **Mniej kodu** - nie trzeba ręcznie zarządzać sesjami
- ✅ **Bezpieczniejsze** - Supabase obsługuje refresh tokens, session management

---

## 📋 Krok 1: Konfiguracja w Supabase Dashboard

1. **Przejdź do:** Supabase Dashboard → Twój projekt → Authentication → Providers
2. **Znajdź "Google"** i kliknij "Enable"
3. **Wypełnij:**
   - **Client ID (for OAuth):** - z Google Cloud Console
   - **Client Secret (for OAuth):** - z Google Cloud Console
4. **Zapisz**

---

## 📋 Krok 2: Konfiguracja w Google Cloud Console

1. **Przejdź do:** [Google Cloud Console](https://console.cloud.google.com/)
2. **Wybierz projekt** (lub utwórz nowy)
3. **Przejdź do:** APIs & Services → Credentials
4. **Kliknij:** "Create Credentials" → "OAuth 2.0 Client ID"
5. **Wypełnij:**
   - **Application type:** Web application
   - **Name:** DeadManPing (lub dowolna nazwa)
   - **Authorized redirect URIs:**
     ```
     https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
     ```
     (Zastąp `YOUR_SUPABASE_PROJECT` nazwą Twojego projektu Supabase)
6. **Kliknij:** "Create"
7. **Skopiuj:**
   - **Client ID** → wklej do Supabase Dashboard
   - **Client Secret** → wklej do Supabase Dashboard

---

## 📋 Krok 3: Sprawdź redirect URI w Supabase

**Supabase automatycznie używa:**
```
https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
```

**Twoja aplikacja używa:**
```
https://yourdomain.com/auth/callback
```

**To jest OK!** Supabase przekierowuje użytkownika z `supabase.co/auth/v1/callback` do Twojego `/auth/callback`.

---

## ✅ Jak to działa

1. **Użytkownik klika "Sign in with Google"**
2. **Przekierowanie do Google** → użytkownik loguje się
3. **Google przekierowuje do Supabase** → `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. **Supabase tworzy sesję** → przekierowuje do Twojego `/auth/callback`
5. **Twoja aplikacja** → `app/auth/callback/route.ts` obsługuje callback
6. **Automatyczne łączenie kont** → jeśli email już istnieje, Supabase automatycznie łączy konta!

---

## 🔗 Automatyczne łączenie kont

**Supabase Auth automatycznie łączy konta z tym samym emailem:**

- ✅ **Scenariusz 1:** Użytkownik rejestruje się przez email/password → loguje się przez Google
  - Supabase automatycznie używa tego samego `auth.users.id`
  - Konta są połączone!

- ✅ **Scenariusz 2:** Użytkownik loguje się przez Google → rejestruje się przez email/password
  - Supabase automatycznie używa tego samego `auth.users.id`
  - Konta są połączone!

**Nie trzeba nic robić - działa automatycznie!** 🎉

---

## 🧪 Testowanie

1. **Zarejestruj się przez email/password:**
   - Email: `test@example.com`
   - Hasło: `Test123!@#`

2. **Wyloguj się**

3. **Zaloguj się przez Google** (ten sam email: `test@example.com`)

4. **Powinieneś zobaczyć:**
   - ✅ Komunikat "Accounts linked successfully!" w dashboard
   - ✅ Ten sam profil (te same monitory, ustawienia, itp.)

---

## ⚠️ Ważne uwagi

### 1. **Redirect URIs muszą się zgadzać:**
- ✅ W Google Cloud Console: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
- ✅ W Supabase Dashboard: automatycznie ustawione

### 2. **Nie używaj custom OAuth:**
- ❌ Nie używaj `/api/auth/google/callback` (custom OAuth)
- ✅ Używaj `/auth/callback` (Supabase Auth OAuth)

### 3. **Istniejący kod:**
- Kod już używa Supabase Auth OAuth (`supabase.auth.signInWithOAuth`)
- `app/auth/callback/route.ts` już obsługuje callback
- Wszystko gotowe! 🎉

---

## 📝 Checklist

- [ ] Google OAuth włączony w Supabase Dashboard
- [ ] Client ID i Client Secret ustawione w Supabase
- [ ] Redirect URI dodany w Google Cloud Console: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
- [ ] Przetestowano logowanie przez Google
- [ ] Przetestowano łączenie kont (email/password + Google)

---

**Gotowe!** Teraz Google OAuth działa przez Supabase Auth i automatycznie łączy konta! 🚀

