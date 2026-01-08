'use client'

/**
 * AnimatedMacroCards Component
 *
 * Animowane karty makroskładników w stylu "jednoręki bandyta"
 * Wartości procentowe się kręcą i pokazują różne zestawy makro z onboardingu
 */

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface MacroSet {
  id: string
  label: string
  fats: number
  protein: number
  carbs: number
}

const MACRO_SETS: MacroSet[] = [
  {
    id: '70_25_5',
    label: 'Keto restrykcyjne',
    fats: 70,
    protein: 25,
    carbs: 5,
  },
  {
    id: '60_35_5',
    label: 'Keto wysokobiałkowe',
    fats: 60,
    protein: 35,
    carbs: 5,
  },
  {
    id: '60_30_10',
    label: 'Zbalansowane keto',
    fats: 60,
    protein: 30,
    carbs: 10,
  },
  {
    id: '60_25_15',
    label: 'Standardowe keto',
    fats: 60,
    protein: 25,
    carbs: 15,
  },
  {
    id: '50_30_20',
    label: 'Umiarkowane low-carb',
    fats: 50,
    protein: 30,
    carbs: 20,
  },
  {
    id: '45_30_25',
    label: 'Liberalne low-carb',
    fats: 45,
    protein: 30,
    carbs: 25,
  },
  { id: '40_40_20', label: 'Wysokobiałkowe', fats: 40, protein: 40, carbs: 20 },
]

// Komponent pojedynczej cyfry kręcącej się w stylu slot machine
function SlotDigit({
  value,
  isSpinning,
  delay = 0,
}: {
  value: number
  isSpinning: boolean
  delay?: number
}) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isBlurred, setIsBlurred] = useState(false)

  // Synchronizuj displayValue z value gdy nie ma animacji
  useEffect(() => {
    if (!isSpinning) {
      setDisplayValue(value)
      setIsBlurred(false)
    }
  }, [value, isSpinning])

  // Obsługa animacji
  useEffect(() => {
    if (!isSpinning) return

    // Rozpocznij blur po delay
    const blurTimeout = setTimeout(() => {
      setIsBlurred(true)
    }, delay)

    // Kręć cyframi
    const spinInterval = setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * 10))
    }, 50)

    // Zatrzymaj po czasie
    const stopTimeout = setTimeout(() => {
      clearInterval(spinInterval)
      setIsBlurred(false)
      setDisplayValue(value)
    }, 800 + delay)

    return () => {
      clearTimeout(blurTimeout)
      clearInterval(spinInterval)
      clearTimeout(stopTimeout)
    }
  }, [isSpinning, delay, value])

  return (
    <span
      className={cn(
        'inline-block tabular-nums transition-[filter] duration-100',
        isBlurred && 'blur-[1px]'
      )}
    >
      {displayValue}
    </span>
  )
}

// Komponent animowanej wartości procentowej
function AnimatedPercentage({
  value,
  isSpinning,
  delay = 0,
}: {
  value: number
  isSpinning: boolean
  delay?: number
}) {
  const digits = value.toString().split('').map(Number)

  return (
    <span className='inline-flex'>
      {digits.map((digit, i) => (
        <SlotDigit
          key={i}
          value={digit}
          isSpinning={isSpinning}
          delay={delay + i * 100}
        />
      ))}
      <span>%</span>
    </span>
  )
}

export function AnimatedMacroCards() {
  const [currentIndex, setCurrentIndex] = useState(3) // Start with "Standardowe keto"
  const [isSpinning, setIsSpinning] = useState(false)

  const currentSet = MACRO_SETS[currentIndex]

  // Auto-spin co 4 sekundy
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSpinning) {
        setIsSpinning(true)

        // Po animacji ustaw następny zestaw
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % MACRO_SETS.length)
          setIsSpinning(false)
        }, 1200)
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [isSpinning])

  return (
    <div className='space-y-6'>
      {/* Karty makro */}
      <div className='grid gap-6 sm:grid-cols-3'>
        {/* Tłuszcze */}
        <div className='rounded-md border-2 border-white bg-white/40 p-8 text-center shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl transition-transform duration-300 hover:scale-[1.01] sm:rounded-2xl'>
          <div className='text-primary mb-2 text-4xl font-bold'>
            <AnimatedPercentage
              value={currentSet?.fats ?? 0}
              isSpinning={isSpinning}
              delay={0}
            />
          </div>
          <div className='text-text-main mb-1 text-lg font-semibold'>
            Tłuszcze
          </div>
          <div className='text-text-secondary text-sm'>
            główne źródło energii
          </div>
        </div>

        {/* Węglowodany */}
        <div className='rounded-md border-2 border-white bg-white/40 p-8 text-center shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl transition-transform duration-300 hover:scale-[1.01] sm:rounded-2xl'>
          <div className='text-primary mb-2 text-4xl font-bold'>
            <AnimatedPercentage
              value={currentSet?.carbs ?? 0}
              isSpinning={isSpinning}
              delay={200}
            />
          </div>
          <div className='text-text-main mb-1 text-lg font-semibold'>
            Węglowodany
          </div>
          <div className='text-text-secondary text-sm'>ograniczone minimum</div>
        </div>

        {/* Białko */}
        <div className='rounded-md border-2 border-white bg-white/40 p-8 text-center shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl transition-transform duration-300 hover:scale-[1.01] sm:rounded-2xl'>
          <div className='text-primary mb-2 text-4xl font-bold'>
            <AnimatedPercentage
              value={currentSet?.protein ?? 0}
              isSpinning={isSpinning}
              delay={400}
            />
          </div>
          <div className='text-text-main mb-1 text-lg font-semibold'>
            Białko
          </div>
          <div className='text-text-secondary text-sm'>budulec mięśni</div>
        </div>
      </div>

      {/* Etykieta aktualnego zestawu */}
      <div className='text-center'>
        <h3
          className={cn(
            'text-text-main text-xl font-bold transition-all duration-300 sm:text-2xl',
            isSpinning && 'scale-95 opacity-0'
          )}
        >
          {currentSet?.label}
        </h3>
      </div>
    </div>
  )
}
