'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HabitCard } from './habit-card'
import { AddHabitModal } from './add-habit-modal'
import { StatCard } from './stat-card'
import { InsightsPanel } from './insights-panel'
import { Button } from '@/components/ui/button'
import { Plus, Zap, LogOut } from 'lucide-react'
import { signOut } from '@/lib/auth'

interface Habit {
  id: string
  name: string
  description: string
  type: 'build' | 'avoid'
  category: string
  color: string
  createdAt: string
}

interface DashboardProps {
  userId: string
}

export function Dashboard({ userId }: DashboardProps) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [showAddHabit, setShowAddHabit] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleHabitAdded = () => {
    setShowAddHabit(false)
    // In a real app with Supabase, you'd reload from the database
  }

  const handleRefresh = () => {
    // In a real app with Supabase, you'd reload from the database
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('[v0] Error signing out:', error)
    }
  }

  const totalCompletions = 0;
  const completionRate = 0;

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
                onClick={() => setShowAddHabit(true)}
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
                {habits.length === 0 ? (
                  <div className="rounded-2xl bg-card border border-dashed border-border p-12 text-center flex flex-col items-center justify-center gap-4 min-h-80">
                    <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                      <Plus className="w-7 h-7 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Get started</h3>
                      <p className="text-sm text-muted-foreground mt-1">Create your first habit to begin tracking</p>
                    </div>
                    <Button
                      onClick={() => setShowAddHabit(true)}
                      className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Habit
                    </Button>
                  </div>
                ) : (
                  habits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      onUpdate={handleRefresh}
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
        onOpenChange={setShowAddHabit}
        onHabitAdded={handleHabitAdded}
      />
    </div>
  );
}
