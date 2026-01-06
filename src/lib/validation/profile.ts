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
 * - age: 16-100 lat
 * - weight_kg: 40-300 kg
 * - height_cm: 140-250 cm
 * - activity_level: enum z 5 poziomów aktywności
 * - goal: 'weight_loss' lub 'weight_maintenance'
 * - weight_loss_rate_kg_week: wymagane gdy goal='weight_loss' (0.05-1.0 kg/tydzień)
 * - disclaimer_accepted_at: ISO 8601 datetime
 */
export const createProfileSchema = z
  .object({
    gender: z.enum(['male', 'female'] as const),
    age: z
      .number()
      .int('Wiek musi być liczbą całkowitą')
      .min(16, 'Wiek musi wynosić co najmniej 16 lat')
      .max(100, 'Wiek nie może przekraczać 100 lat'),
    weight_kg: z
      .number()
      .min(40, 'Waga musi wynosić co najmniej 40 kg')
      .max(300, 'Waga nie może przekraczać 300 kg'),
    height_cm: z
      .number()
      .min(140, 'Wzrost musi wynosić co najmniej 140 cm')
      .max(250, 'Wzrost nie może przekraczać 250 cm'),
    activity_level: z.enum([
      'very_low',
      'low',
      'moderate',
      'high',
      'very_high',
    ] as const),
    goal: z.enum(['weight_loss', 'weight_maintenance'] as const),
    weight_loss_rate_kg_week: z
      .number()
      .min(0.05, 'Tempo utraty wagi musi wynosić co najmniej 0.05 kg/tydzień')
      .max(1.0, 'Tempo utraty wagi nie może przekraczać 1.0 kg/tydzień')
      .optional(),
    meal_plan_type: z.enum([
      '3_main_2_snacks',
      '3_main_1_snack',
      '3_main',
      '2_main',
    ] as const),
    eating_start_time: z
      .string()
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/,
        'Nieprawidłowy format czasu (wymagany HH:MM lub HH:MM:SS)'
      ),
    eating_end_time: z
      .string()
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/,
        'Nieprawidłowy format czasu (wymagany HH:MM lub HH:MM:SS)'
      ),
    macro_ratio: z.enum([
      '70_25_5',
      '60_35_5',
      '60_30_10',
      '60_25_15',
      '50_30_20',
      '45_30_25',
      '40_40_20',
    ] as const),
    disclaimer_accepted_at: z
      .string()
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
  .refine(
    (data) => {
      // eating_end_time musi być później niż eating_start_time
      const [startHour, startMin] = data.eating_start_time
        .split(':')
        .map(Number)
      const [endHour, endMin] = data.eating_end_time.split(':').map(Number)
      const startMinutes = (startHour ?? 0) * 60 + (startMin ?? 0)
      const endMinutes = (endHour ?? 0) * 60 + (endMin ?? 0)
      return endMinutes > startMinutes
    },
    {
      message:
        'Godzina zakończenia jedzenia musi być późniejsza niż godzina rozpoczęcia',
      path: ['eating_end_time'],
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
      // Waliduj czas tylko jeśli oba pola są podane
      if (data.eating_start_time && data.eating_end_time) {
        const [startHour, startMin] = data.eating_start_time
          .split(':')
          .map(Number)
        const [endHour, endMin] = data.eating_end_time.split(':').map(Number)
        const startMinutes = (startHour ?? 0) * 60 + (startMin ?? 0)
        const endMinutes = (endHour ?? 0) * 60 + (endMin ?? 0)
        return endMinutes > startMinutes
      }
      return true
    },
    {
      message:
        'Godzina zakończenia jedzenia musi być późniejsza niż godzina rozpoczęcia',
      path: ['eating_end_time'],
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
