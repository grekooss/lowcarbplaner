/**
 * Auth Error Messages
 *
 * Mapping Supabase auth errors to Polish user-friendly messages
 */

/**
 * Mapowanie błędów Supabase Auth na polskie komunikaty
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Nieprawidłowy email lub hasło',
  'Email not confirmed':
    'Email nie został potwierdzony. Sprawdź swoją skrzynkę.',
  'User already registered': 'Użytkownik z tym emailem już istnieje',
  'Password should be at least 6 characters':
    'Hasło musi mieć co najmniej 6 znaków',
  'Email rate limit exceeded': 'Zbyt wiele prób. Spróbuj ponownie później.',
  'User not found': 'Użytkownik nie został znaleziony',
  'Invalid email': 'Nieprawidłowy format email',
  'Signup not allowed for this instance':
    'Rejestracja jest obecnie niedostępna',
  'Database error saving new user': 'Błąd podczas tworzenia konta',
  'New password should be different from the old password':
    'Nowe hasło musi być inne niż poprzednie',
}

/**
 * Tłumaczy błąd Supabase Auth na polski komunikat
 */
export function translateAuthError(error: string): string {
  return (
    AUTH_ERROR_MESSAGES[error] ||
    'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.'
  )
}
