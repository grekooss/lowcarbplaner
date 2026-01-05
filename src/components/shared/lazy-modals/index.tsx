/**
 * Lazy-loaded Modal Components
 *
 * Dynamic imports for heavy modal components to reduce initial bundle size.
 * These components are only loaded when they're actually needed.
 *
 * @see https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading
 */

'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import type { ComponentProps } from 'react'
import type { RecipeViewModal as RecipeViewModalType } from '../RecipeViewModal'
import type { SwapRecipeDialog as SwapRecipeDialogType } from '../SwapRecipeDialog'
import type { RecipePreviewModal as RecipePreviewModalType } from '../RecipePreviewModal'

/**
 * Loading placeholder for modals
 */
function ModalLoading() {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='flex flex-col items-center gap-3 rounded-2xl border-2 border-white bg-white/80 p-6 shadow-2xl'>
        <Loader2 className='h-8 w-8 animate-spin text-red-600' />
        <span className='text-sm font-medium text-gray-600'>Ładowanie...</span>
      </div>
    </div>
  )
}

/**
 * Lazy RecipeViewModal
 * Used for viewing recipe details with ingredient editing
 * ~550 lines, loads RecipeDetailClient (~1000 lines)
 */
export const LazyRecipeViewModal = dynamic(
  () =>
    import('../RecipeViewModal').then((mod) => ({
      default: mod.RecipeViewModal,
    })),
  {
    loading: () => <ModalLoading />,
    ssr: false,
  }
) as typeof RecipeViewModalType

/**
 * Lazy SwapRecipeDialog
 * Used for swapping recipes in meal plans
 * ~400 lines with image loading and replacement logic
 */
export const LazySwapRecipeDialog = dynamic(
  () =>
    import('../SwapRecipeDialog').then((mod) => ({
      default: mod.SwapRecipeDialog,
    })),
  {
    loading: () => <ModalLoading />,
    ssr: false,
  }
) as typeof SwapRecipeDialogType

/**
 * Lazy RecipePreviewModal
 * Used for quick recipe preview
 */
export const LazyRecipePreviewModal = dynamic(
  () =>
    import('../RecipePreviewModal').then((mod) => ({
      default: mod.RecipePreviewModal,
    })),
  {
    loading: () => <ModalLoading />,
    ssr: false,
  }
) as typeof RecipePreviewModalType

/**
 * Re-export component props types for convenience
 */
export type LazyRecipeViewModalProps = ComponentProps<
  typeof RecipeViewModalType
>
export type LazySwapRecipeDialogProps = ComponentProps<
  typeof SwapRecipeDialogType
>
export type LazyRecipePreviewModalProps = ComponentProps<
  typeof RecipePreviewModalType
>
