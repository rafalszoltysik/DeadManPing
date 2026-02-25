# DeadManPing — Remotion video (30s onboarding/demo)

30-second product video for social (X, LinkedIn, YouTube). Scenes: Hook → Problem → Solution (curl) → Dashboard → CTA.

## Setup

```bash
cd remotion
npm install
```

## Develop

```bash
npm start
```

Opens Remotion Studio; pick composition `DeadManPing30`, `DeadManPing30Vertical`, or `DeadManPing30Square`.

## Render

- **16:9** (1920×1080):  
  `npm run render`  
  Output: `out/DeadManPing30.mp4`

- **9:16** (1080×1920):  
  `npm run render:vertical`  
  Output: `out/DeadManPing30Vertical.mp4`

- **1:1** (1080×1080):  
  `npm run render:square`  
  Output: `out/DeadManPing30Square.mp4`

## Structure

- `src/Root.tsx` — Registers three compositions (same content, different aspect ratios).
- `src/Compositions/DeadManPing30.tsx` — Timeline: selects scene by frame.
- `src/scenes/` — Scene1Hook, Scene2Problem, Scene3Solution, Scene4Dashboard, Scene5CTA.
- `src/theme.ts` — Colors aligned with main app `app/globals.css` (dark).
- `src/utils/timing.ts` — Scene boundaries (frames). `src/utils/transitions.ts` — fadeIn, slideUp, stagger.

## Voice-over

Kompozycja odtwarza `public/scene1.mp3` … `public/scene5.mp3` (po jednym na scenę). Możesz je wygenerować przez ElevenLabs albo dodać własne.

### ElevenLabs za darmo (plan Free)

Z [cennika API](https://elevenlabs.io/pricing/api) na planie **Free** ($0/mies.) masz:

| Model | Znaki wliczone / miesiąc |
|-------|---------------------------|
| **Flash / Turbo** | 20 000 |
| **Multilingual v2/v3** | 10 000 |

Nasze 5 zdań to ~200 znaków, więc limit Free wystarczy. **Jedyny haczyk:** przez API na Free **nie możesz używać głosów z biblioteki** (np. Rachel) – tylko **własne głosy** (Voice Design lub sklonowane).

**Kroki:**

1. **Utwórz własny głos** w [ElevenLabs](https://elevenlabs.io) → Voice Design (na Free masz np. ograniczoną liczbę głosów – wystarczy jeden).
2. **Klucz API**: [Profile](https://elevenlabs.io/app/settings/api-keys) → wygeneruj API key. W `remotion/.env`: `ELEVENLABS_API_KEY=twoj_klucz`.
3. **Nie ustawiaj** `ELEVENLABS_VOICE_ID` w `.env` (albo ustaw ID swojego głosu z Voice Design). Skrypt weźmie pierwszy głos z konta (= Twój własny).
4. Uruchom:
   ```bash
   npm run generate-vo
   ```
   Pliki pojawią się w `public/scene1.mp3` … `public/scene5.mp3`.

Jeśli dostaniesz błąd **402 (payment_required)** – to znaczy, że wybrany głos jest z biblioteki. Usuń `ELEVENLABS_VOICE_ID` z `.env` i uruchom skrypt ponownie (użyje wtedy pierwszego Twojego głosu).

### Bez ElevenLabs – własne pliki MP3

1. Teksty do nagrania:
   ```bash
   npm run vo-lines
   ```
2. Nagraj lub wygeneruj 5 plików MP3 (inny TTS, przeglądarka, Edge TTS, własny głos) w tej samej kolejności.
3. Zapisz jako `public/scene1.mp3` … `public/scene5.mp3`.

Bez tych plików podgląd/render może zgłosić błąd ładowania audio – do testów możesz wrzucić dowolne krótkie MP3 jako placeholder.
