export type PasswordStrength = {
  /** 0 (empty) – 4 (very strong): filled segments of the strength meter. */
  score: 0 | 1 | 2 | 3 | 4
  label: string
}

const LABELS = ['', 'Weak password', 'Fair password', 'Strong password', 'Very strong password'] as const

/** Simple strength meter for sign-up (M8 / D6). Not a security check. */
export const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return { score: 0, label: LABELS[0] }
  const checks = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password) || password.length >= 12,
  ]
  let score = checks.filter(Boolean).length
  if (password.length < 8) score = Math.min(score, 1) // too short is always "weak"
  score = Math.max(score, 1)
  const clamped = score as 1 | 2 | 3 | 4
  return { score: clamped, label: LABELS[clamped] }
}
