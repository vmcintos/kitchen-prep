'use client'

import { useState } from 'react'
import { SEASONS, SKILL_LEVELS } from '@/lib/types'

interface Ingredient {
  id?: string
  name: string
  quantity: number | null
  unit: string | null
  isOptional: boolean
  category: string | null
}

interface Equipment {
  id?: string
  name: string
}

interface Recipe {
  id?: string
  name: string
  instructions: string
  complexityLevel: number
  prepTime: number | null
  cookTime: number | null
  seasons: string[]
  tags: string[]
  proteinType: string | null
  toddlerFriendly: boolean
  toddlerPortionNotes: string | null
  source: string | null
  ingredients: Ingredient[]
  equipment: Equipment[]
}

interface RecipeFormProps {
  initialData?: Partial<Recipe>
  onSubmit: (data: Recipe) => Promise<void>
  onCancel?: () => void
  isEditing?: boolean
}

export default function RecipeForm({ initialData, onSubmit, onCancel, isEditing = false }: RecipeFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(initialData?.name || '')
  const [instructions, setInstructions] = useState(initialData?.instructions || '')
  const [complexityLevel, setComplexityLevel] = useState(initialData?.complexityLevel || 2)
  const [prepTime, setPrepTime] = useState(initialData?.prepTime?.toString() || '')
  const [cookTime, setCookTime] = useState(initialData?.cookTime?.toString() || '')
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>(initialData?.seasons || ['all'])
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '')
  const [proteinType, setProteinType] = useState(initialData?.proteinType || '')
  const [toddlerFriendly, setToddlerFriendly] = useState(initialData?.toddlerFriendly || false)
  const [toddlerPortionNotes, setToddlerPortionNotes] = useState(initialData?.toddlerPortionNotes || '')
  const [source, setSource] = useState(initialData?.source || '')

  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialData?.ingredients?.length
      ? initialData.ingredients
      : [{ name: '', quantity: null, unit: null, isOptional: false, category: null }]
  )

  const [equipment, setEquipment] = useState<Equipment[]>(
    initialData?.equipment?.length
      ? initialData.equipment
      : [{ name: '' }]
  )

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: null, unit: null, isOptional: false, category: null }])
  }

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index))
    }
  }

  const updateIngredient = (index: number, field: keyof Ingredient, value: any) => {
    const updated = [...ingredients]
    updated[index] = { ...updated[index], [field]: value }
    setIngredients(updated)
  }

  const addEquipment = () => {
    setEquipment([...equipment, { name: '' }])
  }

  const removeEquipment = (index: number) => {
    if (equipment.length > 1) {
      setEquipment(equipment.filter((_, i) => i !== index))
    }
  }

  const updateEquipment = (index: number, value: string) => {
    const updated = [...equipment]
    updated[index] = { ...updated[index], name: value }
    setEquipment(updated)
  }

  const toggleSeason = (season: string) => {
    if (season === 'all') {
      setSelectedSeasons(['all'])
    } else {
      const newSeasons = selectedSeasons.filter((s) => s !== 'all')
      if (newSeasons.includes(season)) {
        const filtered = newSeasons.filter((s) => s !== season)
        setSelectedSeasons(filtered.length ? filtered : ['all'])
      } else {
        setSelectedSeasons([...newSeasons, season])
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const validIngredients = ingredients.filter((ing) => ing.name.trim())
      const validEquipment = equipment.filter((eq) => eq.name.trim())

      if (validIngredients.length === 0) {
        throw new Error('At least one ingredient is required')
      }

      const data: Recipe = {
        name: name.trim(),
        instructions: instructions.trim(),
        complexityLevel,
        prepTime: prepTime ? parseInt(prepTime) : null,
        cookTime: cookTime ? parseInt(cookTime) : null,
        seasons: selectedSeasons,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        proteinType: proteinType.trim() || null,
        toddlerFriendly,
        toddlerPortionNotes: toddlerPortionNotes.trim() || null,
        source: source.trim() || null,
        ingredients: validIngredients.map((ing) => ({
          name: ing.name.trim(),
          quantity: ing.quantity,
          unit: ing.unit?.trim() || null,
          isOptional: ing.isOptional,
          category: ing.category?.trim() || null,
        })),
        equipment: validEquipment.map((eq) => ({
          name: eq.name.trim(),
        })),
      }

      await onSubmit(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="form-label">Recipe Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="e.g., Mom's Famous Lasagna"
            />
          </div>

          <div>
            <label className="form-label">Complexity Level *</label>
            <div className="flex gap-2">
              {[1, 2, 3].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setComplexityLevel(level)}
                  className={`flex-1 py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                    complexityLevel === level
                      ? 'bg-kitchen-100 border-kitchen-500 text-kitchen-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Level {level}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {SKILL_LEVELS[complexityLevel as keyof typeof SKILL_LEVELS]?.description}
            </p>
          </div>

          <div>
            <label className="form-label">Protein Type</label>
            <input
              type="text"
              value={proteinType}
              onChange={(e) => setProteinType(e.target.value)}
              className="form-input"
              placeholder="e.g., chicken, beef, vegetarian"
            />
          </div>

          <div>
            <label className="form-label">Prep Time (minutes)</label>
            <input
              type="number"
              min="0"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              className="form-input"
              placeholder="15"
            />
          </div>

          <div>
            <label className="form-label">Cook Time (minutes)</label>
            <input
              type="number"
              min="0"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              className="form-input"
              placeholder="30"
            />
          </div>

          <div className="md:col-span-2">
            <label className="form-label">Seasons</label>
            <div className="flex flex-wrap gap-2">
              {SEASONS.map((season) => (
                <button
                  key={season}
                  type="button"
                  onClick={() => toggleSeason(season)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedSeasons.includes(season)
                      ? 'bg-kitchen-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="form-label">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="form-input"
              placeholder="e.g., quick, weeknight, one-pot"
            />
          </div>

          <div className="md:col-span-2">
            <label className="form-label">Source</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="form-input"
              placeholder="e.g., Bon Appetit, Grandma's recipe, etc."
            />
          </div>
        </div>
      </div>

      {/* Toddler Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={toddlerFriendly}
              onChange={(e) => setToddlerFriendly(e.target.checked)}
              className="rounded border-gray-300 text-kitchen-600 focus:ring-kitchen-500"
            />
            <span className="font-medium text-gray-900">Toddler Friendly</span>
          </label>
        </div>
        {toddlerFriendly && (
          <div>
            <label className="form-label">Toddler Portion Notes</label>
            <textarea
              value={toddlerPortionNotes}
              onChange={(e) => setToddlerPortionNotes(e.target.value)}
              className="form-input"
              rows={2}
              placeholder="Notes about toddler portions, modifications, etc."
            />
          </div>
        )}
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Ingredients</h3>
          <button
            type="button"
            onClick={addIngredient}
            className="text-sm text-kitchen-600 hover:text-kitchen-700 font-medium"
          >
            + Add Ingredient
          </button>
        </div>
        <div className="space-y-3">
          {ingredients.map((ing, index) => (
            <div key={index} className="flex gap-2 items-start">
              <input
                type="text"
                value={ing.name}
                onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                className="form-input flex-1"
                placeholder="Ingredient name"
              />
              <input
                type="number"
                step="0.1"
                value={ing.quantity?.toString() || ''}
                onChange={(e) => updateIngredient(index, 'quantity', e.target.value ? parseFloat(e.target.value) : null)}
                className="form-input w-20"
                placeholder="Qty"
              />
              <input
                type="text"
                value={ing.unit || ''}
                onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                className="form-input w-20"
                placeholder="Unit"
              />
              <label className="flex items-center gap-1 px-2 py-2">
                <input
                  type="checkbox"
                  checked={ing.isOptional}
                  onChange={(e) => updateIngredient(index, 'isOptional', e.target.checked)}
                  className="rounded border-gray-300 text-kitchen-600 focus:ring-kitchen-500"
                />
                <span className="text-xs text-gray-500">Opt</span>
              </label>
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="p-2 text-gray-400 hover:text-red-600"
                disabled={ingredients.length === 1}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Equipment Needed</h3>
          <button
            type="button"
            onClick={addEquipment}
            className="text-sm text-kitchen-600 hover:text-kitchen-700 font-medium"
          >
            + Add Equipment
          </button>
        </div>
        <div className="space-y-3">
          {equipment.map((eq, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                value={eq.name}
                onChange={(e) => updateEquipment(index, e.target.value)}
                className="form-input flex-1"
                placeholder="e.g., Dutch oven, stand mixer"
              />
              <button
                type="button"
                onClick={() => removeEquipment(index)}
                className="p-2 text-gray-400 hover:text-red-600"
                disabled={equipment.length === 1}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Instructions</h3>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="form-input min-h-[200px]"
          placeholder="Write the recipe instructions here..."
          required
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-kitchen-600 text-white rounded-md hover:bg-kitchen-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Recipe' : 'Create Recipe'}
        </button>
      </div>
    </form>
  )
}
