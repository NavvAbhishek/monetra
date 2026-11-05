import { z } from 'zod'
import { CURRENCY_CODES } from '@/constant/currencies'

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, 'Name is too long'),
  currency: z.string().refine((code) => CURRENCY_CODES.includes(code), 'Choose a currency'),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
