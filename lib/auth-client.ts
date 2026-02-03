'use client'

import { createClient } from './supabase/client'
import { getSiteUrl } from './site-url'

export async function signUp(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

export async function requestPasswordReset(email: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/reset-password`,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    throw new Error(error.message)
  }
}
