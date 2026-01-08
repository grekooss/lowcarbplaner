/**
 * Landing Page - SEO-friendly strona główna
 *
 * Logika:
 * - Niezalogowani → Landing Page z treścią SEO
 * - Zalogowani → Redirect do /dashboard
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Calculator,
  Calendar,
  ChefHat,
  ShoppingCart,
  TrendingDown,
  Utensils,
} from 'lucide-react'
import { AnimatedMacroCards } from '@/components/landing/AnimatedMacroCards'

export const metadata: Metadata = {
  title: 'LowCarbPlaner - Planowanie diety niskowęglowodanowej i keto',
  description:
    'Darmowy planer diety niskowęglowodanowej i keto. Automatyczne planowanie posiłków, setki przepisów low-carb, kalkulator kalorii i makroskładników. Zacznij swoją dietę już dziś!',
  openGraph: {
    title: 'LowCarbPlaner - Planowanie diety niskowęglowodanowej i keto',
    description:
      'Darmowy planer diety niskowęglowodanowej. Automatyczne planowanie posiłków, przepisy keto, kalkulator BMR/TDEE.',
    type: 'website',
  },
}

const features = [
  {
    icon: ChefHat,
    title: 'Setki przepisów keto',
    description:
      'Odkryj bogatą bazę przepisów niskowęglowodanowych z dokładnymi wartościami odżywczymi.',
  },
  {
    icon: Calendar,
    title: 'Automatyczne planowanie',
    description:
      'Generuj tygodniowy jadłospis dopasowany do Twoich celów kalorycznych i makroskładników.',
  },
  {
    icon: Calculator,
    title: 'Kalkulator BMR/TDEE',
    description:
      'Oblicz swoje zapotrzebowanie kaloryczne na podstawie wzrostu, wagi i poziomu aktywności.',
  },
  {
    icon: ShoppingCart,
    title: 'Lista zakupów',
    description:
      'Automatycznie generowana lista zakupów na podstawie zaplanowanych posiłków.',
  },
  {
    icon: TrendingDown,
    title: 'Śledzenie postępów',
    description: 'Monitoruj spożycie kalorii i makroskładników każdego dnia.',
  },
  {
    icon: Utensils,
    title: 'Personalizacja posiłków',
    description:
      'Dostosuj porcje i składniki do swoich preferencji i ograniczeń dietetycznych.',
  },
]

export default async function LandingPage() {
  // Sprawdź czy użytkownik jest zalogowany
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Zalogowani użytkownicy → dashboard
  if (user) {
    redirect('/dashboard')
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lowcarbplaner.com'

  return (
    <main className='min-h-screen'>
      {/* Hero Section */}
      <section className='relative overflow-hidden px-4 py-6 sm:py-18'>
        <div className='mx-auto max-w-6xl text-center'>
          <h1 className='mb-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl'>
            Planuj dietę{' '}
            <span className='text-primary break-words'>niskowęglowodanową</span>
            <br className='hidden sm:block' />
            <span className='sm:hidden'> </span>
            bez wysiłku
          </h1>
          <p className='mx-auto mb-8 max-w-2xl text-lg text-gray-600 sm:text-xl'>
            Automatyczne planowanie posiłków, setki przepisów keto i low-carb,
            kalkulator kalorii. Wszystko czego potrzebujesz, aby schudnąć
            zdrowo.
          </p>
          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Button asChild size='lg' className='min-w-[200px]'>
              <Link href='/recipes'>Przeglądaj przepisy</Link>
            </Button>
            <Button
              asChild
              variant='outline'
              size='lg'
              className='min-w-[200px]'
            >
              <Link href='/auth'>Zacznij za darmo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='px-4 py-6 sm:py-18'>
        <div className='mx-auto max-w-6xl'>
          <div className='mb-6 text-center sm:mb-12'>
            <h2 className='text-text-main mb-2 text-2xl font-bold sm:mb-4 sm:text-4xl'>
              Wszystko do planowania diety keto
            </h2>
            <p className='text-text-secondary mx-auto max-w-2xl text-sm sm:text-base'>
              Kompleksowe narzędzie do planowania posiłków niskowęglowodanowych.
              Oszczędź czas i jedz zdrowo każdego dnia.
            </p>
          </div>
          <div className='grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3'>
            {features.map((feature) => (
              <article
                key={feature.title}
                className='rounded-md border-2 border-white bg-white/40 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl transition-transform duration-300 hover:scale-[1.01] sm:rounded-2xl'
              >
                <div className='bg-primary mb-4 inline-flex rounded-md p-2.5'>
                  <feature.icon className='h-5 w-5 text-white' />
                </div>
                <h3 className='text-text-main mb-2 text-lg font-semibold'>
                  {feature.title}
                </h3>
                <p className='text-text-secondary'>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Nutrition Section */}
      <section className='px-4 py-6 sm:py-18'>
        <div className='mx-auto max-w-6xl'>
          <div className='mb-6 text-center sm:mb-12'>
            <h2 className='text-text-main mb-2 text-2xl font-bold sm:mb-4 sm:text-4xl'>
              Wybierz proporcje makroskładników
            </h2>
            <p className='text-text-secondary mx-auto max-w-2xl text-sm sm:text-base'>
              Od restrykcyjnego keto po liberalne low-carb. Dostosuj dietę do
              swoich celów i stylu życia.
            </p>
          </div>
          <AnimatedMacroCards />
        </div>
      </section>

      {/* How it works Section */}
      <section className='px-4 py-6 sm:py-18'>
        <div className='mx-auto max-w-6xl'>
          <div className='mb-6 text-center sm:mb-12'>
            <h2 className='text-text-main mb-2 text-2xl font-bold sm:mb-4 sm:text-4xl'>
              Jak to działa?
            </h2>
          </div>
          <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
            {[
              {
                step: '1',
                title: 'Uzupełnij profil',
                description: 'Podaj swoje dane i cel dietetyczny',
              },
              {
                step: '2',
                title: 'Oblicz kalorie',
                description: 'System obliczy Twoje zapotrzebowanie',
              },
              {
                step: '3',
                title: 'Wygeneruj plan',
                description: 'Otrzymaj tygodniowy jadłospis',
              },
              {
                step: '4',
                title: 'Gotuj i ciesz się',
                description: 'Korzystaj z przepisów i listy zakupów',
              },
            ].map((item) => (
              <div key={item.step} className='text-center'>
                <div className='bg-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold text-white'>
                  {item.step}
                </div>
                <h3 className='text-text-main mb-2 font-semibold'>
                  {item.title}
                </h3>
                <p className='text-text-secondary text-sm'>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Glassmorphism Red */}
      <section className='px-4 py-6 sm:py-18'>
        <div className='mx-auto max-w-4xl'>
          <div className='rounded-2xl bg-gradient-to-br from-red-500/30 via-red-600/40 to-red-700/60 p-8 shadow-2xl shadow-red-500/20 backdrop-blur-xl sm:p-12'>
            <div className='text-center'>
              <h2 className='mb-4 text-3xl font-bold text-white drop-shadow-sm sm:text-4xl'>
                Zacznij planować swoją dietę już dziś
              </h2>
              <p className='mb-8 text-lg text-white drop-shadow-sm'>
                Dołącz do tysięcy osób, które schudły dzięki diecie
                niskowęglowodanowej. Rejestracja jest całkowicie bezpłatna.
              </p>
              <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
                <Button asChild size='lg' className='min-w-[200px]'>
                  <Link href='/auth'>Załóż darmowe konto</Link>
                </Button>
                <Button
                  asChild
                  variant='outline'
                  size='lg'
                  className='min-w-[200px]'
                >
                  <Link href='/recipes'>Zobacz przepisy</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className='px-4 py-6 sm:py-18'>
        <div className='mx-auto max-w-4xl'>
          <div className='rounded-2xl border-2 border-white bg-white/40 p-6 shadow-lg backdrop-blur-xl sm:p-10'>
            <h2 className='text-text-main mb-6 text-2xl font-bold sm:text-3xl'>
              Czym jest dieta niskowęglowodanowa?
            </h2>
            <p className='text-text-secondary mb-8 leading-relaxed'>
              Dieta niskowęglowodanowa (
              <strong className='text-primary'>low-carb</strong>) to sposób
              odżywiania, który ogranicza spożycie węglowodanów na rzecz białka
              i zdrowych tłuszczów. Dieta{' '}
              <strong className='text-primary'>keto</strong> (ketogeniczna) jest
              najbardziej restrykcyjną formą diety low-carb, gdzie węglowodany
              stanowią zaledwie <strong>5-10%</strong> dziennego spożycia
              kalorii.
            </p>

            <h3 className='text-text-main mb-4 text-xl font-semibold'>
              Korzyści diety <span className='text-primary'>low-carb</span> i{' '}
              <span className='text-primary'>keto</span>
            </h3>
            <ul className='text-text-secondary mb-8 space-y-3'>
              <li className='flex items-start gap-3'>
                <span className='bg-primary mt-1.5 h-2 w-2 flex-shrink-0 rounded-full' />
                <span>
                  Szybsza <strong>utrata wagi</strong> dzięki spalaniu tłuszczu
                  jako źródła energii
                </span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='bg-primary mt-1.5 h-2 w-2 flex-shrink-0 rounded-full' />
                <span>
                  Stabilny <strong>poziom cukru</strong> we krwi
                </span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='bg-primary mt-1.5 h-2 w-2 flex-shrink-0 rounded-full' />
                <span>
                  Mniejsze <strong>uczucie głodu</strong> między posiłkami
                </span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='bg-primary mt-1.5 h-2 w-2 flex-shrink-0 rounded-full' />
                <span>
                  Lepsza <strong>koncentracja i energia</strong>
                </span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='bg-primary mt-1.5 h-2 w-2 flex-shrink-0 rounded-full' />
                <span>
                  Zmniejszenie <strong>stanów zapalnych</strong> w organizmie
                </span>
              </li>
            </ul>

            <h3 className='text-text-main mb-4 text-xl font-semibold'>
              Jak <span className='text-primary'>LowCarbPlaner</span> pomoże Ci
              w diecie?
            </h3>
            <p className='text-text-secondary mb-8 leading-relaxed'>
              Nasza aplikacja automatycznie oblicza Twoje zapotrzebowanie
              kaloryczne (<strong>BMR</strong> i <strong>TDEE</strong>) na
              podstawie płci, wieku, wzrostu, wagi i poziomu aktywności
              fizycznej. Następnie generuje spersonalizowany plan posiłków z
              przepisami, które idealnie wpasowują się w Twoje cele
              makroskładnikowe.
            </p>

            <h3 className='text-text-main mb-4 text-xl font-semibold'>
              Przepisy <span className='text-primary'>keto</span> i{' '}
              <span className='text-primary'>low-carb</span>
            </h3>
            <p className='text-text-secondary leading-relaxed'>
              W naszej bazie znajdziesz setki sprawdzonych przepisów
              niskowęglowodanowych na <strong>śniadanie</strong>,{' '}
              <strong>obiad</strong>, <strong>kolację</strong> i{' '}
              <strong>przekąski</strong>. Każdy przepis zawiera dokładne
              informacje o wartościach odżywczych: kaloriach, białku,
              tłuszczach, węglowodanach i błonniku.
            </p>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'LowCarbPlaner',
            description:
              'Automatyczne planowanie posiłków i śledzenie makroskładników dla diety low-carb i keto.',
            url: siteUrl,
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'PLN',
            },
          }),
        }}
      />
    </main>
  )
}
