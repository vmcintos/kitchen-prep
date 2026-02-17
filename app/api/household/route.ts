import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createSession } from '@/lib/auth'
import { householdSchema } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, password } = householdSchema.parse(body)

    // Check if household already exists
    const existing = await prisma.household.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A household with this name already exists' },
        { status: 400 }
      )
    }

    // Create household
    const passwordHash = await hashPassword(password)
    const household = await prisma.household.create({
      data: {
        name,
        passwordHash,
      },
    })

    // Create session
    const token = await createSession(household.id)

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      household: { id: household.id, name: household.name },
    })
    response.cookies.set('kitchen-prep-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Create household error:', error)
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as any).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create household' },
      { status: 500 }
    )
  }
}
