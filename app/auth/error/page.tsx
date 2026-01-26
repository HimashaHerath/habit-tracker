import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function AuthError() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 bg-destructive/10 rounded-full">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">Authentication Error</h1>
        <p className="text-muted-foreground mb-8">
          Something went wrong during authentication. Please try again.
        </p>

        <Link href="/auth/login">
          <Button className="gap-2 w-full bg-primary hover:bg-primary/90">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Button>
        </Link>
      </div>
    </div>
  )
}
