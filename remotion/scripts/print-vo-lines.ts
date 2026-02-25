/**
 * Wypisuje teksty voice-over (do nagrania lub innego TTS).
 * Uruchom: npm run vo-lines
 */
import { VO_LINES } from './vo-script'

function main() {
  console.log('Teksty do nagrania / innego TTS (po kolei → public/scene1.mp3 … scene5.mp3):\n')
  VO_LINES.forEach(({ scene, text }) => {
    console.log(`Scene ${scene}: ${text}`)
  })
  console.log('\nNagraj lub wygeneruj 5 plików MP3 i zapisz jako public/scene1.mp3 … public/scene5.mp3')
}

main()
