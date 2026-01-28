'use server'

import { revalidatePath } from 'next/cache'

import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/admin'
import { getUser } from '@/lib/auth'

export async function toggleUserStatus(formData: FormData) {
  const user = await getUser()
  if (!isAdminUser(user?.id)) {
    throw new Error('Unauthorized')
  }

  const userId = String(formData.get('userId') || '')
  const disabled = String(formData.get('disabled') || 'false') === 'true'

  if (!userId) return

  const admin = createAdminClient()
  const banDuration = disabled ? 'none' : '87600h'
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: banDuration,
  })

  if (error) {
    throw error
  }

  revalidatePath('/admin')
}

export async function deleteHabitAdmin(formData: FormData) {
  const user = await getUser()
  if (!isAdminUser(user?.id)) {
    throw new Error('Unauthorized')
  }

  const habitId = String(formData.get('habitId') || '')
  if (!habitId) return

  const admin = createAdminClient()
  const { error } = await admin.from('habits').delete().eq('id', habitId)
  if (error) {
    throw error
  }

  revalidatePath('/admin')
}
