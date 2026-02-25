/**
 * Generuje pliki MP3 voice-over przez ElevenLabs API i zapisuje do public/.
 * Wymaga: ELEVENLABS_API_KEY w .env (skopiuj z .env.example).
 *
 * Uwaga: Na darmowym planie ElevenLabs API jest bardzo ograniczone (brak głosów
 * z biblioteki). Bez płatnego planu lepiej użyć własnych MP3 – zobacz README,
 * sekcja "Opcja B" oraz: npm run vo-lines
 *
 * Uruchomienie: npm run generate-vo
 */

import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

const VO_LINES = [
  'Your backup ran. Exit code zero.',
  'But the file is empty. Or cron stopped. And no alert fires.',
  'DeadManPing: one curl. We verify the result, not just that it ran.',
  'Dashboard. Payload rules. Alerts when something\'s wrong.',
  'Free tier. Two minutes. Start monitoring.',
]

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech'
const ELEVENLABS_VOICES_URL = 'https://api.elevenlabs.io/v1/voices'
const DEFAULT_VOICE_ID = '21m00smcmTlDKlOxlgk2' // Rachel – tylko na paid plan; free tier musi użyć własnego głosu
const MODEL_ID = 'eleven_multilingual_v2'
const OUTPUT_FORMAT = 'mp3_44100_128'

function loadEnv(): { apiKey: string; voiceId: string } {
  const possiblePaths = [
    path.join(process.cwd(), '.env'),
    path.resolve(__dirname, '..', '.env'),
  ]
  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      config({ path: envPath })
      break
    }
  }

  const apiKey = process.env.ELEVENLABS_API_KEY?.trim()
  const voiceId = (process.env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE_ID).trim()

  if (!apiKey) {
    console.error('Brak ELEVENLABS_API_KEY. Ustaw w .env (skopiuj z .env.example) lub zmiennej środowiskowej.')
    console.error('Szukane ścieżki .env:', possiblePaths)
    process.exit(1)
  }
  return { apiKey, voiceId }
}

/** Pobiera pierwszy głos dostępny na koncie (dla free tier – własne głosy z Voice Design). */
async function getFirstAvailableVoiceId(apiKey: string): Promise<string> {
  const res = await fetch(ELEVENLABS_VOICES_URL, {
    headers: { 'xi-api-key': apiKey },
  })
  if (!res.ok) throw new Error(`ElevenLabs voices API ${res.status}: ${await res.text()}`)
  const data = (await res.json()) as { voices?: { voice_id: string; name?: string }[] }
  const voices = data?.voices?.filter((v) => v?.voice_id)
  if (!voices?.length) throw new Error('Brak głosów na koncie. W ElevenLabs utwórz głos w Voice Design (free tier: 3 głosy).')
  const first = voices[0]
  console.log('Użycie głosu z konta:', first.name ?? first.voice_id)
  return first.voice_id
}

async function generateOne(
  apiKey: string,
  voiceId: string,
  text: string,
  outputPath: string
): Promise<void> {
  const url = `${ELEVENLABS_API_URL}/${voiceId}?output_format=${OUTPUT_FORMAT}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({ text, model_id: MODEL_ID }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`ElevenLabs API ${res.status}: ${err}`)
  }

  const buffer = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(outputPath, buffer)
  console.log('Zapisano:', outputPath)
}

async function main() {
  let { apiKey, voiceId } = loadEnv()
  const root = path.resolve(__dirname, '..')
  const outDir = path.join(root, 'public')
  fs.mkdirSync(outDir, { recursive: true })

  // Na free tier głosy z biblioteki (Rachel itd.) wymagają płatnego planu – użyj pierwszego głosu z konta
  if (voiceId === DEFAULT_VOICE_ID) {
    try {
      voiceId = await getFirstAvailableVoiceId(apiKey)
    } catch (e) {
      console.error('Nie ustawiono ELEVENLABS_VOICE_ID. Na free tier dodaj w ElevenLabs własny głos (Voice Design) albo ustaw w .env ID swojego głosu.')
      throw e
    }
  }

  for (let i = 0; i < VO_LINES.length; i++) {
    const outPath = path.join(outDir, `scene${i + 1}.mp3`)
    try {
      await generateOne(apiKey, voiceId, VO_LINES[i], outPath)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('402') && msg.includes('payment_required')) {
        console.warn('Głos z biblioteki wymaga płatnego planu. Próba z pierwszym głosem z konta...')
        voiceId = await getFirstAvailableVoiceId(apiKey)
        await generateOne(apiKey, voiceId, VO_LINES[i], outPath)
      } else {
        throw e
      }
    }
  }

  console.log('Voice-over wygenerowane w public/ (scene1.mp3 … scene5.mp3)')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
