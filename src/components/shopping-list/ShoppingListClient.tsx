'use client'

import { useState, useEffect, useMemo } from 'react'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { ShoppingListAccordion } from './ShoppingListAccordion'
import { EmptyState } from './EmptyState'
import { logWarning } from '@/lib/error-logger'
import { cleanupPurchasedState } from '@/types/shopping-list-view.types'
import type { ShoppingListResponseDTO } from '@/types/dto.types'
import type { PurchasedItemsState } from '@/types/shopping-list-view.types'

interface ShoppingListClientProps {
  initialShoppingList: ShoppingListResponseDTO
}

const STORAGE_KEY = 'shopping-list-purchased'

/**
 * ShoppingListClient - Główny wrapper po stronie klienta
 *
 * Zarządza stanem zaznaczonych produktów (purchased state) z persistence
 * w localStorage. Integruje się z wszystkimi komponentami dzieci.
 */
export const ShoppingListClient = ({
  initialShoppingList,
}: ShoppingListClientProps) => {
  const [purchasedItems, setPurchasedItems] = useState<PurchasedItemsState>({})
  const [isHydrated, setIsHydrated] = useState(false)

  // Load purchased state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const cleaned = cleanupPurchasedState(parsed, initialShoppingList)
        setPurchasedItems(cleaned)
      }
    } catch (error) {
      logWarning(error, {
        source: 'ShoppingListClient.loadFromLocalStorage',
      })
      setPurchasedItems({})
    }
    setIsHydrated(true)
  }, [initialShoppingList])

  // Save purchased state to localStorage on change (only after hydration)
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(purchasedItems))
    } catch (error) {
      logWarning(error, {
        source: 'ShoppingListClient.saveToLocalStorage',
      })
    }
  }, [purchasedItems, isHydrated])

  const handleTogglePurchased = (category: string, itemName: string) => {
    const key = `${category}__${itemName}`
    setPurchasedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Calculate stats
  const stats = useMemo(() => {
    const totalItems = initialShoppingList.reduce(
      (sum, cat) => sum + cat.items.length,
      0
    )
    const purchasedCount = Object.values(purchasedItems).filter(Boolean).length
    return { totalItems, purchasedCount }
  }, [initialShoppingList, purchasedItems])

  // Show spinner overlay during hydration
  if (!isHydrated) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm'>
        <div className='rounded-2xl border-2 border-white bg-white/80 p-6 shadow-lg backdrop-blur-xl'>
          <Loader2 className='text-primary h-10 w-10 animate-spin' />
        </div>
      </div>
    )
  }

  if (initialShoppingList.length === 0) {
    return <EmptyState />
  }

  return (
    <>
      {/* Header Card - szerokość dopasowana do lewej kolumny gridu */}
      <section className='w-full lg:w-[calc((100%-24px)/2)]'>
        <div className='flex items-center justify-center gap-6 rounded-md border-2 border-white bg-white/40 px-6 py-3 shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl sm:rounded-2xl'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary flex h-8 w-8 items-center justify-center rounded-sm'>
              <Circle className='h-4 w-4 text-white' />
            </div>
            <div className='text-center'>
              <p className='text-text-muted text-xs font-bold tracking-wide uppercase'>
                Do kupienia
              </p>
              <p className='text-text-main text-lg font-bold'>
                {stats.totalItems - stats.purchasedCount}
              </p>
            </div>
          </div>

          <div className='bg-border h-8 w-px' />

          <div className='flex items-center gap-3'>
            <div className='bg-primary flex h-8 w-8 items-center justify-center rounded-sm'>
              <CheckCircle2 className='h-4 w-4 text-white' />
            </div>
            <div className='text-center'>
              <p className='text-text-muted text-xs font-bold tracking-wide uppercase'>
                Kupione
              </p>
              <p className='text-text-main text-lg font-bold'>
                {stats.purchasedCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shopping List */}
      <section className='w-full'>
        <ShoppingListAccordion
          shoppingList={initialShoppingList}
          purchasedItems={purchasedItems}
          onTogglePurchased={handleTogglePurchased}
        />
      </section>
    </>
  )
}
