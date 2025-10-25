/**
 * PageHeader component for Profile page
 *
 * Displays the main title and description
 */

export const PageHeader = () => {
  return (
    <div className='mb-8'>
      <h1 className='mb-2 text-3xl font-bold'>Profil i Ustawienia</h1>
      <p className='text-muted-foreground'>
        Zarządzaj swoimi danymi i celami żywieniowymi
      </p>
    </div>
  )
}
