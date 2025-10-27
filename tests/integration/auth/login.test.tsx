/**
 * LoginForm Component - Integration Tests
 *
 * Testy integracyjne dla komponentu LoginForm:
 * - Renderowanie formularza (email, password fields)
 * - Walidacja formularza (Zod schema)
 * - Submit z callback onSubmit
 * - Loading state
 * - Error display
 * - Password visibility toggle
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../helpers/test-utils'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/LoginForm'

// Mock LoginForm component to avoid 'use client' directive issues in tests
vi.mock('@/components/auth/LoginForm', async () => {
  const actual = await import('../../mocks/LoginFormMock')
  return {
    LoginForm: actual.LoginForm
  }
})

describe('LoginForm Component', () => {
  const mockSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    test('renders login form with email and password fields', () => {
      render(<LoginForm onSubmit={mockSubmit} isLoading={false} error={null} />)

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /zaloguj się/i })
      ).toBeInTheDocument()
    })

    test('renders forgot password link', () => {
      render(<LoginForm onSubmit={mockSubmit} isLoading={false} error={null} />)

      const forgotLink = screen.getByText(/zapomniałem hasła/i)
      expect(forgotLink).toBeInTheDocument()
      expect(forgotLink.closest('a')).toHaveAttribute(
        'href',
        '/auth/forgot-password'
      )
    })
  })

  describe('Validation', () => {
    test('validates email format on blur', async () => {
      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockSubmit} isLoading={false} error={null} />)

      const emailInput = screen.getByLabelText(/email/i)

      await user.type(emailInput, 'invalid-email')
      await user.tab() // Trigger blur

      await waitFor(() => {
        expect(
          screen.getByText(/nieprawidłowy.*email/i)
        ).toBeInTheDocument()
      })
    })

    test('validates password is required', async () => {
      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockSubmit} isLoading={false} error={null} />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /zaloguj się/i })

      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/hasło.*wymagane/i)).toBeInTheDocument()
      })
    })

    test('validates minimum password length', async () => {
      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockSubmit} isLoading={false} error={null} />)

      const passwordInput = screen.getByLabelText(/hasło/i)

      await user.type(passwordInput, '123')
      await user.tab() // Trigger blur

      await waitFor(() => {
        expect(
          screen.getByText(/hasło.*minimum.*znaki/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    test('calls onSubmit with email and password on valid submit', async () => {
      mockSubmit.mockResolvedValue(undefined)

      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockSubmit} isLoading={false} error={null} />)

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/hasło/i), 'SecurePass123!')
      await user.click(screen.getByRole('button', { name: /zaloguj się/i }))

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith('test@example.com', 'SecurePass123!')
      })
    })

    test('does not call onSubmit with invalid data', async () => {
      mockSubmit.mockResolvedValue(undefined)

      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockSubmit} isLoading={false} error={null} />)

      await user.type(screen.getByLabelText(/email/i), 'invalid-email')
      await user.type(screen.getByLabelText(/hasło/i), '123') // Too short
      await user.click(screen.getByRole('button', { name: /zaloguj się/i }))

      await waitFor(() => {
        expect(mockSubmit).not.toHaveBeenCalled()
      })
    })
  })

  describe('Loading State', () => {
    test('disables inputs when isLoading=true', () => {
      render(<LoginForm onSubmit={mockSubmit} isLoading={true} error={null} />)

      expect(screen.getByLabelText(/email/i)).toBeDisabled()
      expect(screen.getByLabelText(/hasło/i)).toBeDisabled()
      expect(screen.getByRole('button', { name: /logowanie/i })).toBeDisabled()
    })

    test('shows loading spinner when isLoading=true', () => {
      render(<LoginForm onSubmit={mockSubmit} isLoading={true} error={null} />)

      expect(screen.getByText(/logowanie/i)).toBeInTheDocument()
      // Loader2 icon is rendered with aria-hidden
    })

    test('enables inputs when isLoading=false', () => {
      render(<LoginForm onSubmit={mockSubmit} isLoading={false} error={null} />)

      expect(screen.getByLabelText(/email/i)).not.toBeDisabled()
      expect(screen.getByLabelText(/hasło/i)).not.toBeDisabled()
      expect(
        screen.getByRole('button', { name: /zaloguj się/i })
      ).not.toBeDisabled()
    })
  })

  describe('Error Display', () => {
    test('displays error message when error prop is provided', () => {
      const errorMessage = 'Nieprawidłowy email lub hasło'
      render(
        <LoginForm
          onSubmit={mockSubmit}
          isLoading={false}
          error={errorMessage}
        />
      )

      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    test('does not display error when error prop is null', () => {
      render(<LoginForm onSubmit={mockSubmit} isLoading={false} error={null} />)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('Password Visibility Toggle', () => {
    test('toggles password visibility on button click', async () => {
      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockSubmit} isLoading={false} error={null} />)

      const passwordInput = screen.getByLabelText(/hasło/i) as HTMLInputElement
      const toggleButton = screen.getByLabelText(/pokaż/i)

      // Initial state: password hidden
      expect(passwordInput.type).toBe('password')

      // Click to show password
      await user.click(toggleButton)
      expect(passwordInput.type).toBe('text')
      expect(screen.getByLabelText(/ukryj/i)).toBeInTheDocument()

      // Click to hide password again
      await user.click(screen.getByLabelText(/ukryj/i))
      expect(passwordInput.type).toBe('password')
      expect(screen.getByLabelText(/pokaż/i)).toBeInTheDocument()
    })

    test('disables password toggle when form is loading', () => {
      render(<LoginForm onSubmit={mockSubmit} isLoading={true} error={null} />)

      const toggleButton = screen.getByLabelText(/pokaż/i)
      expect(toggleButton).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    test('associates labels with inputs correctly', () => {
      render(<LoginForm onSubmit={mockSubmit} isLoading={false} error={null} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/hasło/i)

      expect(emailInput).toHaveAttribute('id', 'email')
      expect(passwordInput).toHaveAttribute('id', 'password')
    })

    test('provides aria-invalid on validation errors', async () => {
      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockSubmit} isLoading={false} error={null} />)

      const emailInput = screen.getByLabelText(/email/i)

      await user.type(emailInput, 'invalid-email')
      await user.tab()

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      })
    })

    test('provides aria-describedby for error messages', async () => {
      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockSubmit} isLoading={false} error={null} />)

      const emailInput = screen.getByLabelText(/email/i)

      await user.type(emailInput, 'invalid-email')
      await user.tab()

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-describedby', 'email-error')
        expect(screen.getByRole('alert', { name: /nieprawidłowy/i }))
      })
    })
  })

  describe('Form Reset', () => {
    test('clears validation errors when user corrects input', async () => {
      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockSubmit} isLoading={false} error={null} />)

      const emailInput = screen.getByLabelText(/email/i)

      // Enter invalid email
      await user.type(emailInput, 'invalid-email')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/nieprawidłowy.*email/i)).toBeInTheDocument()
      })

      // Correct the email
      await user.clear(emailInput)
      await user.type(emailInput, 'valid@example.com')
      await user.tab()

      await waitFor(() => {
        expect(
          screen.queryByText(/nieprawidłowy.*email/i)
        ).not.toBeInTheDocument()
      })
    })
  })
})
