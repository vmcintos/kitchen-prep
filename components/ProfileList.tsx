'use client'

import { useState, useEffect, useCallback } from 'react'
import { SKILL_LEVELS, DAYS_OF_WEEK } from '@/lib/types'

interface CookProfile {
  skillLevel: number
  mealsPerWeek: number
  availableDays: string[]
  preferredEquipment: string[]
}

interface User {
  id: string
  name: string
  email: string | null
  allergies: string[]
  dislikes: string[]
  preferences: string[]
  isCook: boolean
  cookProfile: CookProfile | null
}

const BLANK_USER = {
  name: '',
  email: '',
  allergies: '',
  dislikes: '',
  preferences: '',
  isCook: false,
  skillLevel: 2,
  mealsPerWeek: 3,
  availableDays: [] as string[],
  preferredEquipment: '',
}

export default function ProfileList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState(BLANK_USER)
  const [saving, setSaving] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch')
      setUsers(data.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const startEditing = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email || '',
      allergies: user.allergies.join(', '),
      dislikes: user.dislikes.join(', '),
      preferences: user.preferences.join(', '),
      isCook: user.isCook,
      skillLevel: user.cookProfile?.skillLevel || 2,
      mealsPerWeek: user.cookProfile?.mealsPerWeek || 3,
      availableDays: user.cookProfile?.availableDays || [],
      preferredEquipment: user.cookProfile?.preferredEquipment.join(', ') || '',
    })
    setShowAddForm(true)
  }

  const cancelForm = () => {
    setShowAddForm(false)
    setEditingUser(null)
    setFormData(BLANK_USER)
  }

  const toggleDay = (day: string) => {
    const updated = formData.availableDays.includes(day)
      ? formData.availableDays.filter((d) => d !== day)
      : [...formData.availableDays, day]
    setFormData({ ...formData, availableDays: updated })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload: any = {
      name: formData.name,
      email: formData.email || undefined,
      allergies: formData.allergies.split(',').map((s) => s.trim()).filter(Boolean),
      dislikes: formData.dislikes.split(',').map((s) => s.trim()).filter(Boolean),
      preferences: formData.preferences.split(',').map((s) => s.trim()).filter(Boolean),
      isCook: formData.isCook,
    }

    if (formData.isCook) {
      payload.cookProfile = {
        skillLevel: formData.skillLevel,
        mealsPerWeek: formData.mealsPerWeek,
        availableDays: formData.availableDays,
        preferredEquipment: formData.preferredEquipment
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      }
    }

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users'
      const method = editingUser ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')

      if (editingUser) {
        setUsers(users.map((u) => (u.id === editingUser.id ? data.user : u)))
      } else {
        setUsers([...users, data.user])
      }
      cancelForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from the household?`)) return
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      setUsers(users.filter((u) => u.id !== id))
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

      {/* Add Button */}
      <div className="mb-6">
        <button
          onClick={() => { setShowAddForm(!showAddForm); setEditingUser(null); setFormData(BLANK_USER) }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-kitchen-600 hover:bg-kitchen-700"
        >
          {showAddForm && !editingUser ? 'Cancel' : '+ Add Member'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingUser ? `Edit: ${editingUser.name}` : 'New Household Member'}
          </h3>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="e.g., Katrina"
                />
              </div>
              <div>
                <label className="form-label">Email (optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  placeholder="For future login support"
                />
              </div>
              <div>
                <label className="form-label">Allergies (comma-separated)</label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="form-input"
                  placeholder="nuts, gluten, dairy..."
                />
              </div>
              <div>
                <label className="form-label">Dislikes (comma-separated)</label>
                <input
                  type="text"
                  value={formData.dislikes}
                  onChange={(e) => setFormData({ ...formData, dislikes: e.target.value })}
                  className="form-input"
                  placeholder="Brussels sprouts, cilantro..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="form-label">Preferences (comma-separated)</label>
                <input
                  type="text"
                  value={formData.preferences}
                  onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                  className="form-input"
                  placeholder="vegetarian, low-carb, spicy..."
                />
              </div>
            </div>

            {/* Cook Toggle */}
            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCook}
                  onChange={(e) => setFormData({ ...formData, isCook: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-kitchen-600 focus:ring-kitchen-500"
                />
                <span className="text-sm font-medium text-gray-700">This person cooks for the household</span>
              </label>
            </div>

            {/* Cook Profile Fields */}
            {formData.isCook && (
              <div className="bg-kitchen-50 rounded-lg p-4 mb-4 border border-kitchen-200">
                <h4 className="text-sm font-semibold text-kitchen-800 mb-3">Cook Profile</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Skill Level</label>
                    <select
                      value={formData.skillLevel}
                      onChange={(e) => setFormData({ ...formData, skillLevel: Number(e.target.value) })}
                      className="form-input"
                    >
                      {Object.entries(SKILL_LEVELS).map(([level, info]) => (
                        <option key={level} value={Number(level)}>
                          {level} – {info.name}: {info.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Meals Per Week</label>
                    <input
                      type="number"
                      min="0"
                      max="21"
                      value={formData.mealsPerWeek}
                      onChange={(e) => setFormData({ ...formData, mealsPerWeek: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Available Days</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                            formData.availableDays.includes(day)
                              ? 'bg-kitchen-600 text-white border-kitchen-600'
                              : 'border-gray-300 text-gray-600 hover:border-kitchen-400'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Preferred Equipment (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.preferredEquipment}
                      onChange={(e) => setFormData({ ...formData, preferredEquipment: e.target.value })}
                      className="form-input"
                      placeholder="instant pot, air fryer, grill..."
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-kitchen-600 text-white text-sm font-medium rounded-md hover:bg-kitchen-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingUser ? 'Save Changes' : 'Add Member'}
              </button>
              <button type="button" onClick={cancelForm} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members Grid */}
      {users.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No household members yet.</p>
          <p className="text-sm text-gray-400 mt-1">Add family members to track dietary needs and cooking schedules.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{user.name}</h3>
                  {user.email && <p className="text-xs text-gray-400">{user.email}</p>}
                </div>
                <div className="flex gap-1">
                  {user.isCook && <span className="badge badge-pantry">Cook</span>}
                </div>
              </div>

              {user.cookProfile && (
                <div className="bg-kitchen-50 rounded-md p-3 mb-3 text-sm">
                  <p className="font-medium text-kitchen-800">
                    Skill Level {user.cookProfile.skillLevel}: {SKILL_LEVELS[user.cookProfile.skillLevel as keyof typeof SKILL_LEVELS]?.name}
                  </p>
                  <p className="text-kitchen-700">{user.cookProfile.mealsPerWeek} meals/week</p>
                  {user.cookProfile.availableDays.length > 0 && (
                    <p className="text-kitchen-600 text-xs mt-1">
                      Available: {user.cookProfile.availableDays.map((d) => d.slice(0, 3)).join(', ')}
                    </p>
                  )}
                </div>
              )}

              {user.allergies.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-gray-500 mb-1">Allergies</p>
                  <div className="flex flex-wrap gap-1">
                    {user.allergies.map((a) => (
                      <span key={a} className="badge badge-red">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {user.dislikes.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-gray-500 mb-1">Dislikes</p>
                  <div className="flex flex-wrap gap-1">
                    {user.dislikes.map((d) => (
                      <span key={d} className="badge badge-gray">{d}</span>
                    ))}
                  </div>
                </div>
              )}

              {user.preferences.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Preferences</p>
                  <div className="flex flex-wrap gap-1">
                    {user.preferences.map((p) => (
                      <span key={p} className="badge badge-blue">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-gray-100 mt-3">
                <button
                  onClick={() => startEditing(user)}
                  className="text-sm text-kitchen-600 hover:text-kitchen-800 font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user.id, user.name)}
                  className="text-sm text-red-400 hover:text-red-600 font-medium ml-auto"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
