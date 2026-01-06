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

const nutritionFacts = [
  { label: 'Węglowodany', value: '15%', description: 'maksymalnie dziennie' },
  { label: 'Białko', value: '35%', description: 'optymalna ilość' },
  { label: 'Tłuszcze', value: '50%', description: 'zdrowe źródła energii' },
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

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lowcarbplaner.pl'

  return (
    <main className='min-h-screen'>
      {/* Hero Section */}
      <section className='from-primary/10 to-secondary/10 relative overflow-hidden bg-gradient-to-br via-white px-4 py-16 sm:py-24'>
        <div className='mx-auto max-w-6xl text-center'>
          <h1 className='mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl'>
            Planuj dietę{' '}
            <span className='text-primary'>niskowęglowodanową</span>
            <br />
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
      <section className='bg-white px-4 py-16 sm:py-24'>
        <div className='mx-auto max-w-6xl'>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-bold text-gray-900 sm:text-4xl'>
              Wszystko do planowania diety keto
            </h2>
            <p className='mx-auto max-w-2xl text-gray-600'>
              Kompleksowe narzędzie do planowania posiłków niskowęglowodanowych.
              Oszczędź czas i jedz zdrowo każdego dnia.
            </p>
          </div>
          <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {features.map((feature) => (
              <article
                key={feature.title}
                className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md'
              >
                <div className='bg-primary/10 mb-4 inline-flex rounded-lg p-3'>
                  <feature.icon className='text-primary h-6 w-6' />
                </div>
                <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                  {feature.title}
                </h3>
                <p className='text-gray-600'>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Nutrition Section */}
      <section className='bg-gray-50 px-4 py-16 sm:py-24'>
        <div className='mx-auto max-w-6xl'>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-bold text-gray-900 sm:text-4xl'>
              Optymalne proporcje makroskładników
            </h2>
            <p className='mx-auto max-w-2xl text-gray-600'>
              Dieta niskowęglowodanowa opiera się na ograniczeniu węglowodanów i
              zwiększeniu spożycia zdrowych tłuszczów.
            </p>
          </div>
          <div className='grid gap-6 sm:grid-cols-3'>
            {nutritionFacts.map((fact) => (
              <div
                key={fact.label}
                className='rounded-xl bg-white p-8 text-center shadow-sm'
              >
                <div className='text-primary mb-2 text-4xl font-bold'>
                  {fact.value}
                </div>
                <div className='mb-1 text-lg font-semibold text-gray-900'>
                  {fact.label}
                </div>
                <div className='text-sm text-gray-500'>{fact.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className='bg-white px-4 py-16 sm:py-24'>
        <div className='mx-auto max-w-6xl'>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-bold text-gray-900 sm:text-4xl'>
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
                <h3 className='mb-2 font-semibold text-gray-900'>
                  {item.title}
                </h3>
                <p className='text-sm text-gray-600'>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='bg-primary px-4 py-16 sm:py-24'>
        <div className='mx-auto max-w-4xl text-center'>
          <h2 className='mb-4 text-3xl font-bold text-white sm:text-4xl'>
            Zacznij planować swoją dietę już dziś
          </h2>
          <p className='mb-8 text-lg text-white/90'>
            Dołącz do tysięcy osób, które schudły dzięki diecie
            niskowęglowodanowej. Rejestracja jest całkowicie bezpłatna.
          </p>
          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Button
              asChild
              size='lg'
              variant='secondary'
              className='min-w-[200px]'
            >
              <Link href='/auth'>Załóż darmowe konto</Link>
            </Button>
            <Button
              asChild
              size='lg'
              variant='outline'
              className='hover:text-primary min-w-[200px] border-white bg-transparent text-white hover:bg-white'
            >
              <Link href='/recipes'>Zobacz przepisy</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className='bg-gray-50 px-4 py-16'>
        <div className='mx-auto max-w-4xl'>
          <article className='prose prose-gray max-w-none'>
            <h2>Czym jest dieta niskowęglowodanowa?</h2>
            <p>
              Dieta niskowęglowodanowa (low-carb) to sposób odżywiania, który
              ogranicza spożycie węglowodanów na rzecz białka i zdrowych
              tłuszczów. Dieta keto (ketogeniczna) jest najbardziej restrykcyjną
              formą diety low-carb, gdzie węglowodany stanowią zaledwie 5-10%
              dziennego spożycia kalorii.
            </p>

            <h3>Korzyści diety low-carb i keto</h3>
            <ul>
              <li>
                Szybsza utrata wagi dzięki spalaniu tłuszczu jako źródła energii
              </li>
              <li>Stabilny poziom cukru we krwi</li>
              <li>Mniejsze uczucie głodu między posiłkami</li>
              <li>Lepsza koncentracja i energia</li>
              <li>Zmniejszenie stanów zapalnych w organizmie</li>
            </ul>

            <h3>Jak LowCarbPlaner pomoże Ci w diecie?</h3>
            <p>
              Nasza aplikacja automatycznie oblicza Twoje zapotrzebowanie
              kaloryczne (BMR i TDEE) na podstawie płci, wieku, wzrostu, wagi i
              poziomu aktywności fizycznej. Następnie generuje spersonalizowany
              plan posiłków z przepisami, które idealnie wpasowują się w Twoje
              cele makroskładnikowe.
            </p>

            <h3>Przepisy keto i low-carb</h3>
            <p>
              W naszej bazie znajdziesz setki sprawdzonych przepisów
              niskowęglowodanowych na śniadanie, obiad, kolację i przekąski.
              Każdy przepis zawiera dokładne informacje o wartościach
              odżywczych: kaloriach, białku, tłuszczach, węglowodanach i
              błonniku.
            </p>
          </article>
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
