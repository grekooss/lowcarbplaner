'use client'

import { useState, useEffect } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { CategorySection } from './CategorySection'
import { INGREDIENT_CATEGORY_LABELS } from '@/types/recipes-view.types'
import type { ShoppingListResponseDTO } from '@/types/dto.types'
import type { PurchasedItemsState } from '@/types/shopping-list-view.types'

interface ShoppingListAccordionProps {
  shoppingList: ShoppingListResponseDTO
  purchasedItems: PurchasedItemsState
  onTogglePurchased: (category: string, itemName: string) => void
}

/**
 * ShoppingListAccordion - Accordion container dla kategorii produktów
 *
 * Logika:
 * - Domyślnie wszystkie kategorie są rozwinięte
 * - Auto-collapse gdy wszystkie produkty w kategorii są odhaczone
 * - Używa shadcn/ui Accordion z type="multiple"
 *
 * @param shoppingList - Lista kategorii ze składnikami z API
 * @param purchasedItems - Stan zaznaczonych produktów
 * @param onTogglePurchased - Callback wywoływany przy toggle checkbox
 */
export const ShoppingListAccordion = ({
  shoppingList,
  purchasedItems,
  onTogglePurchased,
}: ShoppingListAccordionProps) => {
  // State dla otwartych kategorii
  const [openCategories, setOpenCategories] = useState<string[]>([])

  // Inicjalizacja: rozwiń wszystkie kategorie przy pierwszym renderze
  useEffect(() => {
    const allCategories = shoppingList.map((cat) => cat.category)
    setOpenCategories(allCategories)
  }, [shoppingList])

  // Auto-collapse gdy wszystkie produkty w kategorii są kupione
  useEffect(() => {
    const updatedOpenCategories = shoppingList
      .filter((categoryData) => {
        // Sprawdź czy wszystkie produkty w kategorii są kupione
        const allPurchased = categoryData.items.every((item) => {
          const key = `${categoryData.category}__${item.name}`
          return purchasedItems[key] === true
        })
        // Jeśli wszystkie kupione, usuń z otwartych
        return !allPurchased
      })
      .map((cat) => cat.category)

    setOpenCategories(updatedOpenCategories)
  }, [purchasedItems, shoppingList])

  return (
    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
      <Accordion
        type='multiple'
        value={openCategories}
        onValueChange={setOpenCategories}
        className='w-full space-y-4 lg:col-span-1'
      >
        {shoppingList
          .slice(0, Math.ceil(shoppingList.length / 2))
          .map((categoryData) => {
            const categoryLabel =
              INGREDIENT_CATEGORY_LABELS[categoryData.category]
            const itemCount = categoryData.items.length

            // Oblicz ile produktów jest kupionych
            const purchasedCount = categoryData.items.filter((item) => {
              const key = `${categoryData.category}__${item.name}`
              return purchasedItems[key] === true
            }).length

            return (
              <AccordionItem
                key={categoryData.category}
                value={categoryData.category}
                className='card-soft rounded-3xl border-0 px-6 py-4 shadow-sm'
              >
                <AccordionTrigger className='hover:no-underline'>
                  <div className='flex w-full items-center justify-between pr-4'>
                    <span className='text-foreground text-lg font-semibold'>
                      {categoryLabel}
                    </span>
                    <span className='text-muted-foreground text-sm font-medium'>
                      {purchasedCount}/{itemCount}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CategorySection
                    category={categoryData.category}
                    items={categoryData.items}
                    purchasedItems={purchasedItems}
                    onTogglePurchased={onTogglePurchased}
                  />
                </AccordionContent>
              </AccordionItem>
            )
          })}
      </Accordion>

      <Accordion
        type='multiple'
        value={openCategories}
        onValueChange={setOpenCategories}
        className='w-full space-y-4 lg:col-span-1'
      >
        {shoppingList
          .slice(Math.ceil(shoppingList.length / 2))
          .map((categoryData) => {
            const categoryLabel =
              INGREDIENT_CATEGORY_LABELS[categoryData.category]
            const itemCount = categoryData.items.length

            // Oblicz ile produktów jest kupionych
            const purchasedCount = categoryData.items.filter((item) => {
              const key = `${categoryData.category}__${item.name}`
              return purchasedItems[key] === true
            }).length

            return (
              <AccordionItem
                key={categoryData.category}
                value={categoryData.category}
                className='card-soft rounded-3xl border-0 px-6 py-4 shadow-sm'
              >
                <AccordionTrigger className='hover:no-underline'>
                  <div className='flex w-full items-center justify-between pr-4'>
                    <span className='text-foreground text-lg font-semibold'>
                      {categoryLabel}
                    </span>
                    <span className='text-muted-foreground text-sm font-medium'>
                      {purchasedCount}/{itemCount}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CategorySection
                    category={categoryData.category}
                    items={categoryData.items}
                    purchasedItems={purchasedItems}
                    onTogglePurchased={onTogglePurchased}
                  />
                </AccordionContent>
              </AccordionItem>
            )
          })}
      </Accordion>
    </div>
  )
}
