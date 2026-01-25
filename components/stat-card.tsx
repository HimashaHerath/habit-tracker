'use client';

import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: string;
  deltaType?: 'positive' | 'negative';
}

export function StatCard({ label, value, icon: Icon, delta, deltaType }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">
          {value}
        </span>
        {delta && (
          <span className={`text-xs font-medium ${
            deltaType === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'
          }`}>
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
