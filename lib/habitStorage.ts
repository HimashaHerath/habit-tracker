export interface HabitEntry {
  date: string; // YYYY-MM-DD
  completed: boolean;
  notes?: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  type: 'avoid' | 'build'; // avoid: stop smoking/drinking, build: gym consistency
  category: string;
  startDate: string; // YYYY-MM-DD
  color: string;
  entries: HabitEntry[];
  createdAt: string;
}

export interface HabitsData {
  habits: Habit[];
}

const STORAGE_KEY = 'habits-tracker-data';

// Default color palette for habits
const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

export function initializeStorage(): void {
  if (typeof window === 'undefined') return;
  
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const defaultData: HabitsData = {
      habits: [
        {
          id: '1',
          name: 'No Smoking',
          description: 'Stopped smoking',
          type: 'avoid',
          category: 'Health',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          color: COLORS[0],
          entries: generateMockEntries(30),
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'No Drinking',
          description: 'Stopped drinking alcohol',
          type: 'avoid',
          category: 'Health',
          startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          color: COLORS[1],
          entries: generateMockEntries(45),
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Gym Consistency',
          description: 'Workout regularly',
          type: 'build',
          category: 'Fitness',
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          color: COLORS[3],
          entries: generateMockEntries(60, 0.7),
          createdAt: new Date().toISOString(),
        },
      ]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  }
}

function generateMockEntries(days: number, completionRate: number = 1): HabitEntry[] {
  const entries: HabitEntry[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    entries.push({
      date: dateStr,
      completed: Math.random() < completionRate,
      notes: Math.random() < 0.3 ? 'Feeling good today' : undefined,
    });
  }
  
  return entries;
}

export function getHabits(): Habit[] {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    initializeStorage();
    return getHabits();
  }
  
  return (JSON.parse(data) as HabitsData).habits;
}

export function addHabit(habit: Omit<Habit, 'id' | 'entries' | 'createdAt'>): Habit {
  if (typeof window === 'undefined') return habit as Habit;
  
  const habits = getHabits();
  const newHabit: Habit = {
    ...habit,
    id: Date.now().toString(),
    entries: [],
    createdAt: new Date().toISOString(),
  };
  
  habits.push(newHabit);
  const data: HabitsData = { habits };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  
  return newHabit;
}

export function updateHabit(id: string, updates: Partial<Habit>): void {
  if (typeof window === 'undefined') return;
  
  const habits = getHabits();
  const habit = habits.find(h => h.id === id);
  
  if (habit) {
    Object.assign(habit, updates);
    const data: HabitsData = { habits };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

export function deleteHabit(id: string): void {
  if (typeof window === 'undefined') return;
  
  const habits = getHabits().filter(h => h.id !== id);
  const data: HabitsData = { habits };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addEntry(habitId: string, entry: HabitEntry): void {
  if (typeof window === 'undefined') return;
  
  const habits = getHabits();
  const habit = habits.find(h => h.id === habitId);
  
  if (habit) {
    // Remove existing entry for this date if it exists
    habit.entries = habit.entries.filter(e => e.date !== entry.date);
    habit.entries.push(entry);
    habit.entries.sort((a, b) => a.date.localeCompare(b.date));
    
    const data: HabitsData = { habits };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

export function getDaysSince(habit: Habit): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = new Date(habit.startDate);
  startDate.setHours(0, 0, 0, 0);
  
  const timeDiff = today.getTime() - startDate.getTime();
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
}

export function getCurrentStreak(habit: Habit): number {
  if (habit.entries.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const entry = habit.entries.find(e => e.date === dateStr);
    
    if (!entry || !entry.completed) {
      break;
    }
    
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return streak;
}

export function getLongestStreak(habit: Habit): number {
  if (habit.entries.length === 0) return 0;
  
  let longest = 0;
  let current = 0;
  
  habit.entries.forEach(entry => {
    if (entry.completed) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  });
  
  return longest;
}

export function getCompletionRate(habit: Habit): number {
  if (habit.entries.length === 0) return 0;
  
  const completed = habit.entries.filter(e => e.completed).length;
  return (completed / habit.entries.length) * 100;
}

export function getMonthlyData(habit: Habit, month: Date): { date: string; completed: boolean }[] {
  const year = month.getFullYear();
  const monthNum = month.getMonth();
  
  const firstDay = new Date(year, monthNum, 1);
  const lastDay = new Date(year, monthNum + 1, 0);
  
  const data = [];
  for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dateStr = new Date(d).toISOString().split('T')[0];
    const entry = habit.entries.find(e => e.date === dateStr);
    data.push({
      date: dateStr,
      completed: entry?.completed ?? false,
    });
  }
  
  return data;
}

export const COLORS_PALETTE = COLORS;
