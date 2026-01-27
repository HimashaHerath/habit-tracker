'use client';

import type { HabitWithEntries } from '@/lib/supabase/habits';
import {
  calculateLongestStreak,
  getCompletionStats,
  isScheduledDate,
} from '@/lib/habit-metrics';
import { formatLocalDate } from '@/lib/date';
import { Flame, TrendingUp } from 'lucide-react';

interface InsightsPanelProps {
  habits: HabitWithEntries[];
}

export function InsightsPanel({ habits }: InsightsPanelProps) {
  const longestStreak = habits.length === 0
    ? 0
    : Math.max(...habits.map((habit) => calculateLongestStreak(habit, habit.entries)));

  const weekStats = habits.reduce(
    (sum, habit) => {
      const { completed, scheduled } = getCompletionStats(habit, habit.entries, 7);
      return {
        completed: sum.completed + completed,
        scheduled: sum.scheduled + scheduled,
      };
    },
    { completed: 0, scheduled: 0 },
  );

  const weekCompletionRate = weekStats.scheduled > 0
    ? Math.round((weekStats.completed / weekStats.scheduled) * 100)
    : 0;

  return (
    <div className="sticky top-24 space-y-4">
      {/* This Week */}
      <div className="rounded-2xl bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">This Week</h3>
          <TrendingUp className="w-4 h-4 text-primary" strokeWidth={2} />
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold text-foreground">{weekStats.completed}</span>
              <span className="text-xs text-muted-foreground">{weekCompletionRate}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${weekCompletionRate}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">completions this week</p>
        </div>
      </div>

      {/* Longest Streak */}
      <div className="rounded-2xl bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Best Streak</h3>
          <Flame className="w-4 h-4 text-orange-500" strokeWidth={2} />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">{longestStreak}</span>
          <span className="text-sm text-muted-foreground">days</span>
        </div>
        <p className="text-xs text-muted-foreground mt-3">Highest consecutive days</p>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl bg-card border border-border p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">Your Habits</h3>
        <div className="space-y-2">
          {habits.slice(0, 5).map((habit) => {
            const entries = habit.entries;
            const today = formatLocalDate();
            const isCompletedToday = entries.some(e => e.date === today && e.completed);
            const isScheduledToday = isScheduledDate(habit, today);
            
            return (
              <div key={habit.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  />
                  <span className="text-sm font-medium text-foreground line-clamp-1">{habit.name}</span>
                </div>
                {isCompletedToday && (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">✓</span>
                )}
                {!isCompletedToday && isScheduledToday && (
                  <span className="text-xs font-medium text-muted-foreground">Due</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
