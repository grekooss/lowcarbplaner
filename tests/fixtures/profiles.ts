/**
 * Profile Fixtures
 *
 * Dane testowe profili użytkowników (cele makroskładników).
 */

import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export const testProfile: Profile = {
  id: 'test-user-id-001',
  user_id: 'test-user-id-001',
  age: 30,
  gender: 'male',
  weight_kg: 85,
  height_cm: 180,
  activity_level: 'moderate',
  goal: 'weight_loss',
  weight_loss_rate: 'moderate',
  target_calories: 1800,
  target_protein_g: 158,
  target_carbs_g: 68,
  target_fats_g: 100,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

export const testProfiles: Profile[] = [
  {
    ...testProfile,
    id: 'user-001',
    user_id: 'user-001',
  },
  {
    id: 'user-002',
    user_id: 'user-002',
    age: 25,
    gender: 'female',
    weight_kg: 65,
    height_cm: 165,
    activity_level: 'active',
    goal: 'weight_loss',
    weight_loss_rate: 'aggressive',
    target_calories: 1500,
    target_protein_g: 131,
    target_carbs_g: 56,
    target_fats_g: 83,
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
  },
]

export const createTestProfile = (
  overrides?: Partial<Profile>
): Profile => ({
  ...testProfile,
  ...overrides,
})
