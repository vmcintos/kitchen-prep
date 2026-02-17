import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { inventoryItemSchema, INVENTORY_CATEGORIES, INVENTORY_LOCATIONS } from '@/lib/types'

// GET /api/inventory - List all inventory items
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const inStock = searchParams.get('inStock')
    const search = searchParams.get('search')

    const where: any = { householdId: session.householdId }

    if (category) where.category = category
    if (location) where.location = location
    if (inStock !== null) where.inStock = inStock === 'true'
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Get inventory error:', error)
    return NextResponse.json({ error: 'Failed to get inventory' }, { status: 500 })
  }
}

// POST /api/inventory - Create new inventory item
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = inventoryItemSchema.parse(body)

    const item = await prisma.inventoryItem.create({
      data: {
        ...data,
        householdId: session.householdId,
      },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Create inventory item error:', error)
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as any).issues },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}

// GET categories and locations for reference
export async function OPTIONS() {
  return NextResponse.json({
    categories: INVENTORY_CATEGORIES,
    locations: INVENTORY_LOCATIONS,
  })
}
