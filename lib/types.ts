import { z } from 'zod'

// Inventory item validation
export const inventoryItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  upc: z.string().optional(),
  preferredBrand: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(1, 'Location is required'),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  inStock: z.boolean().default(true),
  notes: z.string().optional(),
})

export type InventoryItemInput = z.infer<typeof inventoryItemSchema>

// Recipe validation
export const recipeIngredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  isOptional: z.boolean().default(false),
  category: z.string().optional(),
})

export const recipeEquipmentSchema = z.object({
  name: z.string().min(1, 'Equipment name is required'),
})

export const recipeSchema = z.object({
  name: z.string().min(1, 'Recipe name is required'),
  instructions: z.string().min(1, 'Instructions are required'),
  complexityLevel: z.number().min(1).max(3).default(2),
  prepTime: z.number().optional(),
  cookTime: z.number().optional(),
  seasons: z.array(z.string()).default(['all']),
  tags: z.array(z.string()).default([]),
  proteinType: z.string().optional(),
  toddlerFriendly: z.boolean().default(false),
  toddlerPortionNotes: z.string().optional(),
  source: z.string().optional(),
  ingredients: z.array(recipeIngredientSchema).min(1, 'At least one ingredient is required'),
  equipment: z.array(recipeEquipmentSchema).default([]),
})

export type RecipeInput = z.infer<typeof recipeSchema>

// User profile validation
export const userProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  allergies: z.array(z.string()).default([]),
  dislikes: z.array(z.string()).default([]),
  preferences: z.array(z.string()).default([]),
  isCook: z.boolean().default(false),
})

export type UserProfileInput = z.infer<typeof userProfileSchema>

// Cook profile validation
export const cookProfileSchema = z.object({
  skillLevel: z.number().min(1).max(3),
  mealsPerWeek: z.number().min(0).max(21).default(0),
  availableDays: z.array(z.string()).default([]),
  preferredEquipment: z.array(z.string()).default([]),
})

export type CookProfileInput = z.infer<typeof cookProfileSchema>

// Household validation
export const householdSchema = z.object({
  name: z.string().min(1, 'Household name is required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
})

export type HouseholdInput = z.infer<typeof householdSchema>

// Category constants
export const INVENTORY_CATEGORIES = [
  'produce',
  'dairy',
  'pantry',
  'frozen',
  'meat',
  'seafood',
  'bakery',
  'beverages',
  'snacks',
  'condiments',
  'spices',
  'dry goods',
  'canned',
  'other',
] as const

export const INVENTORY_LOCATIONS = [
  'pantry',
  'fridge',
  'freezer',
  'dry storage',
  'counter',
  'other',
] as const

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

export const SEASONS = ['spring', 'summer', 'fall', 'winter', 'all'] as const

export const SKILL_LEVELS = {
  1: { name: 'Heat & Eat', description: 'No prep, convenience foods only' },
  2: { name: 'Simple Prep', description: 'Some cutting, box meals, simple recipes' },
  3: { name: 'From Scratch', description: 'Full cooking, 45+ minutes' },
} as const
