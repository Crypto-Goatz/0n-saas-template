import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose' | 'gray'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: ReactNode
}

const badgeVariants: Record<BadgeVariant, string> = {
  cyan: 'bg-cr0n-cyan/20 text-cr0n-cyan border-cr0n-cyan/30',
  violet: 'bg-cr0n-violet/20 text-cr0n-violet border-cr0n-violet/30',
  emerald: 'bg-cr0n-success/20 text-cr0n-success border-cr0n-success/30',
  amber: 'bg-cr0n-warning/20 text-cr0n-warning border-cr0n-warning/30',
  rose: 'bg-cr0n-danger/20 text-cr0n-danger border-cr0n-danger/30',
  gray: 'bg-muted/50 text-subtle border-border/50',
}

function Badge({ variant = 'cyan', children, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { Badge, type BadgeProps, type BadgeVariant }
