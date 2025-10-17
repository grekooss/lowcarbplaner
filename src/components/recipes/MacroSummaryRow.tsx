'use client'

import type { LucideIcon } from 'lucide-react'

type MacroItem = {
  icon: LucideIcon
  text: string
}

interface MacroSummaryRowProps {
  items: MacroItem[]
  className?: string
}

export function MacroSummaryRow({ items, className }: MacroSummaryRowProps) {
  return (
    <div
      className={`inline-flex flex-nowrap items-center gap-2 overflow-hidden rounded-full bg-white px-2.5 py-1 text-xs text-black ${className ?? ''}`}
    >
      {items.map(({ icon: Icon, text }, index) => (
        <div
          key={`${text}-${index}`}
          className='flex shrink-0 items-center gap-2'
        >
          {index > 0 && (
            <span
              className='hidden h-3 w-px shrink-0 bg-slate-200 sm:block'
              aria-hidden
            />
          )}
          <div className='flex shrink-0 items-center gap-1.5 whitespace-nowrap'>
            <Icon className='h-3.5 w-3.5 shrink-0 text-black' />
            <span className='shrink-0 font-medium text-black'>{text}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
