/**
 * Dynamic Chart Components
 *
 * Lazy-loaded recharts components to reduce initial bundle size.
 * These components are only loaded when they're actually rendered.
 *
 * @see https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading
 */

'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type {
  ResponsiveContainer as ResponsiveContainerType,
  PieChart as PieChartType,
  BarChart as BarChartType,
  Pie as PieType,
  Bar as BarType,
  Cell as CellType,
  XAxis as XAxisType,
  YAxis as YAxisType,
} from 'recharts'

/**
 * Loading placeholder for charts
 */
function ChartLoading() {
  return (
    <div className='flex h-[200px] animate-pulse items-center justify-center rounded-lg bg-white/20'>
      <span className='text-sm text-gray-400'>Ładowanie wykresu...</span>
    </div>
  )
}

/**
 * Dynamic ResponsiveContainer
 * Wrapper component that makes charts responsive
 */
export const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  {
    ssr: false,
    loading: () => <ChartLoading />,
  }
) as typeof ResponsiveContainerType

/**
 * Dynamic PieChart
 * Used for circular progress displays (e.g., calorie balance)
 */
export const PieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  { ssr: false }
) as typeof PieChartType

/**
 * Dynamic BarChart
 * Used for progress bars and comparisons
 */
export const BarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false }
) as typeof BarChartType

/**
 * Dynamic Pie component
 */
export const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), {
  ssr: false,
}) as typeof PieType

/**
 * Dynamic Bar component
 */
export const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), {
  ssr: false,
}) as typeof BarType

/**
 * Dynamic Cell component
 */
export const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), {
  ssr: false,
}) as typeof CellType

/**
 * Dynamic XAxis component
 */
export const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
) as typeof XAxisType

/**
 * Dynamic YAxis component
 */
export const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
) as typeof YAxisType

/**
 * Re-export component props types for convenience
 */
export type ResponsiveContainerProps = ComponentProps<
  typeof ResponsiveContainerType
>
export type PieChartProps = ComponentProps<typeof PieChartType>
export type BarChartProps = ComponentProps<typeof BarChartType>
export type PieProps = ComponentProps<typeof PieType>
export type BarProps = ComponentProps<typeof BarType>
export type CellProps = ComponentProps<typeof CellType>
export type XAxisProps = ComponentProps<typeof XAxisType>
export type YAxisProps = ComponentProps<typeof YAxisType>
