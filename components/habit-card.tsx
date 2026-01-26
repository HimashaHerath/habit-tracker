'use client';

import { useState, useEffect } from 'react';
import type { Habit as SupabaseHabit, HabitEntry } from '@/lib/supabase/habits';
import { getHabitEntries, addHabitEntry } from '@/lib/supabase/habits';
import { Button } from '@/components/ui/button';
import { CalendarHeatmap } from './calendar-heatmap';
import { JournalModal } from './journal-modal';
import { Flame, Calendar, BookOpen, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HabitCardProps {
  habit: SupabaseHabit;
  onUpdate: () => void;
}

function calculateDaysSince(entries: HabitEntry[]): number {
  if (!entries.length) return 0;
  
  const today = new Date();
  let daysSince = 0;
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const entry = entries.find(e => e.date === dateStr);
    if (!entry || !entry.completed) {
      daysSince = i;
      break;
    }
  }
  
  return daysSince;
}

function calculateCurrentStreak(entries: HabitEntry[]): number {
  if (!entries.length) return 0;
  
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const entry = entries.find(e => e.date === dateStr);
    if (entry && entry.completed) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  
  return streak;
}

function calculateLongestStreak(entries: HabitEntry[]): number {
  if (!entries.length) return 0;
  
  let maxStreak = 0;
  let currentStreak = 0;
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let expectedDate = new Date();
  
  for (const entry of sortedEntries) {
    if (entry.completed) {
      const entryDate = new Date(entry.date);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];
      const entryDateStr = entryDate.toISOString().split('T')[0];
      
      if (entryDateStr === expectedDateStr || expectedDate.getTime() - entryDate.getTime() <= 86400000) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
        expectedDate = new Date(entryDate);
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
  }
  
  return maxStreak;
}

function calculateCompletionRate(entries: HabitEntry[]): number {
  if (!entries.length) return 0;
  const completed = entries.filter(e => e.completed).length;
  return (completed / Math.min(entries.length, 30)) * 100;
}

export function HabitCard({ habit, onUpdate }: HabitCardProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    loadEntries();
  }, [habit.id]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await getHabitEntries(habit.id);
      setEntries(data);
    } catch (error) {
      console.error('[v0] Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const daysSince = calculateDaysSince(entries);
  const currentStreak = calculateCurrentStreak(entries);
  const longestStreak = calculateLongestStreak(entries);
  const completionRate = calculateCompletionRate(entries);
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = entries.some(e => e.date === today && e.completed);

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      await addHabitEntry(habit.id, today, true);
      await loadEntries();
      onUpdate();
    } catch (error) {
      console.error('[v0] Error checking in:', error);
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl bg-card border border-border hover:border-border/80 p-6 transition-all hover:shadow-sm">
        {/* Top Accent Bar + Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Color indicator and basic info */}
            <div
              className="w-1 h-12 rounded-full flex-shrink-0"
              style={{ backgroundColor: habit.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-lg font-semibold text-foreground truncate">{habit.name}</h3>
                <span className="inline-block px-2 py-1 text-xs font-medium bg-secondary text-muted-foreground rounded-full flex-shrink-0">
                  {habit.type === 'avoid' ? 'Quit' : 'Build'}
                </span>
              </div>
              {habit.description && (
                <p className="text-sm text-muted-foreground truncate">{habit.description}</p>
              )}
            </div>
          </div>

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Archive</DropdownMenuItem>
              <DropdownMenuItem>Pause</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {/* Current Streak / Days Since */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
              {habit.type === 'avoid' ? 'Days Since' : 'Streak'}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">{habit.type === 'avoid' ? daysSince : currentStreak}</span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
          </div>

          {/* Best */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Best</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">{longestStreak}</span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
          </div>

          {/* Completion % */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Rate</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">{completionRate.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-5">
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${completionRate}%`,
                backgroundColor: habit.color,
              }}
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowCalendar(true)}
            variant="ghost"
            size="sm"
            className="flex-1 h-9 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <Calendar className="w-4 h-4 mr-1.5" />
            Calendar
          </Button>
          <Button
            onClick={() => setShowJournal(true)}
            variant="ghost"
            size="sm"
            className="flex-1 h-9 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <BookOpen className="w-4 h-4 mr-1.5" />
            Notes
          </Button>
          {isCompletedToday ? (
            <div className="flex-1 h-9 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              <Flame className="w-4 h-4 mr-1.5" />
              Done
            </div>
          ) : (
            <Button
              onClick={handleCheckIn}
              disabled={checkingIn}
              size="sm"
              className="flex-1 h-9 text-xs font-medium bg-primary hover:bg-primary/90"
            >
              <Flame className="w-4 h-4 mr-1.5" />
              {checkingIn ? 'Saving...' : 'Check In'}
            </Button>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* Calendar and Journal modals will be updated separately */}
    </>
  );
}
