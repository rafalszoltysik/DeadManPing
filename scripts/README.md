# Scripts

## generate-social-posts.ts

Generuje gotowe posty na Hacker News, Twitter/X i Threads z blog posts.

### Instalacja

```bash
npm install
```

### Użycie

```bash
npm run generate-social-posts
```

Lub bezpośrednio:

```bash
npx tsx scripts/generate-social-posts.ts
```

### Co robi

1. Czyta `app/sitemap.ts` i `lib/blog-metadata.ts`
2. Wyciąga wszystkie blog posty z ich metadata (title, description)
3. Generuje posty dla każdego kanału z odpowiednim tonem:
   - **Hacker News**: Link Post (tytuł + link)
   - **Twitter/X**: Krótkie, hook-focused, problem-oriented (~150-250 znaków)
   - **Threads**: Dłuższe, story-driven, bardziej szczegółowe (~300-500 znaków)
4. Zapisuje do `social-posts/SOCIAL_POSTS_READY.md`

### Output

Struktura folderów:
```
social-posts/
├── post-1/
│   ├── hn.md          # Hacker News post
│   ├── x.md           # Twitter/X post
│   ├── threads.md     # Threads post
│   └── README.md      # Info o poście
├── post-2/
│   └── ...
├── .published.json    # Tracking opublikowanych postów
└── README.md          # Główny README
```

Każdy folder `post-N/` zawiera:
- Osobne pliki dla każdej platformy
- Instrukcje jak publikować
- Status publikacji

### Format postów

**Hacker News:**
- Tytuł + Link (Link Post format)
- UTM parametry: `utm_source=hackernews&utm_medium=social&utm_campaign=linkpost`

**Twitter/X:**
- Hook-focused, problem-oriented
- Krótkie, angażujące
- UTM parametry: `utm_source=twitter&utm_medium=social&utm_campaign=blog_post`

**Threads:**
- Story-driven, bardziej szczegółowe
- Dłuższe posty z kontekstem
- UTM parametry: `utm_source=threads&utm_medium=social&utm_campaign=blog_post`

### Tracking opublikowanych postów

Skrypt używa pliku `.published.json` do śledzenia opublikowanych postów:

```json
{
  "post-slug": {
    "hn": true,
    "x": true,
    "threads": true
  }
}
```

Po opublikowaniu posta, zaktualizuj `.published.json` - skrypt pominie już opublikowane posty przy następnym uruchomieniu.

### Uwagi

- Skrypt automatycznie wykrywa typ problemu z description i dostosowuje ton
- Twitter posty są generowane jako hook-focused (problem + solution)
- Threads posty są bardziej story-driven z przykładami
- Każdy post ma osobny folder dla łatwej organizacji i automatyzacji

---

## extract-blog-metadata.ts

Wyciąga metadata (title, description, keywords, canonical) z wszystkich blog postów i generuje `lib/blog-metadata.ts`.

### Użycie

```bash
npm run extract-blog-metadata
```

### Co robi

1. Czyta wszystkie pliki `app/blog/[slug]/page.tsx`
2. Wyciąga metadata (title, description, keywords, canonical)
3. Generuje `lib/blog-metadata.ts` z mapą wszystkich metadata
4. Używane przez `generate-social-posts.ts` do generowania postów

### Kiedy uruchomić

Uruchom po dodaniu nowego blog posta lub zmianie metadata w istniejących postach.
