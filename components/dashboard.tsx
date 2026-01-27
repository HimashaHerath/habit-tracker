'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HabitCard } from './habit-card'
import { AddHabitModal } from './add-habit-modal'
import { StatCard } from './stat-card'
import { InsightsPanel } from './insights-panel'
import { HabitCardSkeleton } from './habit-card-skeleton'
import { Button } from '@/components/ui/button'
import { Plus, Zap, LogOut } from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { deleteHabit, getHabits, getHabitEntries, type Habit, type HabitEntry, type HabitWithEntries } from '@/lib/supabase/habits'
import { getCompletionStats } from '@/lib/habit-metrics'

interface DashboardProps {
  userId: string
}

export function Dashboard({ userId }: DashboardProps) {
  const [habits, setHabits] = useState<HabitWithEntries[]>([])
  const [showAddHabit, setShowAddHabit] = useState(false)
  const [loadingHabits, setLoadingHabits] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [pendingDelete, setPendingDelete] = useState<{
    habit: HabitWithEntries
    timeoutId: number
  } | null>(null)
  const [prefill, setPrefill] = useState<{
    name?: string
    description?: string
    type?: 'avoid' | 'build'
    category?: string
    color?: string
    frequency?: 'daily' | 'weekdays' | 'custom'
    days_of_week?: number[]
  } | null>(null)
  const router = useRouter()

  const loadHabits = useCallback(async () => {
    try {
      setLoadingHabits(true)
      setLoadError('')
      const data = await getHabits(userId)
      const entries = await Promise.all(
        data.map((habit) => getHabitEntries(habit.id)),
      )
      const combined = data.map((habit, index) => ({
        ...habit,
        entries: entries[index] ?? [],
      }))
      setHabits(combined)
    } catch (error) {
      console.error('[habit-tracker] Error loading habits:', error)
      setLoadError('Failed to load habits. Please try again.')
    } finally {
      setLoadingHabits(false)
    }
  }, [userId])

  useEffect(() => {
    void loadHabits()
  }, [loadHabits])

  const handleHabitAdded = (habit: Habit) => {
    setHabits((prev) => [{ ...habit, entries: [] }, ...prev])
    setShowAddHabit(false)
    setPrefill(null)
  }

  const handleAddModalChange = (open: boolean) => {
    setShowAddHabit(open)
    if (!open) {
      setPrefill(null)
    }
  }

  const handleEntriesChange = (habitId: string, entries: HabitEntry[]) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === habitId ? { ...habit, entries } : habit,
      ),
    )
  }

  const handleHabitUpdated = (updatedHabit: HabitWithEntries) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === updatedHabit.id ? updatedHabit : habit,
      ),
    )
  }

  const handleHabitDeleted = (habit: HabitWithEntries) => {
    setHabits((prev) => prev.filter((item) => item.id !== habit.id))

    if (pendingDelete) {
      window.clearTimeout(pendingDelete.timeoutId)
      void deleteHabit(pendingDelete.habit.id).catch((error) => {
        console.error('[habit-tracker] Error deleting habit:', error)
        setLoadError('Failed to delete habit. Please try again.')
        setHabits((prev) => [pendingDelete.habit, ...prev])
      })
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        await deleteHabit(habit.id)
      } catch (error) {
        console.error('[habit-tracker] Error deleting habit:', error)
        setLoadError('Failed to delete habit. Please try again.')
        setHabits((prev) => [habit, ...prev])
      } finally {
        setPendingDelete(null)
      }
    }, 5000)

    setPendingDelete({ habit, timeoutId })
  }

  const undoDelete = () => {
    if (!pendingDelete) return
    window.clearTimeout(pendingDelete.timeoutId)
    setHabits((prev) => [pendingDelete.habit, ...prev])
    setPendingDelete(null)
  }

  const openWithTemplate = (template: {
    name: string
    type: 'avoid' | 'build'
    category: string
    color: string
  }) => {
    setPrefill({
      name: template.name,
      type: template.type,
      category: template.category,
      color: template.color,
      frequency: 'daily',
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
    })
    setShowAddHabit(true)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.replace('/auth/login')
    } catch (error) {
      console.error('[habit-tracker] Error signing out:', error)
    }
  }

  const totals = habits.reduce(
    (sum, habit) => {
      const { completed, scheduled } = getCompletionStats(habit, habit.entries, 30)
      return {
        completed: sum.completed + completed,
        scheduled: sum.scheduled + scheduled,
      }
    },
    { completed: 0, scheduled: 0 },
  )
  const totalCompletions = totals.completed
  const completionRate =
    totals.scheduled > 0 ? Math.round((totals.completed / totals.scheduled) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">Today</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Progress</h1>
              <p className="text-sm text-muted-foreground mt-1">Track and celebrate your daily wins</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  setPrefill(null)
                  setShowAddHabit(true)
                }}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md hover:shadow-lg transition-all h-11 px-5"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Habit</span>
                <span className="sm:hidden">Add</span>
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="icon"
                className="h-11 w-11 bg-transparent"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        <div>
          {loadError && (
            <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between">
              <span>{loadError}</span>
              <Button variant="outline" size="sm" onClick={() => void loadHabits()}>
                Retry
              </Button>
            </div>
          )}
          {pendingDelete && (
            <div className="mb-6 rounded-xl border border-border bg-secondary/30 p-4 text-sm text-foreground flex items-center justify-between">
              <span>Deleted "{pendingDelete.habit.name}".</span>
              <Button variant="outline" size="sm" onClick={undoDelete}>
                Undo
              </Button>
            </div>
          )}
          {/* Overview Stats */}
          {habits.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              <StatCard
                label="Active Habits"
                value={habits.length}
                icon={Zap}
              />
              <StatCard
                label="Total Completions"
                value={totalCompletions}
                icon={Zap}
              />
              <StatCard
                label="Completion Rate"
                value={`${completionRate}%`}
                icon={Zap}
              />
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Habits List - Left/Main */}
            <div className="lg:col-span-2">
              <div className="space-y-3">
                {loadingHabits ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <HabitCardSkeleton key={`habit-skeleton-${index}`} />
                    ))}
                  </div>
                ) : habits.length === 0 ? (
                  <div className="rounded-2xl bg-card border border-dashed border-border p-12 text-center flex flex-col items-center justify-center gap-4 min-h-80">
                    <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                      <Plus className="w-7 h-7 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Get started</h3>
                      <p className="text-sm text-muted-foreground mt-1">Create your first habit to begin tracking</p>
                    </div>
                    <Button
                      onClick={() => {
                        setPrefill(null)
                        setShowAddHabit(true)
                      }}
                      className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Habit
                    </Button>
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">Try a template</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openWithTemplate({
                              name: 'No Nicotine',
                              type: 'avoid',
                              category: 'Health',
                              color: '#8B5CF6',
                            })
                          }
                        >
                          No Nicotine
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openWithTemplate({
                              name: 'Daily Gym',
                              type: 'build',
                              category: 'Fitness',
                              color: '#10B981',
                            })
                          }
                        >
                          Daily Gym
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openWithTemplate({
                              name: 'Meditation',
                              type: 'build',
                              category: 'Mental',
                              color: '#3B82F6',
                            })
                          }
                        >
                          Meditation
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  habits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      onEntriesChange={handleEntriesChange}
                      onDelete={handleHabitDeleted}
                      onHabitUpdated={handleHabitUpdated}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Insights Panel - Right Sidebar */}
            {habits.length > 0 && (
              <div className="lg:col-span-1">
                <InsightsPanel habits={habits} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Habit Modal */}
      <AddHabitModal
        open={showAddHabit}
        onOpenChange={handleAddModalChange}
        onHabitAdded={handleHabitAdded}
        userId={userId}
        initialValues={prefill}
      />
    </div>
  );
}
