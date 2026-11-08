import { z } from 'zod'
import { CURRENCY_CODES } from '@/constant/currencies'
import { emailPattern, MIN_PASSWORD_LENGTH } from '../shared'

const email = z.string().trim().min(1, 'Email is required').regex(emailPattern, 'Enter a valid email address')

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
  keepLoggedIn: z.boolean(),
})
export type LoginFormValues = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, 'Name is too long'),
  email,
  password: z.string().min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`),
  currency: z.string().refine((code) => CURRENCY_CODES.includes(code), 'Choose a currency'),
})
export type SignupFormValues = z.infer<typeof signupSchema>

export const forgotPasswordSchema = z.object({ email })
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

const newPassword = z.string().min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`)

/** /reset-password — the new password typed twice. */
export const resetPasswordSchema = z
  .object({ password: newPassword, confirmPassword: z.string().min(1, 'Type the password again') })
  .refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'The passwords don’t match' })
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

/** Settings → Password — current password + the new one typed twice. */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword,
    confirmPassword: z.string().min(1, 'Type the new password again'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ['confirmPassword'], message: 'The passwords don’t match' })
  .refine((v) => v.newPassword !== v.currentPassword, { path: ['newPassword'], message: 'Choose a password different from your current one' })
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
