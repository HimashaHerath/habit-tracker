import { redirect } from 'next/navigation'

import { getUser } from '@/lib/auth'
import { getAdminAlertCounts, getAdminOverview, getAdminUsers, getRecentHabits, isAdminUser } from '@/lib/admin'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toggleUserStatus, deleteHabitAdmin } from './actions'

interface AdminPageProps {
  searchParams?: {
    q?: string
  }
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const user = await getUser()
  if (!user) redirect('/auth/login')
  if (!isAdminUser(user.id)) redirect('/')

  const search = searchParams?.q?.trim() || ''
  const [overview, users, habits, alerts] = await Promise.all([
    getAdminOverview(),
    getAdminUsers(search),
    getRecentHabits(100),
    getAdminAlertCounts(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Admin</h1>
            <p className="text-sm text-muted-foreground">Lightweight controls for habit-tracker</p>
          </div>
          <Badge variant="secondary">Admin access</Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold text-foreground">{overview.totalUsers}</p>
          </Card>
          <Card className="p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active (7d)</p>
            <p className="text-2xl font-bold text-foreground">{overview.activeUsers}</p>
          </Card>
          <Card className="p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Habits</p>
            <p className="text-2xl font-bold text-foreground">{overview.totalHabits}</p>
          </Card>
          <Card className="p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Check-ins (30d)</p>
            <p className="text-2xl font-bold text-foreground">{overview.totalCheckIns}</p>
          </Card>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Alerts (24h)</h2>
            {alerts.available ? (
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>RLS errors</span>
                  <span className="font-medium text-foreground">{alerts.rlsErrors}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Rate limit hits</span>
                  <span className="font-medium text-foreground">{alerts.rateLimits}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Alerts aren’t configured yet. Add an `admin_events` table to enable.
              </p>
            )}
          </Card>
          <Card className="p-4 md:col-span-2">
            <h2 className="text-sm font-semibold text-foreground mb-2">Quick notes</h2>
            <p className="text-sm text-muted-foreground">
              Use this panel for lightweight admin tasks. For larger datasets, add pagination or filters.
            </p>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Users</h2>
            <form className="flex items-center gap-2" action="/admin" method="get">
              <Input
                name="q"
                placeholder="Search email"
                defaultValue={search}
                className="w-64"
              />
              <Button type="submit" variant="outline">Search</Button>
            </form>
          </div>
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((row) => {
                  const isDisabled = !!row.banned_until && new Date(row.banned_until) > new Date()
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.email ?? '—'}</TableCell>
                      <TableCell>{formatDate(row.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant={isDisabled ? 'destructive' : 'secondary'}>
                          {isDisabled ? 'Disabled' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <form action={toggleUserStatus}>
                          <input type="hidden" name="userId" value={row.id} />
                          <input type="hidden" name="disabled" value={String(isDisabled)} />
                          <Button size="sm" variant={isDisabled ? 'default' : 'outline'}>
                            {isDisabled ? 'Enable' : 'Disable'}
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Habits</h2>
            <Badge variant="secondary">Last 100</Badge>
          </div>
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {habits.map((habit) => (
                  <TableRow key={habit.id}>
                    <TableCell className="font-medium">{habit.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{habit.type}</Badge>
                    </TableCell>
                    <TableCell>{habit.category}</TableCell>
                    <TableCell>{formatDate(habit.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <form action={deleteHabitAdmin}>
                        <input type="hidden" name="habitId" value={habit.id} />
                        <Button size="sm" variant="destructive">Delete</Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
                {habits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                      No habits yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </section>
      </main>
    </div>
  )
}
