import { SegmentedMeter } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { getPasswordStrength } from '@/utils/password'

const TONE_TEXT = { danger: 'text-danger', primary: 'text-primary', success: 'text-success' } as const

/** Strength bar + label under a new-password field: red (weak) / purple (fair) / green (strong). Hidden until something is typed. */
const PasswordStrength = ({ password }: { password: string }) => {
  const { score, label } = getPasswordStrength(password)
  if (score === 0) return null
  const tone = score >= 3 ? 'success' : score === 2 ? 'primary' : 'danger'
  return (
    <div className="flex flex-col gap-1.5 pt-0.5">
      <SegmentedMeter filled={score} tone={tone} label={label} />
      <span className={cn('text-xs font-semibold', TONE_TEXT[tone])}>{label}</span>
    </div>
  )
}

export default PasswordStrength
