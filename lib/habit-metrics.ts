import type { Habit, HabitEntry } from './supabase/habits'
import { addDays, formatLocalDate, getDayOfWeek } from './date'

const DEFAULT_DAYS = [0, 1, 2, 3, 4, 5, 6]
const WEEKDAYS = [1, 2, 3, 4, 5]

export function getScheduledDays(habit: Habit): number[] {
  if (habit.frequency === 'custom') {
    return habit.days_of_week?.length ? habit.days_of_week : DEFAULT_DAYS
  }
  if (habit.frequency === 'weekdays') {
    return WEEKDAYS
  }
  return habit.days_of_week?.length ? habit.days_of_week : DEFAULT_DAYS
}

export function isScheduledDate(habit: Habit, dateStr: string): boolean {
  const day = getDayOfWeek(dateStr)
  return getScheduledDays(habit).includes(day)
}

export function mapEntries(entries: HabitEntry[]): Map<string, HabitEntry> {
  return new Map(entries.map((entry) => [entry.date, entry]))
}

export function calculateCurrentStreak(
  habit: Habit,
  entries: HabitEntry[],
  maxDays = 365,
): number {
  if (!entries.length) return 0
  const entriesByDate = mapEntries(entries)
  const today = formatLocalDate()
  let streak = 0

  for (let i = 0; i < maxDays; i++) {
    const dateStr = addDays(today, -i)
    if (!isScheduledDate(habit, dateStr)) continue
    const entry = entriesByDate.get(dateStr)
    if (entry?.completed) {
      streak++
    } else {
      break
    }
  }

  return streak
}

export function calculateLongestStreak(
  habit: Habit,
  entries: HabitEntry[],
  maxDays = 365,
): number {
  if (!entries.length) return 0
  const entriesByDate = mapEntries(entries)
  const today = formatLocalDate()
  let longest = 0
  let current = 0

  for (let i = 0; i < maxDays; i++) {
    const dateStr = addDays(today, -i)
    if (!isScheduledDate(habit, dateStr)) continue
    const entry = entriesByDate.get(dateStr)
    if (entry?.completed) {
      current++
      longest = Math.max(longest, current)
    } else {
      current = 0
    }
  }

  return longest
}

export function calculateCompletionRate(
  habit: Habit,
  entries: HabitEntry[],
  windowDays = 30,
): number {
  const { completed, scheduled } = getCompletionStats(
    habit,
    entries,
    windowDays,
  )
  if (!scheduled) return 0
  return (completed / scheduled) * 100
}

export function getCompletionStats(
  habit: Habit,
  entries: HabitEntry[],
  windowDays = 30,
): { completed: number; scheduled: number } {
  const entriesByDate = mapEntries(entries)
  const today = formatLocalDate()
  let completed = 0
  let scheduled = 0

  for (let i = 0; i < windowDays; i++) {
    const dateStr = addDays(today, -i)
    if (!isScheduledDate(habit, dateStr)) continue
    scheduled++
    if (entriesByDate.get(dateStr)?.completed) {
      completed++
    }
  }

  return { completed, scheduled }
}

export function getRecentScheduledDates(
  habit: Habit,
  count: number,
  startDate = formatLocalDate(),
): string[] {
  const dates: string[] = []
  let offset = 0

  while (dates.length < count && offset < 366) {
    const dateStr = addDays(startDate, -offset)
    if (isScheduledDate(habit, dateStr)) {
      dates.push(dateStr)
    }
    offset++
  }

  return dates
}
