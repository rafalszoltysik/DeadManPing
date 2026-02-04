'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

interface User {
  id: string
  email: string
  is_admin: boolean
  subscription_tier: string | null
  subscription_status: string | null
  created_at: string | null
  email_verified: boolean | null
}

interface AdminUsersTableProps {
  initialUsers: User[]
  initialPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function AdminUsersTable({ initialUsers, initialPagination }: AdminUsersTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [pagination, setPagination] = useState(initialPagination)
  const [page, setPage] = useState(initialPagination.page)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchUsers = async (pageNum: number, searchQuery: string = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '50',
      })
      if (searchQuery) {
        params.set('search', searchQuery)
      }

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers(1, search)
      setPage(1)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search])

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'remove' : 'grant'} admin access for this user?`)) {
      return
    }

    setActionLoading(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update admin status')
      }

      const data = await response.json()
      setUsers(users.map(u => u.id === userId ? { ...u, is_admin: data.user.is_admin } : u))
    } catch (error: any) {
      alert(error.message || 'Failed to update admin status')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone.`)) {
      return
    }

    setActionLoading(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete user')
      }

      setUsers(users.filter(u => u.id !== userId))
      setPagination({ ...pagination, total: pagination.total - 1 })
    } catch (error: any) {
      alert(error.message || 'Failed to delete user')
    } finally {
      setActionLoading(null)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchUsers(newPage, search)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Users</h2>
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : (
        <>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Admin</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Tier</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Verified</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Created</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-accent/50">
                        <td className="px-4 py-3 text-sm text-foreground">{user.email}</td>
                        <td className="px-4 py-3 text-sm">
                          {user.is_admin ? (
                            <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                              Admin
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground capitalize">
                          {user.subscription_tier || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground capitalize">
                          {user.subscription_status || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {user.email_verified ? (
                            <span className="text-green-600 dark:text-green-400">OK</span>
                          ) : (
                            <span className="text-muted-foreground">NO</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {user.created_at
                            ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true })
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                              disabled={actionLoading === user.id}
                              className="px-3 py-1 text-xs rounded bg-accent hover:bg-accent/80 text-foreground disabled:opacity-50"
                            >
                              {actionLoading === user.id ? '...' : user.is_admin ? 'Remove Admin' : 'Make Admin'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              disabled={actionLoading === user.id}
                              className="px-3 py-1 text-xs rounded bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || loading}
                  className="px-4 py-2 rounded bg-accent hover:bg-accent/80 text-foreground disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= pagination.totalPages || loading}
                  className="px-4 py-2 rounded bg-accent hover:bg-accent/80 text-foreground disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}


