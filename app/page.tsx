import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('kitchen-prep-session')?.value

  if (!sessionToken) {
    redirect('/setup')
  }

  // Decode session
  let session
  try {
    session = JSON.parse(Buffer.from(sessionToken, 'base64').toString('utf-8'))
  } catch {
    redirect('/setup')
  }

  const household = await prisma.household.findUnique({
    where: { id: session.householdId },
    include: {
      users: {
        include: { cookProfile: true },
      },
    },
  })

  if (!household) {
    redirect('/setup')
  }

  // Get quick stats
  const [inventoryCount, lowStockCount, recipeCount, users] = await Promise.all([
    prisma.inventoryItem.count({
      where: { householdId: household.id, inStock: true },
    }),
    prisma.inventoryItem.count({
      where: { householdId: household.id, inStock: false },
    }),
    prisma.recipe.count({ where: { householdId: household.id } }),
    Promise.resolve(household.users),
  ])

  // Get current week's meal plan
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay() + 1) // Monday
  weekStart.setHours(0, 0, 0, 0)

  const mealPlan = await prisma.mealPlan.findUnique({
    where: {
      householdId_weekStartDate: {
        householdId: household.id,
        weekStartDate: weekStart,
      },
    },
    include: {
      meals: {
        include: {
          recipe: true,
          cook: true,
        },
        orderBy: [{ date: 'asc' }, { mealType: 'asc' }],
      },
    },
  })

  const formatTime = (minutes: number | null | undefined) => {
    if (!minutes) return ''
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{household.name}</h1>
        <p className="mt-1 text-gray-500">Your household food & inventory dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-pantry-100 rounded-md p-3">
              <svg className="h-6 w-6 text-pantry-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Stock</p>
              <p className="text-2xl font-semibold text-gray-900">{inventoryCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Low/Out</p>
              <p className="text-2xl font-semibold text-gray-900">{lowStockCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-kitchen-100 rounded-md p-3">
              <svg className="h-6 w-6 text-kitchen-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Recipes</p>
              <p className="text-2xl font-semibold text-gray-900">{recipeCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Household</p>
              <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* This Week's Meal Plan */}
      <div className="bg-white rounded-lg border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">This Week's Meals</h2>
          <Link
            href="/meal-plan"
            className="text-sm text-kitchen-600 hover:text-kitchen-700 font-medium"
          >
            View Full Plan
          </Link>
        </div>
        <div className="p-6">
          {mealPlan && mealPlan.meals.length > 0 ? (
            <div className="space-y-4">
              {mealPlan.meals.slice(0, 5).map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(meal.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="ml-2 text-sm text-gray-500 capitalize">{meal.mealType}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">
                      {meal.recipe?.name || meal.notes || 'Unassigned'}
                    </span>
                    {meal.cook && (
                      <span className="badge badge-blue">{meal.cook.name}</span>
                    )}
                    {meal.isPrepared && (
                      <span className="badge badge-green">Done</span>
                    )}
                  </div>
                </div>
              ))}
              {mealPlan.meals.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  +{mealPlan.meals.length - 5} more meals this week
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No meals planned for this week yet.</p>
              <Link
                href="/meal-plan"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-kitchen-600 hover:bg-kitchen-700"
              >
                Plan Your Meals
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Household Members */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Household Members</h2>
          <Link
            href="/profiles"
            className="text-sm text-kitchen-600 hover:text-kitchen-700 font-medium"
          >
            Manage Profiles
          </Link>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  {user.isCook && <span className="badge badge-pantry">Cook</span>}
                </div>
                {user.cookProfile && (
                  <div className="text-sm text-gray-500">
                    <p>Skill Level: {user.cookProfile.skillLevel}</p>
                    {user.cookProfile.availableDays.length > 0 && (
                      <p>Available: {user.cookProfile.availableDays.join(', ')}</p>
                    )}
                  </div>
                )}
                {user.allergies.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">Allergies: </span>
                    {user.allergies.map((a, i) => (
                      <span key={i} className="badge badge-red mr-1">{a}</span>
                    ))}
                  </div>
                )}
                {user.dislikes.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">Dislikes: </span>
                    {user.dislikes.map((d, i) => (
                      <span key={i} className="badge badge-gray mr-1">{d}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
