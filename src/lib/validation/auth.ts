/**
 * Auth Validation Schemas
 *
 * Zod schemas for authentication forms
 */

import { z } from 'zod'

/**
 * Schema walidacji formularza logowania
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email jest wymagany')
    .email('Nieprawidłowy format email'),
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków'),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Schema walidacji formularza rejestracji
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email jest wymagany')
      .email('Nieprawidłowy format email'),
    password: z
      .string()
      .min(8, 'Hasło musi mieć co najmniej 8 znaków')
      .regex(/[A-Z]/, 'Hasło musi zawierać co najmniej 1 wielką literę')
      .regex(/[a-z]/, 'Hasło musi zawierać co najmniej 1 małą literę')
      .regex(/[0-9]/, 'Hasło musi zawierać co najmniej 1 cyfrę'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła muszą być identyczne',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

/**
 * Schema walidacji formularza resetowania hasła (wysyłka email)
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email jest wymagany')
    .email('Nieprawidłowy format email'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

/**
 * Schema walidacji formularza ustawienia nowego hasła
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Hasło musi mieć co najmniej 8 znaków')
      .regex(/[A-Z]/, 'Hasło musi zawierać co najmniej 1 wielką literę')
      .regex(/[a-z]/, 'Hasło musi zawierać co najmniej 1 małą literę')
      .regex(/[0-9]/, 'Hasło musi zawierać co najmniej 1 cyfrę'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła muszą być identyczne',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
