'use client';

import { useState } from 'react';
import type { HabitEntry, HabitWithEntries } from '@/lib/supabase/habits';
import { addHabitEntry } from '@/lib/supabase/habits';
import {
  calculateCompletionRate,
  calculateCurrentStreak,
  calculateLongestStreak,
  getCompletionStats,
  isScheduledDate,
} from '@/lib/habit-metrics';
import { formatLocalDate } from '@/lib/date';
import { Button } from '@/components/ui/button';
import { CalendarHeatmap } from './calendar-heatmap';
import { EditHabitModal } from './edit-habit-modal';
import { JournalModal } from './journal-modal';
import { Flame, Calendar, BookOpen, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HabitCardProps {
  habit: HabitWithEntries;
  onEntriesChange: (habitId: string, entries: HabitEntry[]) => void;
  onDelete: (habit: HabitWithEntries) => void;
  onHabitUpdated: (habit: HabitWithEntries) => void;
}


export function HabitCard({ habit, onEntriesChange, onDelete, onHabitUpdated }: HabitCardProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [entryError, setEntryError] = useState('');

  const entries = habit.entries;

  const currentStreak = calculateCurrentStreak(habit, entries);
  const longestStreak = calculateLongestStreak(habit, entries);
  const completionRate = calculateCompletionRate(habit, entries);
  const today = formatLocalDate();
  const isCompletedToday = entries.some(e => e.date === today && e.completed);
  const isScheduledToday = isScheduledDate(habit, today);
  const { completed: completedThisMonth, scheduled: scheduledThisMonth } =
    getCompletionStats(habit, entries, 30);

  const updateEntries = (entry: HabitEntry) => {
    const nextEntries = [
      ...entries.filter((existing) => existing.date !== entry.date),
      entry,
    ].sort((a, b) => b.date.localeCompare(a.date));
    onEntriesChange(habit.id, nextEntries);
  };

  const handleSaveEntry = async (
    date: string,
    completed: boolean,
    notes?: string | null,
  ) => {
    try {
      setCheckingIn(true);
      setEntryError('');
      const entry = await addHabitEntry(
        habit.id,
        date,
        completed,
        notes ?? null,
      );
      updateEntries(entry);
    } catch (error) {
      console.error('[habit-tracker] Error checking in:', error);
      setEntryError('Failed to save check-in. Please try again.');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckIn = async () => {
    if (!isScheduledToday) return;
    const existing = entries.find((entry) => entry.date === today);
    await handleSaveEntry(today, true, existing?.notes ?? null);
  };

  const handleUndoCheckIn = async () => {
    if (!isScheduledToday) return;
    const existing = entries.find((entry) => entry.date === today);
    await handleSaveEntry(today, false, existing?.notes ?? null);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this habit? This cannot be undone.')) return;
    onDelete(habit);
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
              <DropdownMenuItem onClick={() => setShowEdit(true)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                Delete
              </DropdownMenuItem>
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
              <span className="text-2xl font-bold text-foreground">{currentStreak}</span>
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
              <span className="text-xs text-muted-foreground">{completedThisMonth}/{scheduledThisMonth}</span>
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
            <Button
              onClick={handleUndoCheckIn}
              disabled={checkingIn}
              size="sm"
              variant="outline"
              className="flex-1 h-9 text-xs font-medium"
            >
              <Flame className="w-4 h-4 mr-1.5" />
              {checkingIn ? 'Saving...' : 'Undo'}
            </Button>
          ) : (
            <Button
              onClick={handleCheckIn}
              disabled={checkingIn || !isScheduledToday}
              size="sm"
              className="flex-1 h-9 text-xs font-medium bg-primary hover:bg-primary/90"
            >
              <Flame className="w-4 h-4 mr-1.5" />
              {checkingIn ? 'Saving...' : isScheduledToday ? 'Check In' : 'Not Scheduled'}
            </Button>
          )}
        </div>
        {!isScheduledToday && (
          <p className="mt-3 text-xs text-muted-foreground">
            This habit isn’t scheduled for today.
          </p>
        )}
        {entryError && (
          <p className="mt-3 text-xs text-destructive">{entryError}</p>
        )}
      </div>

      {/* Modals */}
      <CalendarHeatmap
        habit={habit}
        entries={entries}
        open={showCalendar}
        onOpenChange={setShowCalendar}
        onSaveEntry={handleSaveEntry}
      />
      <EditHabitModal
        habit={habit}
        open={showEdit}
        onOpenChange={setShowEdit}
        onHabitUpdated={(updatedHabit) =>
          onHabitUpdated({ ...updatedHabit, entries })
        }
      />
      <JournalModal
        habit={habit}
        entries={entries}
        open={showJournal}
        onOpenChange={setShowJournal}
        onSaveEntry={handleSaveEntry}
      />
    </>
  );
}
