'use client'

import { useState, useEffect, useCallback } from 'react'
import { SKILL_LEVELS, SEASONS } from '@/lib/types'

interface Ingredient {
  id: string
  name: string
  quantity: number | null
  unit: string | null
  isOptional: boolean
  category: string | null
}

interface EquipmentItem {
  id: string
  name: string
}

interface Recipe {
  id: string
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
  equipment: EquipmentItem[]
  createdAt: string
}

const BLANK_RECIPE = {
  name: '',
  instructions: '',
  complexityLevel: 2,
  prepTime: '',
  cookTime: '',
  seasons: ['all'],
  tags: '',
  proteinType: '',
  toddlerFriendly: false,
  toddlerPortionNotes: '',
  source: '',
  ingredients: [{ name: '', quantity: '', unit: '', isOptional: false, category: '' }],
  equipment: [{ name: '' }],
}

const COMPLEXITY_LABELS: Record<number, string> = {
  1: 'Heat & Eat',
  2: 'Simple Prep',
  3: 'From Scratch',
}

const COMPLEXITY_COLORS: Record<number, string> = {
  1: 'badge-green',
  2: 'badge-kitchen',
  3: 'badge-orange',
}

export default function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [complexityFilter, setComplexityFilter] = useState('')
  const [seasonFilter, setSeasonFilter] = useState('')
  const [proteinFilter, setProteinFilter] = useState('')
  const [toddlerFilter, setToddlerFilter] = useState(false)

  // UI state
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)

  // Form state
  const [formData, setFormData] = useState(BLANK_RECIPE)
  const [saving, setSaving] = useState(false)

  const fetchRecipes = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (complexityFilter) params.set('complexity', complexityFilter)
      if (seasonFilter) params.set('season', seasonFilter)
      if (proteinFilter) params.set('proteinType', proteinFilter)
      if (toddlerFilter) params.set('toddlerFriendly', 'true')

      const res = await fetch(`/api/recipes?${params.toString()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch')
      setRecipes(data.recipes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, complexityFilter, seasonFilter, proteinFilter, toddlerFilter])

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  const formatTime = (mins: number | null) => {
    if (!mins) return null
    if (mins < 60) return `${mins}m`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', quantity: '', unit: '', isOptional: false, category: '' }],
    })
  }

  const removeIngredient = (i: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, idx) => idx !== i),
    })
  }

  const updateIngredient = (i: number, field: string, value: string | boolean) => {
    const updated = [...formData.ingredients]
    updated[i] = { ...updated[i], [field]: value }
    setFormData({ ...formData, ingredients: updated })
  }

  const addEquipment = () => {
    setFormData({ ...formData, equipment: [...formData.equipment, { name: '' }] })
  }

  const removeEquipment = (i: number) => {
    setFormData({ ...formData, equipment: formData.equipment.filter((_, idx) => idx !== i) })
  }

  const toggleSeason = (season: string) => {
    if (season === 'all') {
      setFormData({ ...formData, seasons: ['all'] })
      return
    }
    const current = formData.seasons.filter((s) => s !== 'all')
    const next = current.includes(season) ? current.filter((s) => s !== season) : [...current, season]
    setFormData({ ...formData, seasons: next.length === 0 ? ['all'] : next })
  }

  const startEditing = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setSelectedRecipe(null)
    setFormData({
      name: recipe.name,
      instructions: recipe.instructions,
      complexityLevel: recipe.complexityLevel,
      prepTime: recipe.prepTime?.toString() || '',
      cookTime: recipe.cookTime?.toString() || '',
      seasons: recipe.seasons,
      tags: recipe.tags.join(', '),
      proteinType: recipe.proteinType || '',
      toddlerFriendly: recipe.toddlerFriendly,
      toddlerPortionNotes: recipe.toddlerPortionNotes || '',
      source: recipe.source || '',
      ingredients: recipe.ingredients.map((ing) => ({
        name: ing.name,
        quantity: ing.quantity?.toString() || '',
        unit: ing.unit || '',
        isOptional: ing.isOptional,
        category: ing.category || '',
      })),
      equipment: recipe.equipment.length > 0 ? recipe.equipment.map((eq) => ({ name: eq.name })) : [{ name: '' }],
    })
    setShowAddForm(true)
  }

  const cancelForm = () => {
    setShowAddForm(false)
    setEditingRecipe(null)
    setFormData(BLANK_RECIPE)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      name: formData.name,
      instructions: formData.instructions,
      complexityLevel: Number(formData.complexityLevel),
      prepTime: formData.prepTime ? Number(formData.prepTime) : undefined,
      cookTime: formData.cookTime ? Number(formData.cookTime) : undefined,
      seasons: formData.seasons,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      proteinType: formData.proteinType || undefined,
      toddlerFriendly: formData.toddlerFriendly,
      toddlerPortionNotes: formData.toddlerPortionNotes || undefined,
      source: formData.source || undefined,
      ingredients: formData.ingredients
        .filter((ing) => ing.name.trim())
        .map((ing) => ({
          name: ing.name,
          quantity: ing.quantity ? Number(ing.quantity) : undefined,
          unit: ing.unit || undefined,
          isOptional: ing.isOptional,
          category: ing.category || undefined,
        })),
      equipment: formData.equipment.filter((eq) => eq.name.trim()),
    }

    try {
      const url = editingRecipe ? `/api/recipes/${editingRecipe.id}` : '/api/recipes'
      const method = editingRecipe ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')

      if (editingRecipe) {
        setRecipes(recipes.map((r) => (r.id === editingRecipe.id ? data.recipe : r)))
      } else {
        setRecipes([...recipes, data.recipe])
      }
      cancelForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this recipe?')) return
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      setRecipes(recipes.filter((r) => r.id !== id))
      if (selectedRecipe?.id === id) setSelectedRecipe(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kitchen-600"></div>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            placeholder="Search recipes..."
          />
          <select value={complexityFilter} onChange={(e) => setComplexityFilter(e.target.value)} className="form-input">
            <option value="">All Complexity</option>
            <option value="1">1 – Heat & Eat</option>
            <option value="2">2 – Simple Prep</option>
            <option value="3">3 – From Scratch</option>
          </select>
          <select value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)} className="form-input">
            <option value="">All Seasons</option>
            {SEASONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <input
            type="text"
            value={proteinFilter}
            onChange={(e) => setProteinFilter(e.target.value)}
            className="form-input"
            placeholder="Protein type..."
          />
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={toddlerFilter}
              onChange={(e) => setToddlerFilter(e.target.checked)}
              className="rounded border-gray-300 text-kitchen-600 focus:ring-kitchen-500"
            />
            Toddler friendly
          </label>
        </div>
      </div>

      {/* Add Button */}
      <div className="mb-6">
        <button
          onClick={() => { setShowAddForm(!showAddForm); setEditingRecipe(null); setFormData(BLANK_RECIPE) }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-kitchen-600 hover:bg-kitchen-700"
        >
          {showAddForm && !editingRecipe ? 'Cancel' : '+ Add Recipe'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingRecipe ? `Editing: ${editingRecipe.name}` : 'New Recipe'}
          </h3>
          <form onSubmit={handleSave}>
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="Recipe name"
                />
              </div>
              <div>
                <label className="form-label">Complexity *</label>
                <select
                  value={formData.complexityLevel}
                  onChange={(e) => setFormData({ ...formData, complexityLevel: Number(e.target.value) })}
                  className="form-input"
                >
                  <option value={1}>1 – Heat & Eat (no prep)</option>
                  <option value={2}>2 – Simple Prep (30 min or less)</option>
                  <option value={3}>3 – From Scratch (45+ min)</option>
                </select>
              </div>
              <div>
                <label className="form-label">Prep Time (min)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.prepTime}
                  onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                  className="form-input"
                  placeholder="15"
                />
              </div>
              <div>
                <label className="form-label">Cook Time (min)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.cookTime}
                  onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                  className="form-input"
                  placeholder="30"
                />
              </div>
              <div>
                <label className="form-label">Protein Type</label>
                <input
                  type="text"
                  value={formData.proteinType}
                  onChange={(e) => setFormData({ ...formData, proteinType: e.target.value })}
                  className="form-input"
                  placeholder="chicken, beef, vegetarian..."
                />
              </div>
              <div>
                <label className="form-label">Source</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="form-input"
                  placeholder="cookbook, website, original..."
                />
              </div>
              <div>
                <label className="form-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="form-input"
                  placeholder="quick, kid-friendly, one-pot..."
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="form-label">Seasons</label>
                <div className="flex flex-wrap gap-2">
                  {SEASONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSeason(s)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        formData.seasons.includes(s)
                          ? 'bg-kitchen-600 text-white border-kitchen-600'
                          : 'border-gray-300 text-gray-600 hover:border-kitchen-400'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-4">
              <label className="form-label">Instructions *</label>
              <textarea
                required
                rows={5}
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="form-input"
                placeholder="Step by step instructions..."
              />
            </div>

            {/* Toddler */}
            <div className="mb-4 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.toddlerFriendly}
                  onChange={(e) => setFormData({ ...formData, toddlerFriendly: e.target.checked })}
                  className="rounded border-gray-300 text-kitchen-600 focus:ring-kitchen-500"
                />
                Toddler Friendly
              </label>
              {formData.toddlerFriendly && (
                <input
                  type="text"
                  value={formData.toddlerPortionNotes}
                  onChange={(e) => setFormData({ ...formData, toddlerPortionNotes: e.target.value })}
                  className="form-input flex-1"
                  placeholder="Toddler portion notes (e.g., remove spices, cut small)"
                />
              )}
            </div>

            {/* Ingredients */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label mb-0">Ingredients *</label>
                <button type="button" onClick={addIngredient} className="text-sm text-kitchen-600 hover:text-kitchen-700">
                  + Add Ingredient
                </button>
              </div>
              <div className="space-y-2">
                {formData.ingredients.map((ing, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      required={i === 0}
                      value={ing.name}
                      onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                      className="form-input col-span-4"
                      placeholder="Ingredient name"
                    />
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      value={ing.quantity}
                      onChange={(e) => updateIngredient(i, 'quantity', e.target.value)}
                      className="form-input col-span-2"
                      placeholder="Qty"
                    />
                    <input
                      type="text"
                      value={ing.unit}
                      onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
                      className="form-input col-span-2"
                      placeholder="Unit"
                    />
                    <input
                      type="text"
                      value={ing.category}
                      onChange={(e) => updateIngredient(i, 'category', e.target.value)}
                      className="form-input col-span-2"
                      placeholder="Category"
                    />
                    <label className="flex items-center gap-1 col-span-1 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={ing.isOptional}
                        onChange={(e) => updateIngredient(i, 'isOptional', e.target.checked)}
                        className="rounded"
                      />
                      Opt
                    </label>
                    {formData.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(i)}
                        className="col-span-1 text-red-400 hover:text-red-600 text-center"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label mb-0">Equipment Needed</label>
                <button type="button" onClick={addEquipment} className="text-sm text-kitchen-600 hover:text-kitchen-700">
                  + Add Equipment
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.equipment.map((eq, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={eq.name}
                      onChange={(e) => {
                        const updated = [...formData.equipment]
                        updated[i] = { name: e.target.value }
                        setFormData({ ...formData, equipment: updated })
                      }}
                      className="form-input w-40"
                      placeholder="e.g., instant pot"
                    />
                    {formData.equipment.length > 1 && (
                      <button type="button" onClick={() => removeEquipment(i)} className="text-red-400 hover:text-red-600">×</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-kitchen-600 text-white text-sm font-medium rounded-md hover:bg-kitchen-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingRecipe ? 'Save Changes' : 'Add Recipe'}
              </button>
              <button type="button" onClick={cancelForm} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && !showAddForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedRecipe.name}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`badge ${COMPLEXITY_COLORS[selectedRecipe.complexityLevel]}`}>
                    Level {selectedRecipe.complexityLevel}: {COMPLEXITY_LABELS[selectedRecipe.complexityLevel]}
                  </span>
                  {selectedRecipe.proteinType && <span className="badge badge-blue">{selectedRecipe.proteinType}</span>}
                  {selectedRecipe.toddlerFriendly && <span className="badge badge-green">Toddler Friendly</span>}
                  {selectedRecipe.seasons.map((s) => (
                    <span key={s} className="badge badge-gray capitalize">{s}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => setSelectedRecipe(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <div className="flex gap-4 text-sm text-gray-500 mb-4">
              {selectedRecipe.prepTime && <span>Prep: {formatTime(selectedRecipe.prepTime)}</span>}
              {selectedRecipe.cookTime && <span>Cook: {formatTime(selectedRecipe.cookTime)}</span>}
              {selectedRecipe.source && <span>Source: {selectedRecipe.source}</span>}
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Ingredients</h3>
              <ul className="space-y-1">
                {selectedRecipe.ingredients.map((ing) => (
                  <li key={ing.id} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>
                      {ing.quantity && `${ing.quantity} `}
                      {ing.unit && `${ing.unit} `}
                      {ing.name}
                      {ing.isOptional && <span className="text-gray-400 ml-1">(optional)</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedRecipe.equipment.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Equipment Needed</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRecipe.equipment.map((eq) => (
                    <span key={eq.id} className="badge badge-gray">{eq.name}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedRecipe.instructions}</p>
            </div>

            {selectedRecipe.toddlerPortionNotes && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                <p className="text-sm font-medium text-green-800">Toddler Notes</p>
                <p className="text-sm text-green-700">{selectedRecipe.toddlerPortionNotes}</p>
              </div>
            )}

            {selectedRecipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedRecipe.tags.map((tag) => (
                  <span key={tag} className="badge badge-gray">{tag}</span>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => startEditing(selectedRecipe)}
                className="px-4 py-2 bg-kitchen-600 text-white text-sm font-medium rounded-md hover:bg-kitchen-700"
              >
                Edit
              </button>
              <button
                onClick={() => { handleDelete(selectedRecipe.id); setSelectedRecipe(null) }}
                className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-md hover:bg-red-100 border border-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Grid */}
      {recipes.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No recipes yet.</p>
          <p className="text-sm text-gray-400 mt-1">Click "Add Recipe" to save your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedRecipe(recipe)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 text-sm leading-snug">{recipe.name}</h3>
                <span className={`badge ml-2 shrink-0 ${COMPLEXITY_COLORS[recipe.complexityLevel]}`}>
                  L{recipe.complexityLevel}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {recipe.proteinType && <span className="badge badge-blue text-xs">{recipe.proteinType}</span>}
                {recipe.toddlerFriendly && <span className="badge badge-green text-xs">Toddler OK</span>}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {recipe.prepTime && <span>Prep {formatTime(recipe.prepTime)}</span>}
                {recipe.cookTime && <span>Cook {formatTime(recipe.cookTime)}</span>}
                <span className="ml-auto">{recipe.ingredients.length} ingredients</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
