import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createSession, setSessionCookie } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  name: z.string().min(1),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, password } = loginSchema.parse(body)

    // Find household by name (case-insensitive)
    const household = await prisma.household.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    })

    if (!household) {
      return NextResponse.json(
        { error: 'Household not found' },
        { status: 401 }
      )
    }

    // Verify password
    const valid = await verifyPassword(password, household.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Create session
    const token = await createSession(household.id)

    // Create response with cookie
    const response = NextResponse.json({ success: true, householdId: household.id })
    response.cookies.set('kitchen-prep-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
