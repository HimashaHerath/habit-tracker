'use client';

import React from "react"

import { useState } from 'react';
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
import { createHabit, type Habit } from '@/lib/supabase/habits';

const COLORS_PALETTE = [
  '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#EC4899', '#06B6D4', '#6366F1',
];

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface AddHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHabitAdded: (habit: Habit) => void;
  userId: string;
  initialValues?: {
    name?: string;
    description?: string;
    type?: 'avoid' | 'build';
    category?: string;
    color?: string;
    frequency?: 'daily' | 'weekdays' | 'custom';
    days_of_week?: number[];
    reminder_enabled?: boolean;
    reminder_time?: string;
  } | null;
}

export function AddHabitModal({
  open,
  onOpenChange,
  onHabitAdded,
  userId,
  initialValues,
}: AddHabitModalProps) {
  const [type, setType] = useState<'avoid' | 'build'>('avoid');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Health');
  const [selectedColor, setSelectedColor] = useState(COLORS_PALETTE[0]);
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'custom'>('daily');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!open) return;
    if (!initialValues) {
      setType('avoid');
      setName('');
      setDescription('');
      setCategory('Health');
      setSelectedColor(COLORS_PALETTE[0]);
      setFrequency('daily');
      setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
      setReminderEnabled(false);
      setReminderTime('08:00');
      setError('');
      return;
    }

    setType(initialValues.type ?? 'avoid');
    setName(initialValues.name ?? '');
    setDescription(initialValues.description ?? '');
    setCategory(initialValues.category ?? 'Health');
    setSelectedColor(initialValues.color ?? COLORS_PALETTE[0]);
    const fallbackDays =
      initialValues.frequency === 'weekdays' ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6];
    setFrequency(initialValues.frequency ?? 'daily');
    setDaysOfWeek(initialValues.days_of_week ?? fallbackDays);
    setReminderEnabled(initialValues.reminder_enabled ?? false);
    setReminderTime(initialValues.reminder_time ?? '08:00');
    setError('');
  }, [initialValues, open]);

  const applyFrequency = (value: 'daily' | 'weekdays' | 'custom') => {
    setFrequency(value);
    if (value === 'daily') {
      setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
    }
    if (value === 'weekdays') {
      setDaysOfWeek([1, 2, 3, 4, 5]);
    }
  };

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
      const newHabit = await createHabit(userId, {
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
      
      // Reset form
      setName('');
      setDescription('');
      setCategory('Health');
      setType('avoid');
      setSelectedColor(COLORS_PALETTE[0]);
      setFrequency('daily');
      setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
      setReminderEnabled(false);
      setReminderTime('08:00');

      onOpenChange(false);
      onHabitAdded(newHabit);
    } catch (err) {
      console.error('[habit-tracker] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add habit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add New Habit</DialogTitle>
            <DialogDescription>
              Create a new habit to track and monitor your progress
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
                <RadioGroupItem value="avoid" id="avoid" />
                <Label htmlFor="avoid" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Quit/Avoid</div>
                  <div className="text-sm text-muted-foreground">
                    Track days since stopping (e.g., smoking, drinking)
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:bg-secondary/30 cursor-pointer">
                <RadioGroupItem value="build" id="build" />
                <Label htmlFor="build" className="flex-1 cursor-pointer">
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
            <Label htmlFor="name" className="font-semibold">
              Habit Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., No Smoking, Daily Gym"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Add a description for this habit..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="font-semibold">
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
                <RadioGroupItem value="daily" id="freq-daily" />
                <Label htmlFor="freq-daily" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Every day</div>
                  <div className="text-sm text-muted-foreground">Daily check-in</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-secondary/30 cursor-pointer">
                <RadioGroupItem value="weekdays" id="freq-weekdays" />
                <Label htmlFor="freq-weekdays" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Weekdays</div>
                  <div className="text-sm text-muted-foreground">Monday to Friday</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-secondary/30 cursor-pointer">
                <RadioGroupItem value="custom" id="freq-custom" />
                <Label htmlFor="freq-custom" className="flex-1 cursor-pointer">
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
              {isLoading ? 'Creating...' : 'Create Habit'}
            </Button>
          </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
