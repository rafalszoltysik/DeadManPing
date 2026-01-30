import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/admin'
import { AdminUsersTable } from '@/components/AdminUsersTable'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

async function getUsers(page: number = 1, search: string = '') {
  const supabaseAdmin = getSupabaseAdmin()
  const limit = 50
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('profiles')
    .select('id, email, is_admin, subscription_tier, subscription_status, created_at, email_verified', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.ilike('email', `%${search}%`)
  }

  const { data: users, error, count } = await query

  if (error) {
    throw new Error('Failed to fetch users')
  }

  return {
    users: users || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  }
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const user = await getSupabaseUser()

  if (!user) {
    redirect('/auth/login?redirect=/admin/users')
  }

  const userIsAdmin = await isAdmin(user.id)

  if (!userIsAdmin) {
    redirect('/dashboard?error=admin_access_required')
  }

  const params = await searchParams
  const page = parseInt(params.page || '1')
  const search = params.search || ''

  let usersData
  try {
    usersData = await getUsers(page, search)
  } catch (error) {
    console.error('Error fetching users:', error)
    usersData = {
      users: [],
      pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-2">Manage users, admin access, and subscriptions</p>
      </div>
      <AdminUsersTable
        initialUsers={usersData.users}
        initialPagination={usersData.pagination}
      />
    </div>
  )
}


