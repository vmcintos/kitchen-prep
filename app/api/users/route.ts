import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { userProfileSchema, cookProfileSchema } from '@/lib/types'
import { z } from 'zod'

const createUserSchema = userProfileSchema.extend({
  cookProfile: cookProfileSchema.optional(),
})

// GET /api/users - List all users in household
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      where: { householdId: session.householdId },
      include: { cookProfile: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Failed to get users' }, { status: 500 })
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { cookProfile: cookProfileData, ...profileData } = createUserSchema.parse(body)

    const user = await prisma.user.create({
      data: {
        householdId: session.householdId,
        name: profileData.name,
        email: profileData.email || null,
        allergies: profileData.allergies,
        dislikes: profileData.dislikes,
        preferences: profileData.preferences,
        isCook: profileData.isCook,
        ...(profileData.isCook && cookProfileData
          ? {
              cookProfile: {
                create: {
                  skillLevel: cookProfileData.skillLevel,
                  mealsPerWeek: cookProfileData.mealsPerWeek,
                  availableDays: cookProfileData.availableDays,
                  preferredEquipment: cookProfileData.preferredEquipment,
                },
              },
            }
          : {}),
      },
      include: { cookProfile: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
