# Reddit Post Templates

## ⚠️ Reddit Rules - WAŻNE

### **Czego NIE robić:**
- ❌ **NIE** pros o upvotes bezpośrednio
- ❌ **NIE** spamuj wielu subredditów
- ❌ **NIE** ignoruj rules każdego subreddita
- ❌ **NIE** postuj codziennie
- ❌ **NIE** używaj clickbait titles

### **Co robić:**
- ✅ **TAK** dodaj wartość
- ✅ **TAK** odpowiadaj na komentarze
- ✅ **TAK** engage z community
- ✅ **TAK** sprawdź rules przed postowaniem
- ✅ **TAK** używaj właściwego formatu

---

## 📝 Post Templates

### **r/SideProject - Template 1 (Launch Day)**

**Title:**
```
[Launch] DeadManPing - Result-aware cron monitoring (Product Hunt today)
```

**Body:**
```
After months of building, launching DeadManPing on Product Hunt today!

**The problem:**
Most cron jobs don't fail loudly. They succeed... incorrectly.

Your backup script runs. Exit code 0. Everything looks green. But when you need that backup... it's empty.

Traditional monitoring tools only catch crashes. They're silent when jobs succeed incorrectly.

**The solution:**
DeadManPing monitors job outcomes, not just execution. Result-aware monitoring that verifies if your cron jobs actually did their job.

**Key features:**
- Detect when jobs don't run
- Verify job outcomes (not just execution)
- Payload validation rules
- State-aware alerts (no spam)
- Works with any language

**How it works:**
One curl line. Your job logic stays the same. No migration needed.

Example:
```bash
curl "https://deadmanping.com/api/ping/backup?size=2.5GB&count=1000"
```

We verify: size > 0, count > 100, etc.

**Free tier:**
20 monitors, no credit card required. 14-day free trial.

**Built with:**
Next.js, Supabase, Stripe, Vercel. Bootstrapped.

Would love your feedback and support!

👉 [Product Hunt Link]

[Website](https://deadmanping.com) | [GitHub Examples](https://github.com/DeadManPing/examples)
```

---

### **r/SideProject - Template 2 (Before Launch)**

**Title:**
```
Building DeadManPing - Result-aware cron monitoring (Launching Feb 17)
```

**Body:**
```
Building DeadManPing: A cron monitoring tool that verifies job outcomes, not just execution.

**The problem:**
Lost count of how many times a cron job "succeeded" but did nothing useful.

Backup script: exit code 0, empty file.
Data sync: processed 0 rows.
Report generator: wrong counts.

Traditional monitoring? Silent.

**The solution:**
Result-aware monitoring. Your cron runs your scripts. Your scripts send facts. We verify if that's OK.

**Key insight:**
Separate execution from evaluation. No migration needed. One curl line.

**Free tier:**
20 monitors, no credit card required.

Launching Feb 17 on Product Hunt. Would love your feedback!

[Website](https://deadmanping.com) | [GitHub Examples](https://github.com/DeadManPing/examples)
```

---

### **r/SaaS - Template**

**Title:**
```
[Launch] DeadManPing - Bootstrapped SaaS for cron job monitoring (Product Hunt today)
```

**Body:**
```
Launching DeadManPing on Product Hunt today!

**What it does:**
Result-aware cron monitoring that verifies job outcomes, not just execution.

**The problem:**
Most monitoring tools only catch crashes. They're silent when jobs succeed incorrectly.

**The solution:**
Monitor outcomes, not just execution. One curl line. Zero migration.

**Tech stack:**
- Next.js 15
- Supabase (Database + Auth)
- Stripe (Billing)
- Vercel (Hosting)

**Pricing:**
- Free: 20 monitors
- Starter: $7/month (30 monitors)
- Pro: $24/month (150 monitors)
- Team: $79/month (1000 monitors)

Multi-currency: USD and EUR.

**Free tier:**
20 monitors, no credit card required. 14-day free trial.

**Bootstrapped:**
Built with free-tier tools. No VC funding.

Would appreciate your support!

👉 [Product Hunt Link]

[Website](https://deadmanping.com)
```

---

### **r/devops - Template**

**Title:**
```
[Tool] DeadManPing - Result-aware cron monitoring (Product Hunt launch)
```

**Body:**
```
Launching DeadManPing on Product Hunt today!

**What it does:**
Result-aware cron monitoring that verifies job outcomes, not just execution.

**The problem:**
Most monitoring tools only catch crashes. They're silent when jobs succeed incorrectly.

Your backup script runs. Exit code 0. Looks good. But the backup file is 0 bytes. Or outdated. Or missing.

**The solution:**
DeadManPing verifies job outcomes, not just execution.

**Features:**
- Detect when jobs don't run
- Verify job outcomes (not just execution)
- Payload validation rules
- State-aware alerts (no spam)
- Missing-run detection
- Works with any language

**How it works:**
One curl line. Your job logic stays the same. No migration needed.

Example:
```bash
curl "https://deadmanping.com/api/ping/backup?size=2.5GB&count=1000"
```

We verify: size > 0, count > 100, etc.

**Free tier:**
20 monitors, no credit card required. 14-day free trial.

Would love your feedback!

👉 [Product Hunt Link]

[Website](https://deadmanping.com) | [GitHub Examples](https://github.com/DeadManPing/examples)
```

---

### **r/programming - Template (OSTROŻNIE - tylko jeśli masz wartość)**

**Title:**
```
Result-aware monitoring: Why most cron jobs fail silently (and how to catch them)
```

**Body:**
```
Most cron jobs don't fail loudly. They succeed... incorrectly.

Your backup script runs. Exit code 0. Everything looks green. But when you need that backup... it's empty.

**The problem:**
Traditional monitoring tools only catch crashes. They're silent when jobs succeed incorrectly.

**Why this happens:**
- Jobs return exit code 0 but produce zero results
- Jobs process partial data
- Jobs produce wrong counts
- Jobs skip logic paths

**The solution:**
Result-aware monitoring. Separate execution from evaluation.

Your cron runs your scripts.
Your scripts send facts.
We verify if that's OK.

**Example:**
```bash
# Your backup script
backup.sh
curl "https://deadmanping.com/api/ping/backup?size=2.5GB&count=1000"
```

We verify: size > 0, count > 100, etc.

**Key insight:**
"Did your job run?" ≠ "Did your job do its job?"

Built DeadManPing to solve this. Launching on Product Hunt today.

Would love your thoughts on this approach!

[Website](https://deadmanping.com) | [GitHub Examples](https://github.com/DeadManPing/examples)
```

---

## 📅 Reddit Posting Schedule

### **Tydzień 1-2:**
- **Nie postuj jeszcze** - obserwuj subreddity
- **Engage z innymi postami** - komentuj, buduj karma

### **Tydzień 3 (dzień przed launch):**
- **r/SideProject:** Post "Building DeadManPing" (Template 2)

### **Launch Day:**
- **r/SideProject:** Post "Launch" (Template 1)
- **r/SaaS:** Post "Launch" (Template)
- **r/devops:** Post "Tool" (Template)

### **Po launch:**
- **Nie spamuj** - maksymalnie 1-2 posty przez cały okres

---

## 🎯 Reddit Engagement Strategy

### **Przed postowaniem:**
1. **Obserwuj subreddit** przez tydzień
2. **Sprawdź rules** - każdy subreddit ma swoje
3. **Engage z innymi** - komentuj, buduj karma
4. **Sprawdź podobne posty** - zobacz co działa

### **Po postowaniu:**
1. **Odpowiadaj szybko** - w ciągu 1-2 godzin
2. **Engage z komentarzami** - odpowiadaj na pytania
3. **Nie pros o upvotes** - przełamuje rules
4. **Dodaj wartość** - odpowiadaj merytorycznie

---

## ⚠️ Reddit Warnings

### **r/programming:**
- **Bardzo ostrożnie** - łatwo dostać ban
- **Tylko jeśli masz wartość** - educational content
- **Nie self-promotion** - focus na problem/solution

### **r/SideProject:**
- **Najlepsze miejsce** - przyjazne dla launch
- **Format "Showoff Saturday"** - nawet jeśli nie sobota
- **Osobisty ton** - storytelling działa

### **r/SaaS:**
- **Profesjonalny ton** - biznesowy
- **Focus na biznes** - nie tylko tech
- **Launch announcements** - OK

### **r/devops:**
- **Technical focus** - value-focused
- **Tool announcements** - OK
- **No self-promotion** - focus na wartość

---

## 💡 Reddit Tips

1. **Sprawdź rules** - każdy subreddit ma swoje
2. **Nie spamuj** - maksymalnie 1-2 posty przez cały okres
3. **Dodaj wartość** - nie tylko self-promotion
4. **Odpowiadaj szybko** - w ciągu 1-2 godzin
5. **Engage z community** - komentuj, buduj karma

Good luck! 🚀

