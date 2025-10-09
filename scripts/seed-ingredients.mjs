/**
 * Script to seed the database with ingredients data using direct PostgreSQL connection
 * Usage: node scripts/seed-ingredients.mjs
 */

import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

const { Client } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') })

// Connection string format for Supabase
// postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env.local')
  process.exit(1)
}

// Extract project reference from Supabase URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

if (!projectRef) {
  console.error('❌ Could not extract project reference from Supabase URL')
  process.exit(1)
}

// Construct connection string
// Note: You need to get the database password from Supabase Dashboard
console.log('⚠️  Database password required!')
console.log(
  `Get it from: https://supabase.com/dashboard/project/${projectRef}/settings/database\n`
)

// For now, we'll provide instructions to run manually
console.log('📋 To seed the database, please follow these steps:\n')
console.log('Option 1: Use Supabase Dashboard SQL Editor (RECOMMENDED)')
console.log('─────────────────────────────────────────────────────────')
console.log(
  `1. Go to: https://supabase.com/dashboard/project/${projectRef}/sql/new`
)
console.log('2. Copy the entire contents of: supabase/seed_ingredients.sql')
console.log('3. Paste into the SQL Editor')
console.log('4. Click "Run" button\n')

console.log('Option 2: Use psql command (if installed)')
console.log('─────────────────────────────────')
console.log(
  '1. Get your database password from Supabase Dashboard → Settings → Database'
)
console.log('2. Run the following command:')
console.log(
  `   psql "postgresql://postgres.${projectRef}:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres" -f supabase/seed_ingredients.sql\n`
)

console.log('Option 3: Use this script with database password')
console.log('───────────────────────────────────────────────')
console.log('1. Set DATABASE_PASSWORD environment variable:')
console.log('   export DATABASE_PASSWORD="your-password"  # Linux/Mac')
console.log('   $env:DATABASE_PASSWORD="your-password"    # Windows PowerShell')
console.log('2. Run this script again: node scripts/seed-ingredients.mjs\n')

// Check if password is provided
const dbPassword = process.env.DATABASE_PASSWORD

if (dbPassword) {
  console.log('🔑 Database password found, attempting to connect...\n')

  const connectionString = `postgresql://postgres.${projectRef}:${dbPassword}@aws-1-us-east-2.pooler.supabase.com:6543/postgres`

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  async function seedDatabase() {
    try {
      console.log('🔗 Connecting to database...')
      await client.connect()
      console.log('✅ Connected successfully!\n')

      // Read seed file
      const seedFilePath = join(
        __dirname,
        '..',
        'supabase',
        'seed_ingredients.sql'
      )
      const seedSQL = readFileSync(seedFilePath, 'utf-8')

      console.log('📄 Executing seed_ingredients.sql...')
      console.log(`📊 SQL file size: ${(seedSQL.length / 1024).toFixed(2)} KB\n`)

      // Execute the SQL
      const result = await client.query(seedSQL)

      console.log('✅ Seed data loaded successfully!')
      console.log('\n📊 Summary:')

      // Get counts
      const ingredientsCount = await client.query(
        'SELECT COUNT(*) FROM content.ingredients'
      )
      const conversionsCount = await client.query(
        'SELECT COUNT(*) FROM content.ingredient_unit_conversions'
      )

      console.log(
        `   • Ingredients: ${ingredientsCount.rows[0].count} records`
      )
      console.log(
        `   • Unit conversions: ${conversionsCount.rows[0].count} records`
      )

      // Show sample ingredients by category
      const sampleData = await client.query(`
        SELECT
          category,
          COUNT(*) as count
        FROM content.ingredients
        GROUP BY category
        ORDER BY category
      `)

      console.log('\n📂 Ingredients by category:')
      sampleData.rows.forEach((row) => {
        console.log(`   • ${row.category}: ${row.count}`)
      })
    } catch (error) {
      console.error('\n❌ Error during seeding:', error.message)
      if (error.code === '23505') {
        console.log(
          '\n💡 Data already exists in the database. This is expected if you have run the seed before.'
        )
      }
      process.exit(1)
    } finally {
      await client.end()
      console.log('\n🔌 Database connection closed')
    }
  }

  seedDatabase()
} else {
  console.log('💡 Tip: For security, never commit database passwords to Git!')
  console.log(
    '    Use environment variables or retrieve passwords from secure vaults.\n'
  )
}
