import { Suspense } from 'react'
import ResetPasswordClient from './reset-password-client'

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Loading reset form...
          </div>
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  )
}
