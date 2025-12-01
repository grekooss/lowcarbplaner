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
  Hexagon,
  ChevronDown,
  MonitorPlay,
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
    label: 'Panel dzienny',
    href: '/dashboard',
    icon: LayoutDashboard,
    requiresAuth: true,
  },
  {
    label: 'Widok tygodnia',
    href: '/meal-plan',
    icon: CalendarRange,
    requiresAuth: true,
  },
  { label: 'Przepisy', href: '/recipes', icon: Utensils, requiresAuth: false },
  {
    label: 'Lista zakupów',
    href: '/shopping-list',
    icon: ShoppingBag,
    requiresAuth: true,
  },
]

const textShadowStyle = { textShadow: '0 1px 3px rgba(0,0,0,0.3)' }

const getViewInfo = (pathname: string) => {
  if (pathname === '/dashboard' || pathname === '/') {
    return { title: 'Panel dzienny', subtitle: 'Śledź swoje posiłki i kalorie' }
  }
  if (pathname.startsWith('/meal-plan')) {
    return {
      title: 'Widok tygodnia',
      subtitle: 'Twój plan na najbliższe 7 dni',
    }
  }
  if (pathname.startsWith('/recipes')) {
    return {
      title: 'Przepisy',
      subtitle: 'Przeglądaj i odkrywaj pyszne przepisy low-carb',
    }
  }
  if (pathname.startsWith('/shopping-list')) {
    return { title: 'Lista zakupów', subtitle: 'Zakupy na najbliższy tydzień' }
  }
  if (pathname.startsWith('/profile')) {
    return { title: 'Ustawienia', subtitle: 'Zarządzaj swoim profilem' }
  }
  if (pathname.startsWith('/onboarding')) {
    return { title: 'Konfiguracja', subtitle: 'Skonfiguruj swój profil' }
  }
  return { title: 'LowCarbPlaner', subtitle: 'Zaplanuj swoje posiłki' }
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)
  const headerMenuRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()

  const getUserDisplayName = () => {
    if (!user) return null
    const firstName = user.user_metadata?.first_name || user.user_metadata?.name
    if (firstName) return firstName
    return user.email?.split('@')[0] || 'Użytkowniku'
  }

  const displayName = getUserDisplayName()

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
    if (item.requiresAuth && !user) {
      e.preventDefault()
      onNavigate?.()
      router.push(`/auth?redirect=${item.href}`)
    } else {
      onNavigate?.()
    }
  }

  const renderNavLinks = (onNavigate?: () => void, isMobile = false) =>
    NAV_ITEMS.map((item) => {
      const isActive =
        pathname === item.href ||
        (item.href !== '/' && pathname.startsWith(item.href))
      const Icon = item.icon

      if (isMobile) {
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => handleNavClick(e, item, onNavigate)}
            className={cn(
              'flex items-center gap-3 rounded-md border-2 px-4 py-3 text-sm font-medium transition-all',
              isActive
                ? 'border-white bg-white/60 font-bold text-gray-800 shadow-lg backdrop-blur-xl'
                : 'border-transparent text-gray-700 hover:bg-white/10 hover:text-gray-900'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              className={cn(
                'h-5 w-5',
                isActive ? 'text-gray-500' : 'text-gray-600'
              )}
            />
            <span>{item.label}</span>
          </Link>
        )
      }

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={(e) => handleNavClick(e, item, onNavigate)}
          className={cn(
            'flex items-center gap-3 rounded-md border-2 px-4 py-3 text-sm font-medium transition-all',
            isActive
              ? 'border-white bg-white/60 font-bold text-gray-800 shadow-lg backdrop-blur-xl'
              : 'border-transparent text-white hover:bg-white/10 hover:text-white'
          )}
          aria-current={isActive ? 'page' : undefined}
        >
          <Icon
            className={cn('h-5 w-5', isActive ? 'text-gray-500' : 'text-white')}
            style={
              !isActive
                ? { filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }
                : {}
            }
          />
          <span style={!isActive ? textShadowStyle : {}}>{item.label}</span>
        </Link>
      )
    })

  return (
    <>
      {/* Full viewport container with background */}
      <div className='relative flex h-screen w-full items-center justify-center overflow-hidden font-sans'>
        {/* Background Image */}
        <div className='pointer-events-none fixed inset-0 z-0'>
          <div
            className='absolute inset-0 bg-cover bg-center'
            style={{
              backgroundImage: "url('/GeneratedImage.png')",
            }}
          />
        </div>

        {/* Main Container Wrapper for Panel + Ads */}
        <div className='relative z-30 flex h-full w-full max-w-[1800px] items-center justify-center gap-6 p-2 lg:p-10'>
          {/* Main Glass Panel */}
          <div className='flex h-full w-full flex-1 overflow-hidden rounded-2xl border-2 border-white bg-white/20 shadow-2xl ring-1 ring-black/5 backdrop-blur-md md:rounded-3xl lg:rounded-3xl'>
            {/* Sidebar - Desktop */}
            <aside className='hidden h-full w-64 flex-col border-r border-white/30 bg-white/30 px-6 pt-8 pb-4 text-white lg:flex'>
              {/* Logo */}
              <div className='mb-10 flex items-center gap-3 px-2'>
                <div className='rounded-lg bg-red-600 p-1.5 shadow-lg shadow-red-500/30'>
                  <Hexagon className='h-5 w-5 fill-current text-white' />
                </div>
                <span
                  className='text-xl font-bold tracking-tight'
                  style={textShadowStyle}
                >
                  LowCarb
                </span>
              </div>

              <div className='no-scrollbar flex-1 space-y-8 overflow-y-auto'>
                {/* Main Menu */}
                <div>
                  <h3
                    className='mb-4 px-2 text-xs font-bold tracking-wider text-white/80 uppercase'
                    style={textShadowStyle}
                  >
                    Menu
                  </h3>
                  <nav className='space-y-2'>{renderNavLinks()}</nav>
                </div>

                {/* System */}
                <div>
                  <h3
                    className='mb-4 px-2 text-xs font-bold tracking-wider text-white/80 uppercase'
                    style={textShadowStyle}
                  >
                    System
                  </h3>
                  <div className='space-y-1'>
                    <Link
                      href='/profile'
                      className='flex items-center gap-3 rounded-md border-2 border-transparent px-4 py-3 font-medium text-white transition-all hover:bg-white/10 hover:text-white'
                    >
                      <Settings
                        className='h-5 w-5 text-white'
                        style={{
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                        }}
                      />
                      <span style={textShadowStyle}>Ustawienia</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className='flex w-full items-center gap-3 rounded-md border-2 border-transparent px-4 py-3 font-medium text-white transition-all hover:bg-white/10 hover:text-white'
                    >
                      <LogOut
                        className='h-5 w-5 text-white'
                        style={{
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                        }}
                      />
                      <span style={textShadowStyle}>Wyloguj</span>
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileNavOpen && (
              <div
                className='fixed inset-0 z-50 bg-black/20 backdrop-blur-sm lg:hidden'
                onClick={() => setMobileNavOpen(false)}
              >
                <div
                  className='h-full w-64 bg-white/90 p-6 shadow-xl backdrop-blur-xl'
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className='mb-8 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='rounded-lg bg-red-600 p-1.5'>
                        <Hexagon className='h-5 w-5 fill-current text-white' />
                      </div>
                      <span className='text-xl font-bold text-gray-800'>
                        LowCarb
                      </span>
                    </div>
                    <button
                      onClick={() => setMobileNavOpen(false)}
                      className='rounded-lg p-2 hover:bg-gray-100'
                    >
                      <X className='h-5 w-5 text-gray-600' />
                    </button>
                  </div>
                  <nav className='space-y-2'>
                    {renderNavLinks(() => setMobileNavOpen(false), true)}
                  </nav>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <main className='custom-scrollbar relative h-full flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-4 lg:p-8'>
              {/* Header */}
              <header className='mb-6 flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <button
                    className='rounded-sm bg-white p-2 transition-colors hover:bg-white/70 lg:hidden'
                    onClick={() => setMobileNavOpen(true)}
                  >
                    <Menu className='h-6 w-6 text-gray-600' />
                  </button>

                  {/* View Title with Red Bar */}
                  <div className='flex items-center gap-3'>
                    <div className='hidden h-10 w-1 rounded-full bg-red-600 shadow-sm shadow-red-500/50 sm:block' />
                    <div className='flex flex-col justify-center'>
                      <h1 className='mb-1 text-2xl leading-none font-bold tracking-tight text-gray-800 lg:text-3xl'>
                        {getViewInfo(pathname).title}
                      </h1>
                      <p className='hidden text-sm leading-none font-medium text-gray-600 sm:block lg:text-base'>
                        {getViewInfo(pathname).subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Menu */}
                <div className='relative' ref={headerMenuRef}>
                  <button
                    onClick={() => {
                      if (user) {
                        setHeaderMenuOpen(!headerMenuOpen)
                      } else {
                        router.push('/auth?tab=login')
                      }
                    }}
                    className='group flex cursor-pointer items-center gap-2 rounded-full border-2 border-white bg-white/70 py-1.5 pr-4 pl-1 shadow-sm backdrop-blur-xl transition-colors hover:bg-white/90'
                  >
                    {user ? (
                      <>
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-red-600'>
                          <UserCircle className='h-5 w-5 text-white' />
                        </div>
                        <span className='text-sm font-bold text-gray-700 transition-colors group-hover:text-gray-900'>
                          Witaj {displayName}
                        </span>
                        <ChevronDown className='h-4 w-4 text-gray-500' />
                      </>
                    ) : (
                      <>
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-200'>
                          <User className='h-4 w-4 text-gray-500' />
                        </div>
                        <span className='text-sm font-bold text-gray-700'>
                          Zaloguj się
                        </span>
                      </>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {user && headerMenuOpen && (
                    <div className='absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border-2 border-white bg-white/90 shadow-lg backdrop-blur-xl'>
                      <Link
                        href='/profile'
                        className='flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
                        onClick={() => setHeaderMenuOpen(false)}
                      >
                        <Settings className='h-4 w-4 text-gray-500' />
                        <span>Ustawienia profilu</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className='flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50'
                      >
                        <LogOut className='h-4 w-4' />
                        <span>Wyloguj się</span>
                      </button>
                    </div>
                  )}
                </div>
              </header>

              {/* Page Content */}
              <div className='animate-in fade-in pb-8'>{children}</div>
            </main>
          </div>

          {/* Global Right Side Ad Panel (Visible on Large Screens) */}
          <div className='hidden h-full w-80 2xl:flex'>
            <div className='group flex h-full w-full flex-col rounded-2xl border-2 border-white bg-white/20 p-6 shadow-2xl backdrop-blur-md transition-colors hover:bg-white/30 md:rounded-3xl lg:rounded-3xl'>
              <h3 className='mb-6 text-lg font-bold text-gray-800'>Reklama</h3>
              <div className='flex w-full flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/50 bg-white/40 shadow-inner transition-colors group-hover:border-red-400/50'>
                <MonitorPlay className='h-12 w-12 text-gray-600 transition-colors group-hover:text-red-500' />
                <div className='text-xl font-bold text-gray-700 transition-colors group-hover:text-red-600'>
                  Google Ads
                </div>
                <span className='text-xs font-medium text-gray-500'>
                  Treść sponsorowana
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
