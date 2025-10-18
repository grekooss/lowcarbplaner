'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  CalendarRange,
  Utensils,
  ShoppingBag,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Panel Dzienny', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Widok Tygodnia', href: '/meal-plan', icon: CalendarRange },
  { label: 'Przepisy', href: '/recipes', icon: Utensils },
  { label: 'Lista zakupow', href: '/shopping-list', icon: ShoppingBag },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

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
          onClick={() => onNavigate?.()}
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
      <div className='flex min-h-screen justify-center bg-[var(--background)] px-3 py-6 text-slate-900 sm:px-6 lg:px-10'>
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
            <div className='mt-auto flex items-center gap-3 rounded-2xl bg-[var(--bg-card)] px-4 py-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--primary)] text-sm font-semibold text-[color:var(--primary-foreground)]'>
                AK
              </div>
              <div>
                <p className='text-sm font-semibold'>Anna Kowalska</p>
                <p className='text-xs text-slate-500'>Zarzadzaj profilem</p>
              </div>
            </div>
          </aside>

          <div className='flex flex-1 flex-col overflow-hidden bg-white'>
            <header className='flex items-center justify-between border-b border-black/5 bg-[var(--bg-card)] px-5 py-4 lg:px-8'>
              <button
                type='button'
                className='inline-flex items-center justify-center rounded-xl bg-white p-2 text-slate-700 shadow-sm lg:hidden'
                onClick={() => setMobileNavOpen(true)}
                aria-label='Otworz menu'
              >
                <Menu className='h-5 w-5' />
              </button>

              <div className='hidden text-sm font-semibold text-slate-500 lg:block'>
                Witaj ponownie!{' '}
                {new Date().toLocaleDateString('pl-PL', { weekday: 'long' })}
              </div>

              <div className='ml-auto flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm lg:ml-0'>
                <div className='text-right'>
                  <p className='text-sm font-semibold'>Anna Kowalska</p>
                  <p className='text-xs text-slate-500'>Premium</p>
                </div>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--primary)] text-sm font-semibold text-[color:var(--primary-foreground)]'>
                  AK
                </div>
              </div>
            </header>

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
