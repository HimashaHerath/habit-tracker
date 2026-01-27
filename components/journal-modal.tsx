'use client';

import { useEffect, useState, useMemo } from 'react';
import type { HabitEntry, HabitWithEntries } from '@/lib/supabase/habits';
import { formatLocalDate, parseLocalDate } from '@/lib/date';
import { getRecentScheduledDates } from '@/lib/habit-metrics';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface JournalModalProps {
  habit: HabitWithEntries;
  entries: HabitEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveEntry: (
    date: string,
    completed: boolean,
    notes?: string | null,
  ) => Promise<void> | void;
}

export function JournalModal({
  habit,
  entries,
  open,
  onOpenChange,
  onSaveEntry,
}: JournalModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    formatLocalDate()
  );
  const [notes, setNotes] = useState<string>('');
  const [completed, setCompleted] = useState(false);
  const [historyCount, setHistoryCount] = useState(14);

  const currentEntry = useMemo(
    () => entries.find(e => e.date === selectedDate),
    [entries, selectedDate]
  );

  // Update form when selected date changes
  useEffect(() => {
    if (currentEntry) {
      setNotes(currentEntry.notes || '');
      setCompleted(currentEntry.completed);
    } else {
      setNotes('');
      setCompleted(false);
    }
  }, [currentEntry]);

  useEffect(() => {
    if (open) {
      setSelectedDate(formatLocalDate());
      setHistoryCount(14);
    }
  }, [open, habit.id]);

  const handleSave = () => {
    void onSaveEntry(selectedDate, completed, notes.trim() || null);
  };

  const handleDateChange = (days: number) => {
    const newDate = parseLocalDate(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(formatLocalDate(newDate));
  };

  const historyDates = useMemo(
    () => getRecentScheduledDates(habit, historyCount),
    [habit, historyCount],
  );
  const historyItems = historyDates.map((date) => {
    const entry = entries.find((item) => item.date === date);
    return {
      date,
      completed: entry?.completed ?? false,
      notes: entry?.notes ?? '',
    };
  });
  const today = formatLocalDate();

  const dateObj = parseLocalDate(selectedDate);
  const dateStr = dateObj.toLocaleDateString('default', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{habit.name} Journal</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Date Selector */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                Select Date
              </label>
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateChange(-1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div
                  className="flex-1 p-3 rounded-lg text-center border border-border cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'date';
                    input.value = selectedDate;
                    input.onchange = (e: any) => setSelectedDate(e.target.value);
                    input.click();
                  }}
                >
                  <div className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="font-semibold text-foreground">{dateStr}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateChange(1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Completed Toggle */}
            <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Mark as {habit.type === 'avoid' ? 'successful' : 'completed'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {completed
                    ? 'Marked as successful'
                    : 'Not marked for this date'}
                </p>
              </div>
              <Button
                onClick={() => setCompleted(!completed)}
                className="gap-2"
                variant={completed ? 'default' : 'outline'}
                style={
                  completed ? { backgroundColor: habit.color } : undefined
                }
              >
                {completed ? '✓ Done' : 'Mark'}
              </Button>
            </div>

            {/* Notes Section */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                Notes & Reflections
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={`Write your thoughts, feelings, or reflections for ${habit.type === 'avoid' ? 'staying strong' : 'this workout'}...`}
                className="min-h-[150px] resize-none"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {notes.length} characters
                </span>
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                  Save Entry
                </Button>
              </div>
            </div>

            {/* Recent Check-ins */}
            <div className="space-y-3 pt-6 border-t border-border">
              <h4 className="text-sm font-semibold text-foreground">
                Recent Check-ins
              </h4>
              <div className="space-y-2">
                {historyItems.length === 0 && (
                  <p className="text-sm text-muted-foreground">No check-ins yet.</p>
                )}
                {historyItems.map((entry) => (
                  <Card
                    key={entry.date}
                    className="p-4 cursor-pointer hover:shadow-md transition-shadow bg-card/50"
                    onClick={() => setSelectedDate(entry.date)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {parseLocalDate(entry.date).toLocaleDateString('default', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <Badge
                          className="mt-1"
                          style={{
                            backgroundColor: entry.completed
                              ? habit.color + '20'
                              : 'transparent',
                            color: entry.completed ? habit.color : 'var(--muted-foreground)',
                            borderColor: entry.completed ? 'transparent' : 'var(--border)',
                          }}
                          variant={entry.completed ? 'default' : 'outline'}
                        >
                          {entry.completed ? 'Completed' : entry.date === today ? 'Pending' : 'Missed'}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {entry.notes || 'No notes'}
                    </p>
                  </Card>
                ))}
              </div>
              {historyItems.length >= historyCount && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setHistoryCount((prev) => prev + 14)}
                >
                  Load more
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
