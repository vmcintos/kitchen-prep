import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProfileList from '@/components/ProfileList'

export default async function ProfilesPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('kitchen-prep-session')?.value

  if (!sessionToken) {
    redirect('/setup')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Household Members</h1>
        <p className="mt-1 text-gray-500">Manage dietary needs and cook profiles</p>
      </div>
      <ProfileList />
    </div>
  )
}
