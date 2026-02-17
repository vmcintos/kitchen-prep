import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { recipeSchema } from '@/lib/types'

// GET /api/recipes/[id] - Get single recipe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const recipe = await prisma.recipe.findFirst({
      where: { id, householdId: session.householdId },
      include: {
        ingredients: true,
        equipment: true,
        ratings: {
          include: { user: true },
        },
      },
    })

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    return NextResponse.json({ recipe })
  } catch (error) {
    console.error('Get recipe error:', error)
    return NextResponse.json({ error: 'Failed to get recipe' }, { status: 500 })
  }
}

// PUT /api/recipes/[id] - Update recipe
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Verify ownership
    const existing = await prisma.recipe.findFirst({
      where: { id, householdId: session.householdId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    // If full update with ingredients/equipment
    if (body.ingredients) {
      const data = recipeSchema.parse(body)

      // Delete existing ingredients and equipment
      await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } })
      await prisma.recipeEquipment.deleteMany({ where: { recipeId: id } })

      const recipe = await prisma.recipe.update({
        where: { id },
        data: {
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

      return NextResponse.json({ recipe })
    }

    // Partial update
    const recipe = await prisma.recipe.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ recipe })
  } catch (error) {
    console.error('Update recipe error:', error)
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as any).issues },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 })
  }
}

// DELETE /api/recipes/[id] - Delete recipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const existing = await prisma.recipe.findFirst({
      where: { id, householdId: session.householdId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    await prisma.recipe.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete recipe error:', error)
    return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 })
  }
}
