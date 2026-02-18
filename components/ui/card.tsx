import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
  glow?: 'cyan' | 'violet' | false
}

function Card({ children, hover, glow, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/50 bg-surface/50 p-6 backdrop-blur-xl',
        hover && 'transition-all duration-300 hover:border-cr0n-cyan/30 hover:shadow-lg hover:shadow-cyan-500/5',
        glow === 'cyan' && 'glow-cyan',
        glow === 'violet' && 'glow-violet',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

function CardTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold text-white', className)} {...props}>
      {children}
    </h3>
  )
}

function CardDescription({ children, className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-subtle', className)} {...props}>
      {children}
    </p>
  )
}

function CardContent({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  )
}

function CardFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-4 flex items-center gap-3', className)} {...props}>
      {children}
    </div>
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
