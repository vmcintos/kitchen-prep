import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { recipeSchema } from '@/lib/types'

// GET /api/recipes - List all recipes
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const complexity = searchParams.get('complexity')
    const proteinType = searchParams.get('proteinType')
    const season = searchParams.get('season')
    const toddlerFriendly = searchParams.get('toddlerFriendly')
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')

    const where: any = { householdId: session.householdId }

    if (complexity) where.complexityLevel = parseInt(complexity)
    if (proteinType) where.proteinType = proteinType
    if (season) where.seasons = { has: season }
    if (toddlerFriendly === 'true') where.toddlerFriendly = true
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ]
    }
    if (tag) where.tags = { has: tag }

    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        ingredients: true,
        equipment: true,
        ratings: {
          include: { user: true },
        },
      },
      orderBy: [{ name: 'asc' }],
    })

    return NextResponse.json({ recipes })
  } catch (error) {
    console.error('Get recipes error:', error)
    return NextResponse.json({ error: 'Failed to get recipes' }, { status: 500 })
  }
}

// POST /api/recipes - Create new recipe
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = recipeSchema.parse(body)

    const recipe = await prisma.recipe.create({
      data: {
        householdId: session.householdId,
        name: data.name,
        instructions: data.instructions,
        complexityLevel: data.complexityLevel,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        seasons: data.seasons,
        tags: data.tags,
        proteinType: data.proteinType,
        toddlerFriendly: data.toddlerFriendly,
        toddlerPortionNotes: data.toddlerPortionNotes,
        source: data.source,
        ingredients: {
          create: data.ingredients.map((ing) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            isOptional: ing.isOptional,
            category: ing.category,
          })),
        },
        equipment: {
          create: data.equipment.map((eq) => ({
            name: eq.name,
          })),
        },
      },
      include: {
        ingredients: true,
        equipment: true,
      },
    })

    return NextResponse.json({ recipe }, { status: 201 })
  } catch (error) {
    console.error('Create recipe error:', error)
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as any).issues },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 })
  }
}
