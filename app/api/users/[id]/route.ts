import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { userProfileSchema, cookProfileSchema } from '@/lib/types'
import { z } from 'zod'

const updateUserSchema = userProfileSchema.partial().extend({
  cookProfile: cookProfileSchema.optional(),
})

// GET /api/users/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const user = await prisma.user.findFirst({
      where: { id, householdId: session.householdId },
      include: { cookProfile: true },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
  }
}

// PUT /api/users/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { cookProfile: cookProfileData, ...profileData } = updateUserSchema.parse(body)

    // Verify ownership
    const existing = await prisma.user.findFirst({
      where: { id, householdId: session.householdId },
      include: { cookProfile: true },
    })
    if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Build update data
    const updateData: any = { ...profileData }
    if (profileData.email === '') updateData.email = null

    // Handle cook profile
    if (profileData.isCook === true && cookProfileData) {
      if (existing.cookProfile) {
        updateData.cookProfile = {
          update: {
            skillLevel: cookProfileData.skillLevel,
            mealsPerWeek: cookProfileData.mealsPerWeek,
            availableDays: cookProfileData.availableDays,
            preferredEquipment: cookProfileData.preferredEquipment,
          },
        }
      } else {
        updateData.cookProfile = {
          create: {
            skillLevel: cookProfileData.skillLevel,
            mealsPerWeek: cookProfileData.mealsPerWeek,
            availableDays: cookProfileData.availableDays,
            preferredEquipment: cookProfileData.preferredEquipment,
          },
        }
      }
    } else if (profileData.isCook === false && existing.cookProfile) {
      updateData.cookProfile = { delete: true }
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { cookProfile: true },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Update user error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

// DELETE /api/users/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const existing = await prisma.user.findFirst({
      where: { id, householdId: session.householdId },
    })
    if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
