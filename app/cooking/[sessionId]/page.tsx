import { Suspense } from 'react'
import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { CookingSessionClient } from '@/components/meal-prep/CookingSessionClient'
import { MealPrepSkeleton } from '@/components/meal-prep/MealPrepSkeleton'

interface PageProps {
  params: Promise<{ sessionId: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { sessionId } = await params
  return {
    title: `Sesja gotowania | LowCarb Planer`,
    description: `Sesja gotowania ${sessionId}`,
  }
}

export default async function CookingSessionPage({ params }: PageProps) {
  const { sessionId } = await params
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?redirect=/cooking/${sessionId}`)
  }

  // Verify session exists and belongs to user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: session, error } = await (supabase as any)
    .from('cooking_sessions')
    .select('id, user_id')
    .eq('id', sessionId)
    .single()

  if (error || !session) {
    notFound()
  }

  if (session.user_id !== user.id) {
    notFound()
  }

  return (
    <div className='container mx-auto max-w-4xl px-4 py-6'>
      <Suspense fallback={<MealPrepSkeleton />}>
        <CookingSessionClient sessionId={sessionId} />
      </Suspense>
    </div>
  )
}
