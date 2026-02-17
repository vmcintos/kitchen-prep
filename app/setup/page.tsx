'use client'

import { useState } from 'react'

type Tab = 'login' | 'create'

export default function SetupPage() {
  const [tab, setTab] = useState<Tab>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Login form state
  const [loginName, setLoginName] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Create form state
  const [createName, setCreateName] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createConfirm, setCreateConfirm] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: loginName, password: loginPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      window.location.href = '/'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (createPassword !== createConfirm) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/household', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName, password: createPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create household')
      }

      window.location.href = '/'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create household')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-kitchen-600">Kitchen Prep</h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Household food & inventory management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Tab buttons */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 text-center text-sm font-medium border-b-2 transition-colors ${
                tab === 'login'
                  ? 'border-kitchen-500 text-kitchen-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setTab('create')}
              className={`flex-1 py-2 text-center text-sm font-medium border-b-2 transition-colors ${
                tab === 'create'
                  ? 'border-kitchen-500 text-kitchen-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Create Household
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="login-name" className="form-label">
                  Household Name
                </label>
                <input
                  id="login-name"
                  type="text"
                  required
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="form-input"
                  placeholder="Enter your household name"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="form-label">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-kitchen-600 hover:bg-kitchen-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kitchen-500 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label htmlFor="create-name" className="form-label">
                  Household Name
                </label>
                <input
                  id="create-name"
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="form-input"
                  placeholder="e.g., The Smith Family"
                />
              </div>

              <div>
                <label htmlFor="create-password" className="form-label">
                  Password
                </label>
                <input
                  id="create-password"
                  type="password"
                  required
                  minLength={4}
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="form-input"
                  placeholder="Create a password"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 4 characters. Share this with household members.
                </p>
              </div>

              <div>
                <label htmlFor="create-confirm" className="form-label">
                  Confirm Password
                </label>
                <input
                  id="create-confirm"
                  type="password"
                  required
                  value={createConfirm}
                  onChange={(e) => setCreateConfirm(e.target.value)}
                  className="form-input"
                  placeholder="Confirm password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-kitchen-600 hover:bg-kitchen-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kitchen-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Household'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
