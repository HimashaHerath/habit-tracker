import { createClient } from './client'

export interface Habit {
  id: string
  user_id: string
  name: string
  description: string
  type: 'avoid' | 'build'
  category: string
  color: string
  created_at: string
  updated_at: string
}

export interface HabitEntry {
  id: string
  habit_id: string
  date: string
  completed: boolean
  notes: string | null
  created_at: string
}

export async function getHabits(userId: string): Promise<Habit[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createHabit(
  userId: string,
  habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Habit> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('habits')
    .insert({
      user_id: userId,
      ...habit,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateHabit(
  habitId: string,
  updates: Partial<Omit<Habit, 'id' | 'user_id' | 'created_at'>>
): Promise<Habit> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', habitId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteHabit(habitId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId)

  if (error) throw error
}

export async function getHabitEntries(habitId: string): Promise<HabitEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('habit_entries')
    .select('*')
    .eq('habit_id', habitId)
    .order('date', { ascending: false })

  if (error) throw error
  return data || []
}

export async function addHabitEntry(
  habitId: string,
  date: string,
  completed: boolean,
  notes?: string
): Promise<HabitEntry> {
  const supabase = createClient()
  
  // Check if entry exists
  const { data: existing } = await supabase
    .from('habit_entries')
    .select('id')
    .eq('habit_id', habitId)
    .eq('date', date)
    .single()

  if (existing) {
    // Update existing entry
    const { data, error } = await supabase
      .from('habit_entries')
      .update({ completed, notes })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Create new entry
  const { data, error } = await supabase
    .from('habit_entries')
    .insert({
      habit_id: habitId,
      date,
      completed,
      notes,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteHabitEntry(entryId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('habit_entries')
    .delete()
    .eq('id', entryId)

  if (error) throw error
}
