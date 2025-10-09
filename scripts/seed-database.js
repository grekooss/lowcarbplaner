/**
 * Script to seed the database with ingredients data
 * Usage: node scripts/seed-database.js
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n')

  try {
    // Read seed file
    const seedFilePath = join(
      __dirname,
      '..',
      'supabase',
      'seed_ingredients.sql'
    )
    const seedSQL = readFileSync(seedFilePath, 'utf-8')

    console.log('📄 Read seed_ingredients.sql successfully')
    console.log(`📊 SQL file size: ${(seedSQL.length / 1024).toFixed(2)} KB\n`)

    // Execute SQL using RPC or direct query
    // Note: Supabase JS client doesn't support direct SQL execution
    // We need to use the REST API or Postgres connection string

    console.log('⚠️  Cannot execute raw SQL directly via Supabase JS client')
    console.log(
      '📋 Please execute seed_ingredients.sql using one of these methods:\n'
    )
    console.log('Option 1: Supabase Dashboard SQL Editor')
    console.log(
      '  → Go to: https://supabase.com/dashboard/project/pkjdgaqwdletfkvniljx/sql/new'
    )
    console.log(
      '  → Copy and paste the contents of supabase/seed_ingredients.sql'
    )
    console.log('  → Click "Run"\n')

    console.log('Option 2: psql command line (if installed)')
    console.log(
      '  → Get connection string from: https://supabase.com/dashboard/project/pkjdgaqwdletfkvniljx/settings/database'
    )
    console.log(
      '  → Run: psql "YOUR_CONNECTION_STRING" < supabase/seed_ingredients.sql\n'
    )

    console.log('Option 3: Use Supabase Studio (recommended)')
    console.log('  → Open Supabase Studio')
    console.log('  → Navigate to SQL Editor')
    console.log('  → Load and execute seed_ingredients.sql\n')

    // Alternative: We could break down the SQL into individual INSERT statements
    // and execute them via Supabase client, but that's more complex
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  }
}

seedDatabase()
