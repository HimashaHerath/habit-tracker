'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 border border-border text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 bg-primary/10 rounded-full">
            <Mail className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
        <p className="text-muted-foreground mb-8">
          We've sent a confirmation link to your email address. Click the link to verify your account and get started.
        </p>

        <div className="p-4 rounded-lg bg-secondary/30 border border-border mb-8">
          <p className="text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or sign up again.
          </p>
        </div>

        <Link href="/auth/login">
          <Button className="w-full gap-2 bg-primary hover:bg-primary/90" size="lg">
            Back to Sign In
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </Card>
    </div>
  );
}
