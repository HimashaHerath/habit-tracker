'use client';

import { useState } from 'react';
import { Habit, getDaysSince, getCurrentStreak, getLongestStreak, getCompletionRate } from '@/lib/habitStorage';
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
  habit: Habit;
  onUpdate: () => void;
}

export function HabitCard({ habit, onUpdate }: HabitCardProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showJournal, setShowJournal] = useState(false);

  const daysSince = getDaysSince(habit);
  const currentStreak = getCurrentStreak(habit);
  const longestStreak = getLongestStreak(habit);
  const completionRate = getCompletionRate(habit);
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.entries.some(e => e.date === today && e.completed);

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
              onClick={() => {
                const { addEntry } = require('@/lib/habitStorage');
                addEntry(habit.id, { date: today, completed: true });
                onUpdate();
              }}
              size="sm"
              className="flex-1 h-9 text-xs font-medium bg-primary hover:bg-primary/90"
            >
              <Flame className="w-4 h-4 mr-1.5" />
              Check In
            </Button>
          )}
        </div>
      </div>

      {/* Modals */}
      <CalendarHeatmap
        habit={habit}
        open={showCalendar}
        onOpenChange={setShowCalendar}
        onUpdate={onUpdate}
      />
      <JournalModal
        habit={habit}
        open={showJournal}
        onOpenChange={setShowJournal}
        onUpdate={onUpdate}
      />
    </>
  );
}
