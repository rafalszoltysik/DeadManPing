# 🔐 Konfiguracja Resetowania Hasła

## ✅ Jak działa resetowanie hasła

### Flow:
1. **Użytkownik klika "Forgot password?"** na stronie logowania
2. **Wpisuje email** → `/auth/forgot-password`
3. **Supabase wysyła email** z linkiem resetującym
4. **Użytkownik klika link** → `/auth/reset-password?token=...&type=recovery`
5. **Użytkownik ustawia nowe hasło**
6. **Przekierowanie do logowania** z komunikatem sukcesu

---

## 📋 Konfiguracja w Supabase Dashboard

### Krok 1: Email Templates

1. **Przejdź do:** Supabase Dashboard → Authentication → Email Templates
2. **Znajdź "Reset Password"** template
3. **Sprawdź czy redirect URL jest poprawny:**
   ```
   {{ .SiteURL }}/auth/reset-password
   ```
   (Supabase automatycznie doda `?token=...&type=recovery`)

### Krok 2: Site URL

1. **Przejdź do:** Supabase Dashboard → Settings → API
2. **Sprawdź "Site URL":**
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
3. **Upewnij się, że jest ustawiony poprawnie!**

### Krok 3: Email Provider

1. **Przejdź do:** Supabase Dashboard → Settings → Auth
2. **Sprawdź "SMTP Settings":**
   - Domyślnie Supabase używa własnego SMTP (darmowe, ale z limitami)
   - Dla produkcji: skonfiguruj własny SMTP (Resend, SendGrid, itp.)

---

## 🔧 Konfiguracja SMTP (opcjonalne, dla produkcji)

### Opcja A: Resend (zalecane)

1. **Przejdź do:** Supabase Dashboard → Settings → Auth → SMTP Settings
2. **Włącz "Custom SMTP"**
3. **Wypełnij:**
   - **Host:** `smtp.resend.com`
   - **Port:** `465` (SSL) lub `587` (TLS)
   - **Username:** `resend`
   - **Password:** Twój Resend API Key
   - **Sender email:** `alerts@yourdomain.com` (zweryfikowany w Resend)
   - **Sender name:** `DeadManPing`

### Opcja B: Domyślny SMTP Supabase

- ✅ Działa out-of-the-box
- ⚠️ Limit: 3 emaile/godzinę (darmowy plan)
- ⚠️ Dla produkcji: rozważ własny SMTP

---

## 📧 Email Template (Supabase)

Supabase automatycznie używa template "Reset Password". Możesz go dostosować:

**Domyślny template:**
```
Subject: Reset Your Password

Click the link below to reset your password:
{{ .ConfirmationURL }}

If you didn't request this, you can safely ignore this email.
```

**Możesz dostosować:**
- Subject
- Body
- Stylowanie (HTML)

---

## ✅ Testowanie

### Test 1: Wysłanie emaila resetującego

1. Przejdź do `/auth/forgot-password`
2. Wpisz email użytkownika z hasłem
3. Kliknij "Send Reset Link"
4. **Sprawdź email** (może być w spamie!)

### Test 2: Resetowanie hasła

1. Kliknij link w emailu
2. Powinieneś być przekierowany do `/auth/reset-password?token=...&type=recovery`
3. Wpisz nowe hasło
4. Kliknij "Reset Password"
5. Powinieneś być przekierowany do `/auth/login?passwordReset=true`

---

## ⚠️ Ważne uwagi

### 1. **Redirect URL musi być poprawny:**
- ✅ W Supabase Email Template: `{{ .SiteURL }}/auth/reset-password`
- ✅ W kodzie: `redirectTo: ${window.location.origin}/auth/reset-password`

### 2. **Token wygasa:**
- Token resetujący wygasa po **1 godzinie** (domyślnie w Supabase)
- Użytkownik musi kliknąć link w ciągu 1 godziny

### 3. **Email może trafić do spamu:**
- Sprawdź folder spam
- Dla produkcji: użyj własnego SMTP (Resend) z zweryfikowaną domeną

### 4. **Dla użytkowników OAuth:**
- Jeśli użytkownik nie ma hasła (tylko Google OAuth), resetowanie hasła nie zadziała
- Użytkownik powinien dodać hasło w Settings → Account Security

---

## 🔒 Bezpieczeństwo

- ✅ Token jest jednorazowy (single-use)
- ✅ Token wygasa po 1 godzinie
- ✅ Walidacja hasła (min 8 znaków, wielkie/małe litery, cyfry, znaki specjalne)
- ✅ Sprawdzanie zgodności hasła i potwierdzenia

---

## 📝 Checklist

- [ ] Site URL ustawiony w Supabase Dashboard (Settings → API)
- [ ] Email Template "Reset Password" ma poprawny redirect URL
- [ ] SMTP skonfigurowany (opcjonalnie, dla produkcji)
- [ ] Przetestowano wysłanie emaila resetującego
- [ ] Przetestowano resetowanie hasła
- [ ] Sprawdzono czy email nie trafia do spamu

---

**Gotowe!** Resetowanie hasła działa przez Supabase Auth. 🚀

