import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useConfirmPasswordResetMutation } from '@/queries/auth/auth-mutations'
import { useVerifyResetCodeQuery } from '@/queries/auth/auth-queries'
import { useLocation } from '@/router/navigation'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/schemas/auth/authSchema'
import { isServiceError } from '@/services'

/**
 * The page behind the link in the reset email: /reset-password?oobCode=…
 * Steps: check the code → choose a new password → success. A missing / expired / used code is "invalid".
 */
export const useResetPassword = () => {
  // read the query string directly: the router would try to parse the code as JSON
  const { searchStr } = useLocation()
  const code = new URLSearchParams(searchStr).get('oobCode')

  const verify = useVerifyResetCodeQuery(code)
  const confirm = useConfirmPasswordResetMutation()

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })
  const password = useWatch({ control: form.control, name: 'password' })

  const onSubmit = form.handleSubmit(({ password: newPassword }) => {
    if (!code) return
    confirm.mutate(
      { code, password: newPassword },
      {
        onError: (error) => {
          if (isServiceError(error) && error.code === 'auth/invalid-link') return // the page switches to its "invalid link" state
          form.setError('password', { message: error instanceof Error ? error.message : 'Could not change the password. Try again.' })
        },
      },
    )
  })

  const linkIsBad = !code || verify.isError || (confirm.isError && isServiceError(confirm.error) && confirm.error.code === 'auth/invalid-link')

  return {
    form,
    onSubmit,
    password,
    email: verify.data,
    isChecking: !!code && verify.isPending,
    linkIsBad,
    isSubmitting: confirm.isPending,
    isDone: confirm.isSuccess,
  }
}

export type ResetPasswordCtx = ReturnType<typeof useResetPassword>
