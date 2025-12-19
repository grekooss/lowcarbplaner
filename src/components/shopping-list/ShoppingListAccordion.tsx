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
 */
export const ShoppingListAccordion = ({
  shoppingList,
  purchasedItems,
  onTogglePurchased,
}: ShoppingListAccordionProps) => {
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
        const allPurchased = categoryData.items.every((item) => {
          const key = `${categoryData.category}__${item.name}`
          return purchasedItems[key] === true
        })
        return !allPurchased
      })
      .map((cat) => cat.category)

    setOpenCategories(updatedOpenCategories)
  }, [purchasedItems, shoppingList])

  // Render single category card
  const renderCategoryCard = (
    categoryData: ShoppingListResponseDTO[number]
  ) => {
    const categoryLabel = INGREDIENT_CATEGORY_LABELS[categoryData.category]
    const itemCount = categoryData.items.length

    const purchasedCount = categoryData.items.filter((item) => {
      const key = `${categoryData.category}__${item.name}`
      return purchasedItems[key] === true
    }).length

    const allPurchased = purchasedCount === itemCount

    return (
      <AccordionItem
        key={categoryData.category}
        value={categoryData.category}
        className='rounded-md border-2 border-white bg-white/40 shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl sm:rounded-2xl'
      >
        <AccordionTrigger className='px-4 py-3 hover:no-underline sm:px-6 sm:py-4'>
          <div className='flex w-full items-center justify-between pr-4'>
            <span
              className={`text-base font-bold sm:text-lg ${allPurchased ? 'text-text-muted' : 'text-text-main'}`}
            >
              {categoryLabel}
            </span>
            <span
              className={`rounded-sm px-2.5 py-1 text-xs font-bold ${
                allPurchased
                  ? 'bg-primary text-white'
                  : 'bg-bg-tertiary text-text-secondary'
              }`}
            >
              {purchasedCount} / {itemCount}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className='px-4 pb-3 sm:px-6 sm:pb-4'>
          <CategorySection
            category={categoryData.category}
            items={categoryData.items}
            purchasedItems={purchasedItems}
            onTogglePurchased={onTogglePurchased}
          />
        </AccordionContent>
      </AccordionItem>
    )
  }

  // Split categories into two columns for desktop - balanced by item count
  const { leftColumn, rightColumn } = (() => {
    const totalItems = shoppingList.reduce(
      (sum, cat) => sum + cat.items.length,
      0
    )
    const targetPerColumn = totalItems / 2

    let leftItems = 0
    let splitIndex = 0

    for (let i = 0; i < shoppingList.length; i++) {
      const category = shoppingList[i]
      if (!category) continue
      const categoryItems = category.items.length
      // Check if adding this category keeps us closer to target
      if (leftItems + categoryItems <= targetPerColumn || i === 0) {
        leftItems += categoryItems
        splitIndex = i + 1
      } else {
        // Check if current split is better than adding one more
        const withoutCurrent = Math.abs(leftItems - targetPerColumn)
        const withCurrent = Math.abs(
          leftItems + categoryItems - targetPerColumn
        )
        if (withCurrent < withoutCurrent) {
          leftItems += categoryItems
          splitIndex = i + 1
        }
        break
      }
    }

    return {
      leftColumn: shoppingList.slice(0, splitIndex),
      rightColumn: shoppingList.slice(splitIndex),
    }
  })()

  return (
    <div className='grid grid-cols-1 gap-3 sm:gap-6 lg:grid-cols-2'>
      <Accordion
        type='multiple'
        value={openCategories}
        onValueChange={setOpenCategories}
        className='flex w-full flex-col gap-3 sm:gap-6'
      >
        {leftColumn.map(renderCategoryCard)}
      </Accordion>

      <Accordion
        type='multiple'
        value={openCategories}
        onValueChange={setOpenCategories}
        className='flex w-full flex-col gap-3 sm:gap-6'
      >
        {rightColumn.map(renderCategoryCard)}
      </Accordion>
    </div>
  )
}
