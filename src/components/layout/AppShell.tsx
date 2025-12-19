'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import {
  LayoutDashboard,
  CalendarRange,
  Utensils,
  ShoppingCart,
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
    icon: ShoppingCart,
    requiresAuth: true,
  },
]

const textShadowStyle = { textShadow: '0 1px 3px rgba(0,0,0,0.3)' }

const getViewInfo = (pathname: string) => {
  // Root path - will redirect, show nothing
  if (pathname === '/') {
    return { title: '', subtitle: '' }
  }
  if (pathname === '/dashboard') {
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
      subtitle: 'Przeglądaj i odkrywaj pyszne przepisy niskowęglowodanowe',
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
                ? 'text-text-main border-white bg-white/60 font-bold shadow-lg backdrop-blur-xl'
                : 'text-text-secondary hover:text-text-main border-transparent hover:bg-white/10'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              className={cn(
                'h-5 w-5',
                isActive ? 'text-text-muted' : 'text-text-secondary'
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
              ? 'text-text-main border-white bg-white/60 font-bold shadow-lg backdrop-blur-xl'
              : 'border-transparent text-white hover:bg-white/10 hover:text-white'
          )}
          aria-current={isActive ? 'page' : undefined}
        >
          <Icon
            className={cn(
              'h-5 w-5',
              isActive ? 'text-text-muted' : 'text-white'
            )}
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
        <div className='ad-layout-container relative z-30 flex h-full w-full max-w-[1800px] gap-4 lg:gap-6 lg:p-10'>
          {/* Main Glass Panel */}
          <div
            data-main-panel
            className='relative flex h-full w-full flex-1 overflow-hidden rounded-lg border-2 border-white bg-white/20 shadow-2xl ring-1 ring-black/5 backdrop-blur-md sm:rounded-2xl lg:rounded-3xl'
          >
            {/* Sidebar - Desktop only (xl+) */}
            <aside className='hidden h-full w-64 flex-col border-r border-white/30 bg-white/30 px-6 pt-8 pb-4 text-white xl:flex'>
              {/* Logo */}
              <div className='mb-10 flex items-center gap-3 px-2'>
                <div className='bg-primary shadow-primary/30 rounded-lg p-1.5 shadow-lg'>
                  <Hexagon className='h-5 w-5 fill-current text-white' />
                </div>
                <span
                  className='text-xl font-bold tracking-tight'
                  style={textShadowStyle}
                >
                  LowCarbPlaner
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

                {/* System - only show when logged in */}
                {user && (
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
                )}
              </div>
            </aside>

            {/* Mobile/Tablet Sidebar Overlay */}
            {mobileNavOpen && (
              <div
                className='fixed inset-0 z-50 bg-black/20 backdrop-blur-sm xl:hidden'
                onClick={() => setMobileNavOpen(false)}
              >
                <div
                  className='relative -my-[2px] -ml-[2px] h-[calc(100%+4px)] w-64 rounded-r-lg border-2 border-white bg-white/90 p-6 shadow-xl backdrop-blur-xl sm:rounded-r-2xl'
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    className='hover:bg-bg-tertiary absolute top-0.5 right-0.5 rounded-lg p-2'
                  >
                    <X className='text-text-secondary h-5 w-5' />
                  </button>
                  <div className='mt-4 mb-8 flex items-center gap-3'>
                    <div className='bg-primary rounded-lg p-1.5'>
                      <Hexagon className='h-5 w-5 fill-current text-white' />
                    </div>
                    <span className='text-text-main text-xl font-bold'>
                      LowCarbPlaner
                    </span>
                  </div>
                  <nav className='space-y-2'>
                    {renderNavLinks(() => setMobileNavOpen(false), true)}
                  </nav>
                </div>
              </div>
            )}

            {/* Main Content Wrapper - flex column for mobile header + scrollable content */}
            <div className='flex h-full flex-1 flex-col'>
              {/* Mobile Header (< sm) - fixed at top, full width */}
              <div className='relative flex flex-shrink-0 items-center justify-center border-b-2 border-white bg-[var(--bg-card)] p-3 sm:hidden'>
                {/* Hamburger - left */}
                <button
                  className='absolute left-3 rounded-sm bg-white p-1.5 transition-colors hover:bg-white/70'
                  onClick={() => setMobileNavOpen(true)}
                >
                  <Menu className='text-text-secondary h-5 w-5' />
                </button>

                {/* Centered Title */}
                {!pathname.includes('/auth') && getViewInfo(pathname).title && (
                  <h1 className='text-text-main text-base font-bold'>
                    {getViewInfo(pathname).title}
                  </h1>
                )}

                {/* User Icon - right */}
                {(user || !pathname.includes('/auth')) && (
                  <div className='absolute right-3' ref={headerMenuRef}>
                    <button
                      onClick={() => {
                        if (user) {
                          setHeaderMenuOpen(!headerMenuOpen)
                        } else {
                          router.push('/auth?tab=login')
                        }
                      }}
                      className='rounded-sm p-1 transition-opacity hover:opacity-70'
                    >
                      {user ? (
                        <div className='bg-primary flex h-7 w-7 items-center justify-center rounded-full'>
                          <UserCircle className='h-4 w-4 text-white' />
                        </div>
                      ) : (
                        <div className='bg-bg-tertiary flex h-7 w-7 items-center justify-center rounded-full'>
                          <User className='text-text-muted h-4 w-4' />
                        </div>
                      )}
                    </button>

                    {/* Dropdown Menu - Mobile */}
                    {user && headerMenuOpen && (
                      <div className='absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border-2 border-white bg-white/90 shadow-lg backdrop-blur-xl'>
                        <Link
                          href='/profile'
                          className='text-text-secondary hover:bg-bg-tertiary flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors'
                          onClick={() => setHeaderMenuOpen(false)}
                        >
                          <Settings className='text-text-muted h-4 w-4' />
                          <span>Ustawienia profilu</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className='text-primary hover:bg-primary/5 flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors'
                        >
                          <LogOut className='h-4 w-4' />
                          <span>Wyloguj się</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Main Content Area */}
              <main
                data-content-area
                className='custom-scrollbar relative h-full flex-1 overflow-x-hidden overflow-y-auto bg-transparent px-2 py-3 sm:pt-2 lg:p-8 lg:pt-4'
              >
                {/* Header - Tablet/Desktop only */}
                <header className='mb-2 sm:mb-4 lg:mt-2 lg:mb-6'>
                  {/* Tablet/Desktop Header (>= sm) - original layout */}
                  <div className='hidden items-center justify-between sm:flex'>
                    <div className='flex items-center gap-4'>
                      <button
                        className='rounded-sm bg-white p-2 transition-colors hover:bg-white/70 xl:hidden'
                        onClick={() => setMobileNavOpen(true)}
                      >
                        <Menu className='text-text-secondary h-6 w-6' />
                      </button>

                      {/* View Title with Red Bar - hide when auth modal is open or on root path */}
                      {!pathname.includes('/auth') &&
                        getViewInfo(pathname).title && (
                          <div className='flex items-center gap-3'>
                            <div className='bg-primary shadow-primary/50 h-10 w-1 rounded-full shadow-sm' />
                            <div className='flex flex-col justify-center'>
                              <h1 className='text-text-main mb-1 text-2xl leading-none font-bold tracking-tight lg:mb-1.5 lg:text-3xl'>
                                {getViewInfo(pathname).title}
                              </h1>
                              <p className='text-text-secondary text-sm leading-none font-medium lg:text-base'>
                                {getViewInfo(pathname).subtitle}
                              </p>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* User Menu - hide login button when auth modal is open */}
                    {(user || !pathname.includes('/auth')) && (
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
                              <div className='bg-primary flex h-8 w-8 items-center justify-center rounded-full'>
                                <UserCircle className='h-5 w-5 text-white' />
                              </div>
                              <span className='text-text-secondary group-hover:text-text-main text-sm font-bold transition-colors'>
                                Witaj {displayName}
                              </span>
                              <ChevronDown className='text-text-muted h-4 w-4' />
                            </>
                          ) : (
                            <>
                              <div className='bg-bg-tertiary flex h-8 w-8 items-center justify-center rounded-full'>
                                <User className='text-text-muted h-4 w-4' />
                              </div>
                              <span className='text-text-secondary text-sm font-bold'>
                                Zaloguj się
                              </span>
                            </>
                          )}
                        </button>

                        {/* Dropdown Menu - Tablet/Desktop */}
                        {user && headerMenuOpen && (
                          <div className='absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border-2 border-white bg-white/90 shadow-lg backdrop-blur-xl'>
                            <Link
                              href='/profile'
                              className='text-text-secondary hover:bg-bg-tertiary flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors'
                              onClick={() => setHeaderMenuOpen(false)}
                            >
                              <Settings className='text-text-muted h-4 w-4' />
                              <span>Ustawienia profilu</span>
                            </Link>
                            <button
                              onClick={handleLogout}
                              className='text-primary hover:bg-primary/5 flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors'
                            >
                              <LogOut className='h-4 w-4' />
                              <span>Wyloguj się</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </header>

                {/* Page Content */}
                <div className='animate-in fade-in pb-8'>{children}</div>
              </main>
            </div>
          </div>

          {/* Global Right Side Ad Panel (Visible on Large Screens - Desktop) */}
          <div className='hidden h-full w-80 flex-shrink-0 2xl:flex'>
            <div className='group flex h-full w-full flex-col rounded-2xl border-2 border-white bg-white/20 p-6 shadow-2xl backdrop-blur-md transition-colors hover:bg-white/30 md:rounded-3xl lg:rounded-3xl'>
              <h3 className='text-text-main mb-6 text-lg font-bold'>Reklama</h3>
              <div className='group-hover:border-primary/50 flex w-full flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/50 bg-white/40 shadow-inner transition-colors'>
                <MonitorPlay className='text-text-secondary group-hover:text-primary h-12 w-12 transition-colors' />
                <div className='text-text-secondary group-hover:text-primary text-xl font-bold transition-colors'>
                  Google Ads
                </div>
                <span className='text-text-muted text-xs font-medium'>
                  Treść sponsorowana
                </span>
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Ad Panel - Landscape (Right Side) */}
          <div className='ad-panel-landscape h-full w-48 flex-shrink-0 pr-[env(safe-area-inset-right,8px)] md:w-56'>
            <div className='group flex h-full w-full flex-col rounded-lg border-2 border-white bg-white/20 p-3 shadow-2xl backdrop-blur-md transition-colors hover:bg-white/30 sm:rounded-2xl md:p-4 lg:rounded-3xl'>
              <h3 className='text-text-main mb-3 text-xs font-bold md:mb-4 md:text-sm'>
                Reklama
              </h3>
              <div className='group-hover:border-primary/50 flex w-full flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-white/50 bg-white/40 shadow-inner transition-colors sm:rounded-xl'>
                <MonitorPlay className='text-text-secondary group-hover:text-primary h-8 w-8 transition-colors md:h-10 md:w-10' />
                <div className='text-text-secondary group-hover:text-primary text-base font-bold transition-colors md:text-lg'>
                  Google Ads
                </div>
                <span className='text-text-muted text-[10px] font-medium'>
                  Treść sponsorowana
                </span>
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Ad Panel - Portrait (Bottom) */}
          <div className='ad-panel-portrait h-24 w-full flex-shrink-0 pb-[env(safe-area-inset-bottom,8px)] md:h-28'>
            <div className='group flex h-full w-full flex-col rounded-lg border-2 border-white bg-white/20 p-2 shadow-2xl backdrop-blur-md transition-colors hover:bg-white/30 sm:rounded-2xl md:p-3 lg:rounded-3xl'>
              <div className='group-hover:border-primary/50 flex h-full w-full cursor-pointer flex-row items-center justify-center gap-3 rounded-md border-2 border-dashed border-white/50 bg-white/40 shadow-inner transition-colors sm:rounded-xl md:gap-4'>
                <MonitorPlay className='text-text-secondary group-hover:text-primary h-7 w-7 transition-colors md:h-8 md:w-8' />
                <div className='flex flex-col items-start'>
                  <div className='text-text-secondary group-hover:text-primary text-sm font-bold transition-colors md:text-base'>
                    Google Ads
                  </div>
                  <span className='text-text-muted text-[10px] font-medium'>
                    Treść sponsorowana
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
