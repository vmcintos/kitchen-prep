import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create household
  const passwordHash = await bcrypt.hash('kitchen2024', 10)
  const household = await prisma.household.create({
    data: {
      name: 'Our Kitchen',
      passwordHash,
    },
  })
  console.log(`Created household: ${household.name}`)

  // Create household members
  const katrina = await prisma.user.create({
    data: {
      householdId: household.id,
      name: 'Katrina',
      isCook: true,
      preferences: ['variety', 'seasonal'],
      cookProfile: {
        create: {
          skillLevel: 3,
          mealsPerWeek: 4,
          availableDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
          preferredEquipment: ['instant pot', 'oven', 'stovetop'],
        },
      },
    },
  })

  const kathy = await prisma.user.create({
    data: {
      householdId: household.id,
      name: 'Kathy',
      isCook: true,
      preferences: ['simple', 'comfort food'],
      cookProfile: {
        create: {
          skillLevel: 2,
          mealsPerWeek: 3,
          availableDays: ['Friday', 'Saturday', 'Sunday'],
          preferredEquipment: ['microwave', 'stovetop'],
        },
      },
    },
  })

  const robin = await prisma.user.create({
    data: {
      householdId: household.id,
      name: 'Robin',
      dislikes: ['Brussels sprouts'],
      preferences: [],
    },
  })

  console.log(`Created users: ${katrina.name}, ${kathy.name}, ${robin.name}`)

  // Create sample inventory items
  const pantryItems = [
    { name: 'Peanut Butter', category: 'pantry', location: 'pantry', preferredBrand: 'Jif', inStock: true },
    { name: 'Earth Balance Margarine', category: 'dairy', location: 'fridge', preferredBrand: 'Earth Balance', inStock: true },
    { name: 'Olive Oil', category: 'pantry', location: 'pantry', inStock: true },
    { name: 'Pasta', category: 'dry goods', location: 'pantry', inStock: true },
    { name: 'Canned Tomatoes', category: 'canned', location: 'pantry', inStock: true },
    { name: 'Chicken Breast', category: 'meat', location: 'freezer', inStock: true },
    { name: 'Frozen Peas', category: 'frozen', location: 'freezer', inStock: true },
    { name: 'Cheddar Cheese', category: 'dairy', location: 'fridge', inStock: false },
    { name: 'Crackers', category: 'snacks', location: 'pantry', notes: '2-3 varieties', inStock: true },
  ]

  await prisma.inventoryItem.createMany({
    data: pantryItems.map((item) => ({
      ...item,
      householdId: household.id,
    })),
  })
  console.log(`Created ${pantryItems.length} inventory items`)

  // Create sample recipes
  const pasta = await prisma.recipe.create({
    data: {
      householdId: household.id,
      name: 'Pasta with Marinara',
      instructions: '1. Boil salted water and cook pasta until al dente.\n2. Heat olive oil in a pan over medium heat.\n3. Add canned tomatoes, salt, pepper, and Italian seasoning.\n4. Simmer for 15 minutes.\n5. Serve sauce over pasta with parmesan.',
      complexityLevel: 1,
      prepTime: 5,
      cookTime: 20,
      seasons: ['all'],
      tags: ['quick', 'vegetarian', 'kid-friendly'],
      proteinType: 'vegetarian',
      toddlerFriendly: true,
      toddlerPortionNotes: 'Cut pasta into smaller pieces, go light on seasoning.',
      source: 'original',
      ingredients: {
        create: [
          { name: 'Pasta', quantity: 1, unit: 'lb', category: 'dry goods' },
          { name: 'Canned Tomatoes', quantity: 28, unit: 'oz', category: 'canned' },
          { name: 'Olive Oil', quantity: 2, unit: 'tbsp', category: 'pantry' },
          { name: 'Italian Seasoning', quantity: 1, unit: 'tsp', category: 'spices' },
          { name: 'Parmesan', isOptional: true, category: 'dairy' },
        ],
      },
      equipment: {
        create: [{ name: 'large pot' }, { name: 'saucepan' }],
      },
    },
  })

  const chickenBowl = await prisma.recipe.create({
    data: {
      householdId: household.id,
      name: 'Sheet Pan Chicken & Veggies',
      instructions: '1. Preheat oven to 425°F.\n2. Cut chicken and vegetables into even pieces.\n3. Toss with olive oil, salt, pepper, and garlic powder.\n4. Spread on a sheet pan.\n5. Roast for 25-30 minutes, flipping halfway.',
      complexityLevel: 2,
      prepTime: 15,
      cookTime: 30,
      seasons: ['all'],
      tags: ['healthy', 'one-pan', 'high-protein'],
      proteinType: 'chicken',
      toddlerFriendly: true,
      toddlerPortionNotes: 'Cut into small pieces before serving. Remove any crispy edges.',
      source: 'original',
      ingredients: {
        create: [
          { name: 'Chicken Breast', quantity: 1.5, unit: 'lb', category: 'meat' },
          { name: 'Broccoli', quantity: 2, unit: 'cups', category: 'produce' },
          { name: 'Bell Pepper', quantity: 2, category: 'produce' },
          { name: 'Olive Oil', quantity: 3, unit: 'tbsp', category: 'pantry' },
          { name: 'Garlic Powder', quantity: 1, unit: 'tsp', category: 'spices' },
        ],
      },
      equipment: {
        create: [{ name: 'sheet pan' }, { name: 'oven' }],
      },
    },
  })

  console.log(`Created recipes: ${pasta.name}, ${chickenBowl.name}`)
  console.log('\n✅ Seed complete!')
  console.log(`\n   Household: "${household.name}"`)
  console.log(`   Password:  kitchen2024`)
  console.log(`\n   Members:   Katrina (cook, skill 3), Kathy (cook, skill 2), Robin (eater)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
