/**
 * User Fixtures
 *
 * Dane testowe użytkowników dla testów integracyjnych.
 */

export const testUser = {
  id: 'test-user-id-001',
  email: 'test@lowcarbplaner.com',
  password: 'SecurePassword123!',
  created_at: '2025-01-01T00:00:00Z',
}

export const testUsers = [
  {
    id: 'user-001',
    email: 'john.doe@example.com',
    password: 'TestPass123!',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-002',
    email: 'jane.smith@example.com',
    password: 'SecurePass456!',
    created_at: '2025-01-02T00:00:00Z',
  },
]

export const createTestUser = (overrides?: Partial<typeof testUser>) => ({
  ...testUser,
  ...overrides,
})
