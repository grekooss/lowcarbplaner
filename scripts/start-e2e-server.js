#!/usr/bin/env node
/**
 * Skrypt startowy dla serwera deweloperskiego w trybie E2E
 *
 * Ładuje .env.e2e PRZED uruchomieniem Next.js,
 * aby aplikacja używała testowej bazy danych Supabase.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require('dotenv')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { spawn } = require('child_process')

// Załaduj .env.e2e
const envPath = path.resolve(__dirname, '..', '.env.e2e')
console.log('📂 Ładuję .env.e2e z:', envPath)

const result = dotenv.config({ path: envPath })

if (result.error) {
  console.error('❌ Błąd ładowania .env.e2e:', result.error)
  process.exit(1)
}

console.log('✅ Załadowano zmienne środowiskowe:')
console.log(
  '   NEXT_PUBLIC_SUPABASE_URL:',
  process.env.NEXT_PUBLIC_SUPABASE_URL
)
console.log(
  '   NEXT_PUBLIC_SUPABASE_ANON_KEY:',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***' : 'BRAK'
)

// Uruchom Next.js dev server ze zmiennymi z .env.e2e
console.log('\n🚀 Uruchamiam Next.js dev server...\n')

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const devServer = spawn(npm, ['run', 'dev'], {
  env: {
    ...process.env,
    NODE_ENV: 'test',
  },
  stdio: 'inherit',
  shell: true, // WAŻNE na Windows!
})

devServer.on('error', (err) => {
  console.error('❌ Błąd uruchamiania dev server:', err)
  process.exit(1)
})

devServer.on('close', (code) => {
  console.log(`\n📊 Dev server zakończył działanie (kod: ${code})`)
  process.exit(code)
})

// Obsługa Ctrl+C
process.on('SIGINT', () => {
  console.log('\n⏹️  Zatrzymuję dev server...')
  devServer.kill('SIGINT')
})
