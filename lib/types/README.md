# Supabase TypeScript Types

This directory contains TypeScript types generated from your Supabase database schema.

## How to Regenerate Types

After making database schema changes (migrations), regenerate the types to keep TypeScript in sync.

### Method 1: Supabase Dashboard (Recommended - Easiest)

1. Go to your Supabase project dashboard:
   ```
   https://supabase.com/dashboard/project/[YOUR_PROJECT_REF]/settings/api
   ```

2. Scroll down to the **"TypeScript types"** section

3. Click **"Generate types"** or copy the generated types

4. Save the types to: `lib/types/database.ts`

### Method 2: Supabase CLI

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Generate types**:
   ```bash
   supabase gen types typescript --project-id [YOUR_PROJECT_REF] --schema public > lib/types/database.ts
   ```

   Replace `[YOUR_PROJECT_REF]` with your project reference (found in your Supabase URL).

### Method 3: Using npm script

Run the provided script:
```bash
npm run generate-types
```

**Note:** This requires Supabase CLI to be installed or will attempt to use `npx`.

## Using the Types

After generating types, import and use them in your Supabase client:

```typescript
import type { Database } from '@/lib/types/database'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

This will provide full type safety for all database operations, including the `is_admin` field and any other fields you add.

## When to Regenerate

Regenerate types whenever you:
- Add new columns to existing tables
- Create new tables
- Modify column types
- Add or remove constraints

After regenerating, you can remove any `as any` type assertions that were added as temporary workarounds.

