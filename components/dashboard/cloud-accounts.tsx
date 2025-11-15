'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Cloud, Trash2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface CloudAccount {
  id: string
  provider: 'aws' | 'azure' | 'gcp'
  account_name: string
  account_id: string
  is_active: boolean
  created_at: string
  last_scan_at: string | null
}

export function CloudAccounts() {
  const [accounts, setAccounts] = useState<CloudAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    provider: 'aws',
    account_name: '',
    account_id: '',
    access_key: '',
    secret_key: '',
    region: 'eu-central-1'
  })

  const supabase = createClient()

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts')
      const data = await response.json()

      if (response.ok) {
        setAccounts(data.accounts)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch cloud accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: formData.provider,
          account_name: formData.account_name,
          account_id: formData.account_id || 'unknown',
          credentials: {
            access_key: formData.access_key,
            secret_key: formData.secret_key,
            region: formData.region
          }
        })
      })

      const data = await response.json()

      if (response.ok) {
        setAccounts([data.account, ...accounts])
        setShowAddForm(false)
        setFormData({
          provider: 'aws',
          account_name: '',
          account_id: '',
          access_key: '',
          secret_key: '',
          region: 'eu-central-1'
        })
      } else {
        setError(data.error || 'Failed to add cloud account')
      }
    } catch (err) {
      setError('Failed to add cloud account')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this cloud account?')) {
      return
    }

    try {
      const response = await fetch(`/api/accounts?id=${accountId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAccounts(accounts.filter(acc => acc.id !== accountId))
      } else {
        const data = await response.json()
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to delete cloud account')
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'aws':
        return '☁️ AWS'
      case 'azure':
        return '☁️ Azure'
      case 'gcp':
        return '☁️ GCP'
      default:
        return '☁️'
    }
  }

  if (loading && accounts.length === 0) {
    return <div className="text-center py-8">Loading cloud accounts...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cloud Accounts</CardTitle>
            <CardDescription>
              Connect your cloud provider accounts to start monitoring
            </CardDescription>
          </div>
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {showAddForm && (
          <form onSubmit={handleAddAccount} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="provider">Cloud Provider</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) => setFormData({ ...formData, provider: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aws">Amazon Web Services (AWS)</SelectItem>
                    <SelectItem value="azure">Microsoft Azure</SelectItem>
                    <SelectItem value="gcp">Google Cloud Platform (GCP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="account_name">Account Name</Label>
                <Input
                  id="account_name"
                  placeholder="e.g., Production AWS"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="account_id">Account ID (Optional)</Label>
                <Input
                  id="account_id"
                  placeholder="e.g., 123456789012"
                  value={formData.account_id}
                  onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  placeholder="e.g., eu-central-1"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="access_key">Access Key</Label>
                <Input
                  id="access_key"
                  type="password"
                  placeholder="AKIA..."
                  value={formData.access_key}
                  onChange={(e) => setFormData({ ...formData, access_key: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="secret_key">Secret Key</Label>
                <Input
                  id="secret_key"
                  type="password"
                  placeholder="Your secret key"
                  value={formData.secret_key}
                  onChange={(e) => setFormData({ ...formData, secret_key: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Account'}
              </Button>
            </div>
          </form>
        )}

        {accounts.length === 0 && !showAddForm ? (
          <div className="text-center py-8 text-gray-500">
            <Cloud className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No cloud accounts connected yet.</p>
            <p className="text-sm">Click "Add Account" to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getProviderIcon(account.provider)}</div>
                  <div>
                    <h4 className="font-medium text-gray-900">{account.account_name}</h4>
                    <p className="text-sm text-gray-500">
                      {account.account_id} • {account.provider.toUpperCase()}
                    </p>
                    {account.last_scan_at ? (
                      <p className="text-xs text-gray-400">
                        Last scan: {new Date(account.last_scan_at).toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">Never scanned</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      account.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {account.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAccount(account.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
