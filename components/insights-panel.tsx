'use client';

import { Habit } from '@/lib/habitStorage';
import { Target, Flame, TrendingUp } from 'lucide-react';

interface InsightsPanelProps {
  habits: Habit[];
}

export function InsightsPanel({ habits }: InsightsPanelProps) {
  const longestStreak = habits.length === 0 ? 0 : Math.max(...habits.map(h => {
    if (!h.entries || h.entries.length === 0) return 0;
    
    let streak = 0;
    let maxStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const entry = h.entries.find(e => e.date === dateStr);
      if (entry && entry.completed) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 0;
      }
    }
    return maxStreak;
  }));

  const thisWeekCompletions = habits.reduce((sum, h) => {
    const today = new Date();
    let weekCount = 0;
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (h.entries.some(e => e.date === dateStr && e.completed)) {
        weekCount++;
      }
    }
    return sum + weekCount;
  }, 0);

  const maxWeekPossible = habits.length * 7;
  const weekCompletionRate = maxWeekPossible > 0 ? Math.round((thisWeekCompletions / maxWeekPossible) * 100) : 0;

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
              <span className="text-2xl font-bold text-foreground">{thisWeekCompletions}</span>
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
            const today = new Date().toISOString().split('T')[0];
            const isCompletedToday = habit.entries.some(e => e.date === today && e.completed);
            
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
