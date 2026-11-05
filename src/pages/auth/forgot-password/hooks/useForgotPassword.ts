import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useResetPasswordMutation } from '@/queries/auth/auth-mutations'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/schemas/auth/authSchema'

export const useForgotPassword = () => {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })
  const reset = useResetPasswordMutation()

  const onSubmit = form.handleSubmit(({ email }) => reset.mutate(email))

  return {
    form,
    onSubmit,
    isSubmitting: reset.isPending,
    /** The email the link was "sent" to, once the request succeeded. */
    sentTo: reset.isSuccess ? reset.variables : null,
    tryAgain: () => reset.reset(),
  }
}

export type ForgotPasswordCtx = ReturnType<typeof useForgotPassword>
