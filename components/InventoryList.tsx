'use client'

import { useState, useEffect, useCallback } from 'react'
import { INVENTORY_CATEGORIES, INVENTORY_LOCATIONS } from '@/lib/types'

interface InventoryItem {
  id: string
  name: string
  upc: string | null
  preferredBrand: string | null
  category: string
  location: string
  quantity: number | null
  unit: string | null
  inStock: boolean
  notes: string | null
  dateUpdated: string
}

export default function InventoryList() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<InventoryItem>>({})

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    upc: '',
    preferredBrand: '',
    category: 'pantry',
    location: 'pantry',
    quantity: '',
    unit: '',
    inStock: true,
    notes: '',
  })

  const fetchItems = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (categoryFilter) params.set('category', categoryFilter)
      if (locationFilter) params.set('location', locationFilter)
      if (stockFilter) params.set('inStock', stockFilter)
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/inventory?${params.toString()}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to fetch items')

      setItems(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }, [categoryFilter, locationFilter, stockFilter, searchQuery])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newItem,
          quantity: newItem.quantity ? parseFloat(newItem.quantity) : null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add item')

      setItems([...items, data.item])
      setNewItem({
        name: '',
        upc: '',
        preferredBrand: '',
        category: 'pantry',
        location: 'pantry',
        quantity: '',
        unit: '',
        inStock: true,
        notes: '',
      })
      setShowAddForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item')
    }
  }

  const handleUpdateItem = async (id: string) => {
    setError(null)

    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update item')

      setItems(items.map((item) => (item.id === id ? data.item : item)))
      setEditingId(null)
      setEditData({})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item')
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    setError(null)

    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to delete item')

      setItems(items.filter((item) => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
    }
  }

  const toggleStock = async (item: InventoryItem) => {
    try {
      const res = await fetch(`/api/inventory/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: !item.inStock }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')

      setItems(items.map((i) => (i.id === item.id ? data.item : i)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  const startEditing = (item: InventoryItem) => {
    setEditingId(item.id)
    setEditData({
      name: item.name,
      preferredBrand: item.preferredBrand || '',
      category: item.category,
      location: item.location,
      quantity: item.quantity,
      unit: item.unit || '',
      notes: item.notes || '',
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditData({})
  }

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, InventoryItem[]>)

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              placeholder="Search items..."
            />
          </div>
          <div>
            <label className="form-label">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-input"
            >
              <option value="">All Categories</option>
              {INVENTORY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="form-input"
            >
              <option value="">All Locations</option>
              {INVENTORY_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc.charAt(0).toUpperCase() + loc.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Status</label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="form-input"
            >
              <option value="">All Status</option>
              <option value="true">In Stock</option>
              <option value="false">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-kitchen-600 hover:bg-kitchen-700"
        >
          {showAddForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Item</h3>
          <form onSubmit={handleAddItem}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="form-input"
                  placeholder="Item name"
                />
              </div>
              <div>
                <label className="form-label">Preferred Brand</label>
                <input
                  type="text"
                  value={newItem.preferredBrand}
                  onChange={(e) => setNewItem({ ...newItem, preferredBrand: e.target.value })}
                  className="form-input"
                  placeholder="e.g., Earth Balance"
                />
              </div>
              <div>
                <label className="form-label">UPC/Barcode</label>
                <input
                  type="text"
                  value={newItem.upc}
                  onChange={(e) => setNewItem({ ...newItem, upc: e.target.value })}
                  className="form-input"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="form-label">Category *</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="form-input"
                >
                  {INVENTORY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Location *</label>
                <select
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  className="form-input"
                >
                  {INVENTORY_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc.charAt(0).toUpperCase() + loc.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    className="form-input"
                    placeholder="1"
                  />
                </div>
                <div className="flex-1">
                  <label className="form-label">Unit</label>
                  <input
                    type="text"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="form-input"
                    placeholder="lbs, oz..."
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  className="form-input"
                  placeholder="Any notes..."
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newItem.inStock}
                    onChange={(e) => setNewItem({ ...newItem, inStock: e.target.checked })}
                    className="rounded border-gray-300 text-kitchen-600 focus:ring-kitchen-500"
                  />
                  <span className="text-sm text-gray-700">In Stock</span>
                </label>
              </div>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pantry-600 hover:bg-pantry-700"
              >
                Add to Inventory
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      {Object.keys(groupedItems).length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No items in inventory yet.</p>
          <p className="text-sm text-gray-400 mt-1">Click "Add Item" to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h3 className="font-medium text-gray-900 capitalize">
                  {category} ({categoryItems.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 hover:bg-gray-50 ${
                      !item.inStock ? 'bg-red-50' : ''
                    }`}
                  >
                    {editingId === item.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                        <input
                          type="text"
                          value={editData.name || ''}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="form-input text-sm"
                        />
                        <input
                          type="text"
                          value={editData.preferredBrand || ''}
                          onChange={(e) => setEditData({ ...editData, preferredBrand: e.target.value })}
                          className="form-input text-sm"
                          placeholder="Brand"
                        />
                        <select
                          value={editData.category || ''}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                          className="form-input text-sm"
                        >
                          {INVENTORY_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <select
                          value={editData.location || ''}
                          onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                          className="form-input text-sm"
                        >
                          {INVENTORY_LOCATIONS.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateItem(item.id)}
                            className="px-3 py-1 bg-pantry-600 text-white text-sm rounded hover:bg-pantry-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleStock(item)}
                            className={`w-5 h-5 rounded border ${
                              item.inStock
                                ? 'bg-pantry-500 border-pantry-500 text-white'
                                : 'border-gray-300'
                            } flex items-center justify-center`}
                          >
                            {item.inStock && (
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <div>
                            <p className={`font-medium ${!item.inStock ? 'text-red-600' : 'text-gray-900'}`}>
                              {item.name}
                            </p>
                            <div className="flex gap-2 text-sm text-gray-500">
                              {item.preferredBrand && (
                                <span className="text-kitchen-600">{item.preferredBrand}</span>
                              )}
                              <span>{item.location}</span>
                              {item.quantity && (
                                <span>
                                  {item.quantity} {item.unit}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!item.inStock && (
                            <span className="badge badge-red">Out of Stock</span>
                          )}
                          <button
                            onClick={() => startEditing(item)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
