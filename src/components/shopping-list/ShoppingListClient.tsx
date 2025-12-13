'use client'

import { useState, useEffect, useMemo } from 'react'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { ShoppingListAccordion } from './ShoppingListAccordion'
import { EmptyState } from './EmptyState'
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
      console.error('Failed to load purchased items from localStorage:', error)
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
      console.error('Failed to save purchased items to localStorage:', error)
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

  // Show spinner during hydration
  if (!isHydrated) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center'>
        <Loader2 className='h-12 w-12 animate-spin text-red-600' />
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
            <div className='flex h-8 w-8 items-center justify-center rounded-sm bg-red-600'>
              <Circle className='h-4 w-4 text-white' />
            </div>
            <div className='text-center'>
              <p className='text-xs font-bold tracking-wide text-gray-400 uppercase'>
                Do kupienia
              </p>
              <p className='text-lg font-bold text-gray-800'>
                {stats.totalItems - stats.purchasedCount}
              </p>
            </div>
          </div>

          <div className='h-8 w-px bg-gray-200' />

          <div className='flex items-center gap-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-sm bg-red-600'>
              <CheckCircle2 className='h-4 w-4 text-white' />
            </div>
            <div className='text-center'>
              <p className='text-xs font-bold tracking-wide text-gray-400 uppercase'>
                Kupione
              </p>
              <p className='text-lg font-bold text-gray-800'>
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
