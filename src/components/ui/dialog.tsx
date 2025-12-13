'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'
import { Cross2Icon } from '@radix-ui/react-icons'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

interface DialogOverlayProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> {
  /**
   * When provided, constrains the overlay to the main panel area
   */
  panelRect?: DOMRect | null
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  DialogOverlayProps
>(({ className, panelRect, style, ...props }, ref) => {
  const constrainedStyle = panelRect
    ? {
        position: 'fixed' as const,
        top: panelRect.top,
        left: panelRect.left,
        width: panelRect.width,
        height: panelRect.height,
        borderRadius: 'inherit',
      }
    : {}

  return (
    <DialogPrimitive.Overlay
      ref={ref}
      style={{ ...constrainedStyle, ...style }}
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50 bg-transparent',
        !panelRect && 'fixed inset-0',
        panelRect && 'rounded-lg sm:rounded-2xl lg:rounded-3xl',
        className
      )}
      {...props}
    />
  )
})
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /**
   * When true, centers the dialog within the main panel area (not the full viewport)
   */
  constrainToMainPanel?: boolean
  /**
   * When true, dialog exactly covers the main panel (full width/height of panel)
   */
  coverMainPanel?: boolean
  /**
   * When true, covers main panel on mobile (<640px), centered modal on larger screens
   */
  coverMainPanelOnMobile?: boolean
  /**
   * When true, hides the default close button (useful when providing custom close button)
   */
  hideCloseButton?: boolean
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    {
      className,
      children,
      constrainToMainPanel = false,
      coverMainPanel = false,
      coverMainPanelOnMobile = false,
      hideCloseButton = false,
      ...props
    },
    ref
  ) => {
    const [mainPanelRect, setMainPanelRect] = React.useState<DOMRect | null>(
      null
    )
    const [contentAreaRect, setContentAreaRect] =
      React.useState<DOMRect | null>(null)
    const [isMobile, setIsMobile] = React.useState(false)

    // Determine if we need panel-based positioning
    const needsPanelRect =
      constrainToMainPanel || coverMainPanel || coverMainPanelOnMobile

    React.useEffect(() => {
      if (!needsPanelRect) return

      const updateState = () => {
        const mainPanel = document.querySelector('[data-main-panel]')
        const contentArea = document.querySelector('[data-content-area]')

        if (mainPanel) {
          setMainPanelRect(mainPanel.getBoundingClientRect())
        }
        if (contentArea) {
          setContentAreaRect(contentArea.getBoundingClientRect())
        }
        // Mobile breakpoint - use 640 to match sm: breakpoint in Tailwind
        setIsMobile(window.innerWidth < 640)
      }

      updateState()
      window.addEventListener('resize', updateState)
      return () => window.removeEventListener('resize', updateState)
    }, [needsPanelRect])

    // Determine effective mode based on screen size
    const effectiveCoverMainPanel =
      coverMainPanel || (coverMainPanelOnMobile && isMobile)
    const effectiveConstrainToMainPanel =
      constrainToMainPanel || (coverMainPanelOnMobile && !isMobile)

    // Select the appropriate rect based on mode
    // coverMainPanel uses full main panel (including sidebar)
    // constrainToMainPanel uses content area (without sidebar)
    const panelRect = effectiveCoverMainPanel
      ? mainPanelRect || contentAreaRect
      : contentAreaRect || mainPanelRect

    // Full coverage of main panel
    const coverStyle =
      effectiveCoverMainPanel && panelRect
        ? {
            position: 'fixed' as const,
            top: panelRect.top,
            left: panelRect.left,
            width: panelRect.width,
            height: panelRect.height,
            transform: 'none',
            maxWidth: 'none',
            maxHeight: 'none',
          }
        : {}

    // Centered within main panel (not covering it)
    const constrainStyle =
      effectiveConstrainToMainPanel && !effectiveCoverMainPanel && panelRect
        ? {
            position: 'fixed' as const,
            top: panelRect.top + panelRect.height / 2,
            left: panelRect.left + panelRect.width / 2,
            transform: 'translate(-50%, -50%)',
            // Don't set maxWidth - let CSS classes control it (e.g., sm:max-w-sm)
            maxHeight: `calc(${panelRect.height}px - 32px)`,
          }
        : {}

    const panelStyle = effectiveCoverMainPanel ? coverStyle : constrainStyle

    return (
      <DialogPortal>
        <DialogOverlay panelRect={needsPanelRect ? panelRect : null} />
        <DialogPrimitive.Content
          ref={ref}
          style={panelStyle}
          className={cn(
            'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed z-50 border shadow-lg duration-200 sm:rounded-lg',
            // Default padding only when not covering main panel (full-screen modals handle their own padding)
            !effectiveCoverMainPanel && 'p-6',
            // Default viewport centering when not using panel-based positioning
            // or as fallback before panelRect is loaded
            (!needsPanelRect || !panelRect) &&
              'top-[50%] left-[50%] w-full max-w-lg translate-x-[-50%] translate-y-[-50%]',
            // Width constraint for panel-based non-cover modals
            needsPanelRect &&
              panelRect &&
              !effectiveCoverMainPanel &&
              'w-full max-w-lg',
            className
          )}
          {...props}
        >
          {children}
          {!hideCloseButton && (
            <DialogPrimitive.Close
              className='data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-3 right-3 z-30 opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none'
              onMouseDown={(e) => e.preventDefault()}
            >
              <Cross2Icon className='h-5 w-5' />
              <span className='sr-only'>Close</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    )
  }
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg leading-none font-semibold tracking-tight',
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
