/**
 * Validation schemas for Profile API
 *
 * Zawiera schematy walidacji Zod dla wszystkich operacji na profilach:
 * - POST /api/profile (createProfileSchema)
 * - PATCH /api/profile/me (updateProfileSchema)
 *
 * @see .ai/10d01 api-profile-implementation-plan.md
 */

import { z } from 'zod'

/**
 * Schema dla POST /api/profile - tworzenie profilu użytkownika
 *
 * Wymagania:
 * - gender: 'male' lub 'female'
 * - age: 18-100 lat
 * - weight_kg: 40-300 kg
 * - height_cm: 140-250 cm
 * - activity_level: enum z 5 poziomów aktywności
 * - goal: 'weight_loss' lub 'weight_maintenance'
 * - weight_loss_rate_kg_week: wymagane gdy goal='weight_loss' (0.25-1.0 kg/tydzień)
 * - disclaimer_accepted_at: ISO 8601 datetime
 */
export const createProfileSchema = z
  .object({
    gender: z.enum(['male', 'female'] as const, {
      required_error: 'Płeć jest wymagana',
      invalid_type_error: 'Płeć musi być "male" lub "female"',
    }),
    age: z
      .number({
        required_error: 'Wiek jest wymagany',
        invalid_type_error: 'Wiek musi być liczbą',
      })
      .int('Wiek musi być liczbą całkowitą')
      .min(18, 'Wiek musi wynosić co najmniej 18 lat')
      .max(100, 'Wiek nie może przekraczać 100 lat'),
    weight_kg: z
      .number({
        required_error: 'Waga jest wymagana',
        invalid_type_error: 'Waga musi być liczbą',
      })
      .min(40, 'Waga musi wynosić co najmniej 40 kg')
      .max(300, 'Waga nie może przekraczać 300 kg'),
    height_cm: z
      .number({
        required_error: 'Wzrost jest wymagany',
        invalid_type_error: 'Wzrost musi być liczbą',
      })
      .min(140, 'Wzrost musi wynosić co najmniej 140 cm')
      .max(250, 'Wzrost nie może przekraczać 250 cm'),
    activity_level: z.enum(
      ['very_low', 'low', 'moderate', 'high', 'very_high'] as const,
      {
        required_error: 'Poziom aktywności jest wymagany',
        invalid_type_error:
          'Poziom aktywności musi być jedną z wartości: very_low, low, moderate, high, very_high',
      }
    ),
    goal: z.enum(['weight_loss', 'weight_maintenance'] as const, {
      required_error: 'Cel dietetyczny jest wymagany',
      invalid_type_error: 'Cel musi być "weight_loss" lub "weight_maintenance"',
    }),
    weight_loss_rate_kg_week: z
      .number({
        invalid_type_error: 'Tempo utraty wagi musi być liczbą',
      })
      .min(0.25, 'Tempo utraty wagi musi wynosić co najmniej 0.25 kg/tydzień')
      .max(1.0, 'Tempo utraty wagi nie może przekraczać 1.0 kg/tydzień')
      .optional(),
    disclaimer_accepted_at: z
      .string({
        required_error: 'Data akceptacji disclaimera jest wymagana',
      })
      .datetime('Nieprawidłowy format daty (wymagany ISO 8601)'),
  })
  .refine(
    (data) => {
      // weight_loss_rate_kg_week jest wymagane gdy goal='weight_loss'
      if (data.goal === 'weight_loss' && !data.weight_loss_rate_kg_week) {
        return false
      }
      return true
    },
    {
      message:
        'Tempo utraty wagi jest wymagane, gdy cel to utrata wagi (weight_loss)',
      path: ['weight_loss_rate_kg_week'],
    }
  )

/**
 * Typ wejściowy dla createProfileSchema (przed walidacją)
 */
export type CreateProfileInput = z.input<typeof createProfileSchema>

/**
 * Typ wyjściowy dla createProfileSchema (po walidacji)
 */
export type CreateProfileValidated = z.output<typeof createProfileSchema>

/**
 * Schema dla PATCH /api/profile/me - aktualizacja profilu użytkownika
 *
 * Wszystkie pola są opcjonalne (partial update).
 * Pomijamy disclaimer_accepted_at (nie może być aktualizowane).
 */
export const updateProfileSchema = createProfileSchema
  .partial()
  .omit({
    disclaimer_accepted_at: true,
  })
  .refine(
    (data) => {
      // Jeśli goal zostało zmienione na 'weight_loss', weight_loss_rate_kg_week jest wymagane
      if (
        data.goal === 'weight_loss' &&
        data.weight_loss_rate_kg_week === undefined
      ) {
        return false
      }
      return true
    },
    {
      message:
        'Tempo utraty wagi jest wymagane, gdy cel zostaje zmieniony na utratę wagi (weight_loss)',
      path: ['weight_loss_rate_kg_week'],
    }
  )

/**
 * Typ wejściowy dla updateProfileSchema (przed walidacją)
 */
export type UpdateProfileInput = z.input<typeof updateProfileSchema>

/**
 * Typ wyjściowy dla updateProfileSchema (po walidacji)
 */
export type UpdateProfileValidated = z.output<typeof updateProfileSchema>
