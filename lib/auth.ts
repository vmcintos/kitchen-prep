import { cookies } from 'next/headers'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

const SESSION_COOKIE = 'kitchen-prep-session'
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-key'

export interface SessionData {
  householdId: string
  userId: string | null
}

// Simple session encoding (in production, use JWT or proper session management)
function encodeSession(data: SessionData): string {
  const payload = JSON.stringify(data)
  return Buffer.from(payload).toString('base64')
}

function decodeSession(token: string): SessionData | null {
  try {
    const payload = Buffer.from(token, 'base64').toString('utf-8')
    return JSON.parse(payload)
  } catch {
    return null
  }
}

export async function createSession(householdId: string, userId: string | null = null): Promise<string> {
  const token = encodeSession({ householdId, userId })
  return token
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) return null

  return decodeSession(token)
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function getHousehold(householdId: string) {
  return prisma.household.findUnique({
    where: { id: householdId },
    include: {
      users: {
        include: {
          cookProfile: true,
        },
      },
    },
  })
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}
