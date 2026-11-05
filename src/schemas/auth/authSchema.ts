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
