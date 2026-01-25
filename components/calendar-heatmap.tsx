'use client';

import { useState } from 'react';
import { Habit, addEntry, getMonthlyData } from '@/lib/habitStorage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

interface CalendarHeatmapProps {
  habit: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function CalendarHeatmap({
  habit,
  open,
  onOpenChange,
  onUpdate,
}: CalendarHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthData = getMonthlyData(habit, currentMonth);
  const weeks: typeof monthData[][] = [];
  let currentWeek: typeof monthData[] = [];

  // Group data by weeks
  monthData.forEach((day, index) => {
    const dayOfWeek = new Date(day.date).getDay();

    if (currentWeek.length === 0 && dayOfWeek !== 0) {
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push({ date: '', completed: false });
      }
    }

    currentWeek.push(day);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const handleDayClick = (date: string) => {
    if (!date) return;

    const entry = habit.entries.find(e => e.date === date);
    addEntry(habit.id, {
      date,
      completed: !entry?.completed,
      notes: entry?.notes,
    });

    onUpdate();
  };

  const monthStr = currentMonth.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const getBackgroundColor = (completed: boolean) => {
    if (!completed) return 'bg-muted';
    return 'opacity-100';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{habit.name} Calendar</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                )
              }
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-xl font-semibold text-foreground">{monthStr}</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                )
              }
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="grid grid-cols-7 gap-2">
                {week.map((day, dayIdx) => (
                  <button
                    key={`${weekIdx}-${dayIdx}`}
                    onClick={() => handleDayClick(day.date)}
                    disabled={!day.date}
                    className={`
                      aspect-square rounded-lg font-semibold text-sm
                      transition-all duration-200 flex items-center justify-center
                      relative group
                      ${
                        !day.date
                          ? 'invisible'
                          : day.completed
                            ? 'text-primary-foreground shadow-md hover:shadow-lg'
                            : 'bg-muted text-foreground hover:bg-muted/80'
                      }
                    `}
                    style={
                      day.completed
                        ? { backgroundColor: habit.color }
                        : undefined
                    }
                  >
                    {day.completed && <Check className="w-5 h-5" />}
                    {day.date && !day.completed && (
                      <span className="text-xs opacity-60">
                        {new Date(day.date).getDate()}
                      </span>
                    )}
                    {day.date && day.completed && (
                      <span className="text-xs opacity-70">
                        {new Date(day.date).getDate()}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: habit.color }}
              />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted" />
              <span className="text-sm text-muted-foreground">Not completed</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
