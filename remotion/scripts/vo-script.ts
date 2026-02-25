/**
 * Teksty voice-over dla każdej sceny (30s video).
 * Używane przez generate-vo.ts i do ewentualnego wyświetlania napisów.
 */
export const VO_LINES = [
  { scene: 1, text: 'Your backup ran. Exit code zero.' },
  { scene: 2, text: 'But the file is empty. Or cron stopped. And no alert fires.' },
  { scene: 3, text: 'DeadManPing: one curl. We verify the result, not just that it ran.' },
  { scene: 4, text: 'Dashboard. Payload rules. Alerts when something\'s wrong.' },
  { scene: 5, text: 'Free tier. Two minutes. Start monitoring.' },
] as const
