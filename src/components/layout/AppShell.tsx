'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import {
  LayoutDashboard,
  CalendarRange,
  Utensils,
  ShoppingBag,
  Menu,
  X,
  User,
  UserCircle,
  LogOut,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { createClientComponentClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  requiresAuth?: boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Panel Dzienny',
    href: '/dashboard',
    icon: LayoutDashboard,
    requiresAuth: true,
  },
  {
    label: 'Widok Tygodnia',
    href: '/meal-plan',
    icon: CalendarRange,
    requiresAuth: true,
  },
  { label: 'Przepisy', href: '/recipes', icon: Utensils, requiresAuth: false },
  {
    label: 'Lista zakupow',
    href: '/shopping-list',
    icon: ShoppingBag,
    requiresAuth: true,
  },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)
  const headerMenuRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()

  // Pobierz imię użytkownika z user_metadata lub email
  const getUserDisplayName = () => {
    if (!user) return null
    // Próbujemy pobrać imię z metadanych
    const firstName = user.user_metadata?.first_name || user.user_metadata?.name
    if (firstName) return firstName
    // Fallback na część email przed @
    return user.email?.split('@')[0] || 'Użytkowniku'
  }

  const displayName = getUserDisplayName()

  // Zamknij menu po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        headerMenuRef.current &&
        !headerMenuRef.current.contains(event.target as Node)
      ) {
        setHeaderMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Funkcja wylogowania
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Wylogowano pomyślnie')
      router.push('/')
      setHeaderMenuOpen(false)
    } catch (error) {
      toast.error('Błąd podczas wylogowania')
      console.error('Logout error:', error)
    }
  }

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: NavItem,
    onNavigate?: () => void
  ) => {
    // Jeśli link wymaga autoryzacji i użytkownik nie jest zalogowany
    if (item.requiresAuth && !user) {
      e.preventDefault()
      onNavigate?.()
      // Otwórz modal auth z redirectem do docelowej strony
      router.push(`/auth?redirect=${item.href}`)
    } else {
      onNavigate?.()
    }
  }

  const renderNavLinks = (onNavigate?: () => void) =>
    NAV_ITEMS.map((item) => {
      const isActive =
        pathname === item.href ||
        (item.href !== '/' && pathname.startsWith(item.href))
      const Icon = item.icon

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={(e) => handleNavClick(e, item, onNavigate)}
          className={cn(
            'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors',
            isActive
              ? 'bg-[color:var(--primary)] text-slate-900 shadow-sm'
              : 'text-slate-500 hover:bg-white hover:text-slate-900'
          )}
          aria-current={isActive ? 'page' : undefined}
        >
          <Icon className={cn('h-5 w-5', isActive ? 'text-slate-900' : '')} />
          <span>{item.label}</span>
        </Link>
      )
    })

  return (
    <>
      <div className='flex min-h-screen justify-center bg-[var(--background)] px-3 py-2 text-slate-900 sm:px-6 lg:px-10'>
        <div className='flex w-full max-w-[1440px] flex-col gap-0 lg:flex-row'>
          <aside className='hidden w-60 flex-col bg-white px-5 py-8 lg:flex'>
            <Link
              href='/'
              className='text-2xl font-black text-[color:var(--primary-dark)]'
            >
              LowCarbPlaner
            </Link>
            <nav className='mt-10 flex flex-1 flex-col gap-2'>
              {renderNavLinks()}
            </nav>
          </aside>

          <div className='relative flex flex-1 flex-col overflow-hidden bg-white'>
            {/* User Menu - Floating in top right */}
            <div className='absolute top-4 right-5 z-50 flex items-center gap-3 lg:top-7 lg:right-8'>
              <button
                type='button'
                className='inline-flex items-center justify-center rounded-xl bg-white p-2 text-slate-700 shadow-sm lg:hidden'
                onClick={() => setMobileNavOpen(true)}
                aria-label='Otworz menu'
              >
                <Menu className='h-5 w-5' />
              </button>

              <div className='relative' ref={headerMenuRef}>
                <button
                  onClick={() => {
                    if (user) {
                      setHeaderMenuOpen(!headerMenuOpen)
                    } else {
                      // Przekieruj niezalogowanego użytkownika do modala logowania
                      router.push('/auth?tab=login')
                    }
                  }}
                  className='flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm transition-colors hover:bg-slate-50'
                >
                  {user ? (
                    <>
                      <div className='text-right'>
                        <p className='text-sm font-semibold'>
                          Witaj {displayName}
                        </p>
                      </div>
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--primary)] text-sm font-semibold text-[color:var(--primary-foreground)]'>
                        <UserCircle className='h-6 w-6' />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='text-right'>
                        <p className='text-sm font-semibold'>
                          Witaj w LoWCarbPlaner
                        </p>
                      </div>
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500'>
                        <User className='h-5 w-5' />
                      </div>
                    </>
                  )}
                </button>

                {/* Dropdown Menu */}
                {user && headerMenuOpen && (
                  <div className='absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg'>
                    <Link
                      href='/profile'
                      className='flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-slate-50'
                      onClick={() => setHeaderMenuOpen(false)}
                    >
                      <Settings className='h-4 w-4 text-slate-500' />
                      <span>Ustawienia profilu</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className='flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition-colors hover:bg-red-50'
                    >
                      <LogOut className='h-4 w-4' />
                      <span>Wyloguj się</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <main className='flex-1 bg-white'>{children}</main>
          </div>
        </div>
      </div>

      {mobileNavOpen && (
        <div className='fixed inset-0 z-50 bg-black/40 lg:hidden'>
          <button
            type='button'
            className='absolute inset-0 h-full w-full cursor-default'
            onClick={() => setMobileNavOpen(false)}
            aria-label='Zamknij menu'
          />
          <div className='relative h-full w-72 max-w-[80vw] bg-[var(--bg-card)] p-6 shadow-2xl'>
            <div className='flex items-center justify-between'>
              <Link
                href='/'
                className='text-xl font-black text-[color:var(--primary-dark)]'
                onClick={() => setMobileNavOpen(false)}
              >
                LowCarbPlaner
              </Link>
              <button
                type='button'
                className='rounded-xl bg-white p-2 text-slate-700 shadow-sm'
                onClick={() => setMobileNavOpen(false)}
                aria-label='Zamknij menu'
              >
                <X className='h-5 w-5' />
              </button>
            </div>
            <nav className='mt-8 flex flex-col gap-2'>
              {renderNavLinks(() => setMobileNavOpen(false))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
