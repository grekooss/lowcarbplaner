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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm'>
      <div className='rounded-2xl border-2 border-white bg-white/80 p-6 shadow-lg backdrop-blur-xl'>
        <Loader2 className='text-primary h-10 w-10 animate-spin' />
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
