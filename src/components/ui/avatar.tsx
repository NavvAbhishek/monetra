import { cva, type VariantProps } from 'class-variance-authority'
import { Avatar as AvatarPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { toneBg, type Tone } from './tone'

const avatarVariants = cva('relative inline-flex shrink-0 overflow-hidden rounded-full font-bold', {
  variants: {
    size: {
      sm: 'size-8 text-sm',
      md: 'size-9 text-base', // 36px — sidebar user
      lg: 'size-12 text-2xl',
    },
  },
  defaultVariants: { size: 'md' },
})

export type AvatarProps = VariantProps<typeof avatarVariants> & {
  name: string
  src?: string | null
  /** Background when there is no photo. Default: category colour 3 (yellow, as in the design). */
  tone?: Tone
  className?: string
}

const getInitial = (name: string) => name.trim().charAt(0).toUpperCase() || '?'

/** User avatar: photo (e.g. Google) or first-letter fallback. */
export const Avatar = ({ name, src, tone = 3, size, className }: AvatarProps) => (
  <AvatarPrimitive.Root data-slot="avatar" className={cn(avatarVariants({ size }), className)}>
    {src && <AvatarPrimitive.Image src={src} alt={name} className="size-full object-cover" />}
    <AvatarPrimitive.Fallback className={cn('grid size-full place-items-center', toneBg(tone))}>
      {getInitial(name)}
    </AvatarPrimitive.Fallback>
  </AvatarPrimitive.Root>
)
