/**
 * Environment Variables Validation
 *
 * Runtime validation of required environment variables using Zod.
 * Fails fast at startup if required variables are missing.
 *
 * @example
 * ```typescript
 * import { env } from '@/lib/env'
 *
 * // Type-safe access to environment variables
 * const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
 * ```
 */

import { z } from 'zod'

/**
 * Schema for client-side environment variables (NEXT_PUBLIC_*)
 * These are exposed to the browser and should never contain secrets.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
})

/**
 * Schema for server-side environment variables
 * These are only available on the server and may contain secrets.
 */
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'SUPABASE_SERVICE_ROLE_KEY is required for server operations'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
})

/**
 * Combined schema for all environment variables
 */
const envSchema = clientEnvSchema.merge(serverEnvSchema)

/**
 * Type for validated environment variables
 */
export type Env = z.infer<typeof envSchema>

/**
 * Validates environment variables at runtime
 *
 * @throws {Error} If required environment variables are missing or invalid
 */
function validateEnv(): Env {
  // On client-side, only validate client variables
  if (typeof window !== 'undefined') {
    const clientResult = clientEnvSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    })

    if (!clientResult.success) {
      console.error(
        '❌ Invalid client environment variables:',
        clientResult.error.flatten().fieldErrors
      )
      throw new Error('Invalid client environment variables')
    }

    // Return partial env for client (server vars will be undefined)
    return {
      ...clientResult.data,
      SUPABASE_SERVICE_ROLE_KEY: '',
      NODE_ENV: 'production',
    } as Env
  }

  // On server-side, validate all variables
  const result = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NODE_ENV: process.env.NODE_ENV,
  })

  if (!result.success) {
    console.error(
      '❌ Invalid environment variables:',
      result.error.flatten().fieldErrors
    )
    throw new Error(
      `Invalid environment variables: ${JSON.stringify(result.error.flatten().fieldErrors)}`
    )
  }

  return result.data
}

/**
 * Validated environment variables
 *
 * Use this instead of process.env for type-safe access.
 */
export const env = validateEnv()

/**
 * Check if we're in development mode
 */
export const isDev = env.NODE_ENV === 'development'

/**
 * Check if we're in production mode
 */
export const isProd = env.NODE_ENV === 'production'

/**
 * Check if we're in test mode
 */
export const isTest = env.NODE_ENV === 'test'
