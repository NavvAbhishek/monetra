import type { PasswordStrength } from '@/utils/password'

/** Meter colour and label colour for a password strength score (M8 / D6 show green "Strong password"). */
export const getStrengthTone = (score: PasswordStrength['score']): 'danger' | 'primary' | 'success' =>
  score >= 3 ? 'success' : score === 2 ? 'primary' : 'danger'

export const STRENGTH_TEXT_CLASS = {
  danger: 'text-danger',
  primary: 'text-primary',
  success: 'text-success',
} as const
