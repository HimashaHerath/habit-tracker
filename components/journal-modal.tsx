'use client';

import { useState, useMemo } from 'react';
import { Habit, addEntry } from '@/lib/habitStorage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface JournalModalProps {
  habit: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function JournalModal({
  habit,
  open,
  onOpenChange,
  onUpdate,
}: JournalModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [completed, setCompleted] = useState(false);

  const currentEntry = useMemo(
    () => habit.entries.find(e => e.date === selectedDate),
    [habit.entries, selectedDate]
  );

  // Update form when selected date changes
  useMemo(() => {
    if (currentEntry) {
      setNotes(currentEntry.notes || '');
      setCompleted(currentEntry.completed);
    } else {
      setNotes('');
      setCompleted(false);
    }
  }, [currentEntry]);

  const handleSave = () => {
    addEntry(habit.id, {
      date: selectedDate,
      completed,
      notes: notes.trim(),
    });
    onUpdate();
  };

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const recentEntries = habit.entries
    .filter(e => e.notes && e.notes.trim())
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  const dateObj = new Date(selectedDate);
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

            {/* Recent Entries */}
            {recentEntries.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground">
                  Recent Journal Entries
                </h4>
                <div className="space-y-2">
                  {recentEntries.map((entry) => (
                    <Card
                      key={entry.date}
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow bg-card/50"
                      onClick={() => setSelectedDate(entry.date)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {new Date(entry.date).toLocaleDateString('default', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                          {entry.completed && (
                            <Badge
                              className="mt-1"
                              style={{ backgroundColor: habit.color + '20', color: habit.color }}
                            >
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {entry.notes || 'No notes'}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
