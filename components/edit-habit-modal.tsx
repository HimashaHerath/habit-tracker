'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { updateHabit, type Habit } from '@/lib/supabase/habits';

const COLORS_PALETTE = [
  '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#EC4899', '#06B6D4', '#6366F1',
];

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface EditHabitModalProps {
  habit: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHabitUpdated: (habit: Habit) => void;
}

export function EditHabitModal({
  habit,
  open,
  onOpenChange,
  onHabitUpdated,
}: EditHabitModalProps) {
  const [type, setType] = useState<'avoid' | 'build'>(habit.type);
  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description ?? '');
  const [category, setCategory] = useState(habit.category);
  const [selectedColor, setSelectedColor] = useState(habit.color);
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'custom'>(
    habit.frequency ?? 'daily',
  );
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(() => {
    if (habit.days_of_week?.length) return habit.days_of_week;
    return habit.frequency === 'weekdays'
      ? [1, 2, 3, 4, 5]
      : [0, 1, 2, 3, 4, 5, 6];
  });
  const [reminderEnabled, setReminderEnabled] = useState(
    habit.reminder_enabled ?? false,
  );
  const [reminderTime, setReminderTime] = useState(
    habit.reminder_time ?? '08:00',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const applyFrequency = (value: 'daily' | 'weekdays' | 'custom') => {
    setFrequency(value);
    if (value === 'daily') {
      setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
    }
    if (value === 'weekdays') {
      setDaysOfWeek([1, 2, 3, 4, 5]);
    }
  };

  useEffect(() => {
    if (!open) return;
    setType(habit.type);
    setName(habit.name);
    setDescription(habit.description ?? '');
    setCategory(habit.category);
    setSelectedColor(habit.color);
    setFrequency(habit.frequency ?? 'daily');
    if (habit.days_of_week?.length) {
      setDaysOfWeek(habit.days_of_week);
    } else if (habit.frequency === 'weekdays') {
      setDaysOfWeek([1, 2, 3, 4, 5]);
    } else {
      setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
    }
    setReminderEnabled(habit.reminder_enabled ?? false);
    setReminderTime(habit.reminder_time ?? '08:00');
    setError('');
  }, [habit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a habit name');
      return;
    }

    if (frequency === 'custom' && daysOfWeek.length === 0) {
      setError('Please select at least one day for your schedule');
      return;
    }

    setIsLoading(true);

    try {
      const updatedHabit = await updateHabit(habit.id, {
        name,
        description,
        type,
        category,
        color: selectedColor,
        frequency,
        days_of_week: daysOfWeek,
        reminder_enabled: reminderEnabled,
        reminder_time: reminderEnabled ? reminderTime : null,
      });

      onHabitUpdated(updatedHabit);
      onOpenChange(false);
    } catch (err) {
      console.error('[v0] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update habit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Habit</DialogTitle>
            <DialogDescription>
              Update the details of your habit
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[calc(90vh-110px)]">
          <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6">
          {/* Habit Type */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Habit Type</Label>
            <RadioGroup value={type} onValueChange={(v) => setType(v as 'avoid' | 'build')}>
              <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:bg-secondary/30 cursor-pointer">
                <RadioGroupItem value="avoid" id={`edit-avoid-${habit.id}`} />
                <Label htmlFor={`edit-avoid-${habit.id}`} className="flex-1 cursor-pointer">
                  <div className="font-semibold">Quit/Avoid</div>
                  <div className="text-sm text-muted-foreground">
                    Track days since stopping (e.g., smoking, drinking)
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:bg-secondary/30 cursor-pointer">
                <RadioGroupItem value="build" id={`edit-build-${habit.id}`} />
                <Label htmlFor={`edit-build-${habit.id}`} className="flex-1 cursor-pointer">
                  <div className="font-semibold">Build/Maintain</div>
                  <div className="text-sm text-muted-foreground">
                    Track consistent streaks (e.g., gym, meditation)
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Habit Name */}
          <div className="space-y-2">
            <Label htmlFor={`edit-name-${habit.id}`} className="font-semibold">
              Habit Name
            </Label>
            <Input
              id={`edit-name-${habit.id}`}
              placeholder="e.g., No Smoking, Daily Gym"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor={`edit-description-${habit.id}`} className="font-semibold">
              Description
            </Label>
            <Textarea
              id={`edit-description-${habit.id}`}
              placeholder="Add a description for this habit..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor={`edit-category-${habit.id}`} className="font-semibold">
              Category
            </Label>
            <div className="flex gap-2 flex-wrap">
              {['Health', 'Fitness', 'Mental', 'Productivity', 'Personal'].map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  variant={category === cat ? 'default' : 'outline'}
                  onClick={() => setCategory(cat)}
                  className="rounded-full"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-3">
            <Label className="font-semibold">Schedule</Label>
            <RadioGroup value={frequency} onValueChange={(v) => applyFrequency(v as 'daily' | 'weekdays' | 'custom')}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-secondary/30 cursor-pointer">
                <RadioGroupItem value="daily" id={`edit-freq-daily-${habit.id}`} />
                <Label htmlFor={`edit-freq-daily-${habit.id}`} className="flex-1 cursor-pointer">
                  <div className="font-semibold">Every day</div>
                  <div className="text-sm text-muted-foreground">Daily check-in</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-secondary/30 cursor-pointer">
                <RadioGroupItem value="weekdays" id={`edit-freq-weekdays-${habit.id}`} />
                <Label htmlFor={`edit-freq-weekdays-${habit.id}`} className="flex-1 cursor-pointer">
                  <div className="font-semibold">Weekdays</div>
                  <div className="text-sm text-muted-foreground">Monday to Friday</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-secondary/30 cursor-pointer">
                <RadioGroupItem value="custom" id={`edit-freq-custom-${habit.id}`} />
                <Label htmlFor={`edit-freq-custom-${habit.id}`} className="flex-1 cursor-pointer">
                  <div className="font-semibold">Custom</div>
                  <div className="text-sm text-muted-foreground">Pick specific days</div>
                </Label>
              </div>
            </RadioGroup>

            {frequency === 'custom' && (
              <div className="flex flex-wrap gap-2">
                {WEEK_DAYS.map((day, index) => {
                  const active = daysOfWeek.includes(index);
                  return (
                    <Button
                      key={day}
                      type="button"
                      variant={active ? 'default' : 'outline'}
                      onClick={() => {
                        setDaysOfWeek((prev) =>
                          prev.includes(index)
                            ? prev.filter((value) => value !== index)
                            : [...prev, index].sort(),
                        );
                      }}
                      className="rounded-full"
                    >
                      {day}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reminder */}
          <div className="space-y-3">
            <Label className="font-semibold">Reminder</Label>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Daily reminder</p>
                <p className="text-xs text-muted-foreground">Set a time to get a reminder</p>
              </div>
              <Button
                type="button"
                variant={reminderEnabled ? 'default' : 'outline'}
                onClick={() => setReminderEnabled(!reminderEnabled)}
              >
                {reminderEnabled ? 'On' : 'Off'}
              </Button>
            </div>
            <Input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              disabled={!reminderEnabled}
            />
            <p className="text-xs text-muted-foreground">
              Reminders require browser notifications (setup next).
            </p>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <Label className="font-semibold">Color</Label>
            <div className="flex gap-3">
              {COLORS_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`
                    w-10 h-10 rounded-lg transition-all cursor-pointer ring-2 ring-offset-2
                    ${selectedColor === color ? 'ring-foreground scale-110' : 'ring-transparent hover:scale-105'}
                  `}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
