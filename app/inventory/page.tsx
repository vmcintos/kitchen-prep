import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import InventoryList from '@/components/InventoryList'

export default async function InventoryPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('kitchen-prep-session')?.value

  if (!sessionToken) {
    redirect('/setup')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
        <p className="mt-1 text-gray-500">Track what's in your pantry, fridge, and freezer</p>
      </div>

      <InventoryList />
    </div>
  )
}
