import 'server-only'

import { createAdminClient } from './supabase/admin'
import { addDays, formatLocalDate } from './date'

export function getAdminAllowlist(): string[] {
  return (process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

export function isAdminUser(userId: string | null | undefined): boolean {
  if (!userId) return false
  const allowlist = getAdminAllowlist()
  return allowlist.includes(userId)
}

export async function getAdminOverview() {
  const admin = createAdminClient()
  const today = formatLocalDate()
  const sevenDaysAgo = addDays(today, -6)
  const thirtyDaysAgo = addDays(today, -29)

  const [
    totalHabitsResult,
    totalEntriesResult,
  ] = await Promise.all([
    admin.from('habits').select('id', { count: 'exact', head: true }),
    admin.from('habit_entries').select('id', { count: 'exact', head: true }).gte('date', thirtyDaysAgo),
  ])

  const totalHabits = totalHabitsResult.count ?? 0
  const totalCheckIns = totalEntriesResult.count ?? 0

  const recentEntriesResult = await admin
    .from('habit_entries')
    .select('habit_id')
    .gte('date', sevenDaysAgo)
    .limit(5000)

  const habitIds = Array.from(
    new Set((recentEntriesResult.data || []).map((entry) => entry.habit_id)),
  )

  let activeUsers = 0
  if (habitIds.length) {
    const habitsResult = await admin
      .from('habits')
      .select('user_id')
      .in('id', habitIds)
      .limit(5000)
    activeUsers = new Set((habitsResult.data || []).map((habit) => habit.user_id)).size
  }

  let totalUsers = 0
  try {
    const usersCount = await admin
      .schema('auth')
      .from('users')
      .select('id', { count: 'exact', head: true })
    totalUsers = usersCount.count ?? 0
  } catch {
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 })
    totalUsers = data?.total ?? data?.users?.length ?? 0
  }

  return {
    totalUsers,
    activeUsers,
    totalHabits,
    totalCheckIns,
  }
}

export async function getAdminUsers(search?: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (error) throw error
  const users = data?.users ?? []
  if (!search) return users
  const query = search.toLowerCase()
  return users.filter((user) => user.email?.toLowerCase().includes(query))
}

export async function getRecentHabits(limit = 100) {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('habits')
    .select('id,name,type,category,user_id,created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function getAdminAlertCounts() {
  const admin = createAdminClient()
  try {
    const today = formatLocalDate()
    const yesterday = addDays(today, -1)
    const { count: rlsErrors } = await admin
      .from('admin_events')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'rls_error')
      .gte('created_at', yesterday)
    const { count: rateLimits } = await admin
      .from('admin_events')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'rate_limit')
      .gte('created_at', yesterday)
    return {
      available: true,
      rlsErrors: rlsErrors ?? 0,
      rateLimits: rateLimits ?? 0,
    }
  } catch {
    return {
      available: false,
      rlsErrors: 0,
      rateLimits: 0,
    }
  }
}
