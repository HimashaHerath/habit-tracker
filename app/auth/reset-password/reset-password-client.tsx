'use client'

import { type FormEvent, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { updatePassword } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Lock, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordClient() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const hasExchangedRef = useRef(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const errorDescription = searchParams.get('error_description')

  useEffect(() => {
    const supabase = createClient()

    if (errorDescription) {
      setError(decodeURIComponent(errorDescription))
      setReady(false)
      return
    }

    if (code && !hasExchangedRef.current) {
      hasExchangedRef.current = true
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error) {
          const message =
            error.message.includes('code verifier')
              ? 'Reset link expired or opened in a different browser. Please request a new link from the same device.'
              : error.message
          setError(message)
          setReady(false)
          return
        }
        setReady(!!data.session)
        if (data.session) {
          router.replace('/auth/reset-password')
        }
      })
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session)
    })
  }, [code, errorDescription, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await updatePassword(password)
      router.push('/auth/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 border border-border">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="p-2 bg-primary rounded-lg">
            <Lock className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Set New Password</h1>
        </div>

        {!ready ? (
          error ? (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
              {error}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-secondary/30 text-sm text-muted-foreground text-center">
              Open this page from the password reset email to continue.
            </div>
          )
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                New Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 bg-primary hover:bg-primary/90"
              size="lg"
            >
              {loading ? 'Updating...' : 'Update password'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Back to{' '}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:text-primary/90 transition-colors"
            >
              sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
