// Deno global types for Supabase Edge Functions

declare namespace Deno {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void
  export const env: {
    get(key: string): string | undefined
  }
}

// Global types available in Deno runtime
declare const Response: typeof globalThis.Response
declare const Request: typeof globalThis.Request
declare const fetch: typeof globalThis.fetch
declare const console: typeof globalThis.console

