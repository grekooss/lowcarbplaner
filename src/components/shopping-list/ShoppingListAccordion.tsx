'use client'

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
 * Każda kategoria to osobny AccordionItem z możliwością collapse/expand.
 * Używa shadcn/ui Accordion z type="multiple" (wiele kategorii może być
 * otwartych jednocześnie).
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
  return (
    <Accordion type='multiple' className='w-full space-y-2'>
      {shoppingList.map((categoryData) => {
        const categoryLabel = INGREDIENT_CATEGORY_LABELS[categoryData.category]
        const itemCount = categoryData.items.length

        return (
          <AccordionItem
            key={categoryData.category}
            value={categoryData.category}
            className='rounded-lg border px-4'
          >
            <AccordionTrigger className='hover:no-underline'>
              <div className='flex w-full items-center justify-between pr-4'>
                <span className='text-lg font-semibold'>{categoryLabel}</span>
                <span className='text-muted-foreground text-sm'>
                  {itemCount} {itemCount === 1 ? 'produkt' : 'produkty'}
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
  )
}
