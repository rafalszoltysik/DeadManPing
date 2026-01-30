#!/usr/bin/env tsx
/**
 * Generate TypeScript types from Supabase database schema
 * 
 * This script uses Supabase CLI to generate TypeScript types from your database.
 * 
 * Usage:
 *   npm run generate-types
 * 
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL environment variable
 *   - SUPABASE_ACCESS_TOKEN (optional, for private projects)
 *     Get from: https://supabase.com/dashboard/account/tokens
 */

import { execSync } from 'child_process'
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'

// Load .env.local file if it exists
const envLocalPath = join(process.cwd(), '.env.local')
if (existsSync(envLocalPath)) {
  const envFile = readFileSync(envLocalPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    // Skip comments and empty lines
    if (!trimmedLine || trimmedLine.startsWith('#')) return
    
    const [key, ...valueParts] = trimmedLine.split('=')
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim()
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '')
      // Only set if not already in process.env
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = cleanValue
      }
    }
  })
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

if (!SUPABASE_URL) {
  console.error('❌ Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL')
  console.error('\nMake sure it\'s set in your .env.local file')
  process.exit(1)
}

// Extract project reference from URL
// Format: https://[project-ref].supabase.co
const projectRef = SUPABASE_URL.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1]

if (!projectRef) {
  console.error('❌ Invalid Supabase URL format')
  console.error('   Expected format: https://[project-ref].supabase.co')
  console.error(`   Got: ${SUPABASE_URL}`)
  process.exit(1)
}

try {
  console.log('🔄 Generating TypeScript types from Supabase...')
  console.log(`📦 Project: ${projectRef}`)
  
  // Ensure directory exists
  const typesDir = join(process.cwd(), 'lib/types')
  try {
    mkdirSync(typesDir, { recursive: true })
  } catch (e) {
    // Directory might already exist, that's fine
  }

  const outputPath = join(typesDir, 'database.ts')
  const typesExist = existsSync(outputPath)
  const isCI = process.env.CI || process.env.VERCEL || process.env.GITHUB_ACTIONS
  
  // Generate types using Supabase CLI
  // Note: This requires Supabase CLI to be installed or will use npx
  console.log('📥 Fetching schema from Supabase...')
  
  let typesGenerated = false
  
  try {
    // Check if we have SUPABASE_ACCESS_TOKEN (for CI/CD like Vercel)
    const accessToken = process.env.SUPABASE_ACCESS_TOKEN
    
    // Build command with optional access token
    let command = `npx --yes supabase gen types typescript --project-id ${projectRef} --schema public`
    
    // If running in CI/CD (Vercel), use access token instead of login
    if (accessToken) {
      // Set token in environment for Supabase CLI
      process.env.SUPABASE_ACCESS_TOKEN = accessToken
    }
    
    // Try to generate types using Supabase CLI
    const types = execSync(
      command,
      { 
        encoding: 'utf-8',
        env: {
          ...process.env,
          // Pass access token if available
          ...(accessToken && { SUPABASE_ACCESS_TOKEN: accessToken }),
        },
        stdio: ['pipe', 'pipe', 'pipe'] // Capture stdout, stderr
      }
    )
    
    writeFileSync(outputPath, types, 'utf-8')
    typesGenerated = true
    
  } catch (error: any) {
    // If npx fails, check if we can continue with existing types
    const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message || 'Unknown error'
    
    // In CI/CD, if types already exist, warn but don't fail the build
    if (isCI && typesExist) {
      console.warn('⚠️  Failed to generate types automatically, but existing types found')
      console.warn(`   Error: ${errorOutput}`)
      console.warn('\n   Continuing build with existing types from repository.')
      console.warn('   To update types, add SUPABASE_ACCESS_TOKEN to Vercel environment variables.')
      console.warn('   See: https://supabase.com/dashboard/account/tokens')
      // Don't exit - continue with existing types
      typesGenerated = false
    } else {
      // If types don't exist or we're not in CI, provide instructions and exit
      console.error('❌ Failed to generate types automatically')
      console.error(`\n   Error: ${errorOutput}`)
      
      if (isCI) {
        console.error('\n📚 For CI/CD (Vercel/GitHub Actions):')
        console.error('   1. Get Supabase Access Token from: https://supabase.com/dashboard/account/tokens')
        console.error('   2. Add it as environment variable in Vercel: SUPABASE_ACCESS_TOKEN')
        console.error('   3. The build will automatically use this token')
        if (!typesExist) {
          console.error('\n   ⚠️  No existing types found. Build cannot continue without types.')
          console.error('   Please either:')
          console.error('   - Add SUPABASE_ACCESS_TOKEN and redeploy, or')
          console.error('   - Commit lib/types/database.ts to the repository')
        }
      } else {
        console.error('\n📚 Solution: Login to Supabase CLI first, then generate types')
        console.error('\n   1. Login to Supabase (using npx):')
        console.error('      npx supabase login')
        console.error('      (This will open your browser to authenticate)')
        console.error('\n   2. After login, generate types:')
        console.error('      npx supabase gen types typescript --project-id ' + projectRef + ' > lib/types/database.ts')
      }
      console.error('\n💡 Alternative: Use Supabase Dashboard')
      console.error('   Go to: https://supabase.com/dashboard/project/' + projectRef)
      console.error('   Navigate to: Database > Tables (or check API section)')
      console.error('   Look for "Generate TypeScript types" option')
      console.error('\n💡 Or install via other package managers:')
      console.error('   Windows (Scoop): scoop bucket add supabase https://github.com/supabase/scoop-bucket.git')
      console.error('   Windows (Scoop): scoop install supabase')
      console.error('   See: https://github.com/supabase/cli#install-the-cli')
      
      // Only exit if types don't exist
      if (!typesExist) {
        process.exit(1)
      } else {
        console.warn('\n   ⚠️  Continuing with existing types...')
        typesGenerated = false
      }
    }
  }

  if (typesGenerated) {
    console.log('✅ Types generated successfully!')
    console.log(`📁 Types saved to: ${outputPath}`)
    console.log('\n💡 Next steps:')
    console.log('   1. Import types in your Supabase client files:')
    console.log('      import type { Database } from "@/lib/types/database"')
    console.log('   2. Type your Supabase client:')
    console.log('      const supabase = createClient<Database>(...)')
    console.log('   3. Remove the "as any" type assertions we added earlier')
  }
  
} catch (error: any) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}

