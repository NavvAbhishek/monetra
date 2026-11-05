import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Loading placeholder. Size it with layout utilities (h-*, w-*, rounded-*). */
export const Skeleton = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="skeleton"
    aria-hidden
    className={cn('animate-pulse rounded-control bg-muted', className)}
    {...props}
  />
)
