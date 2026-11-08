import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useGoogleSignInMutation, useSignUpMutation } from '@/queries/auth/auth-mutations'
import { signupSchema, type SignupFormValues } from '@/schemas/auth/authSchema'
import { isServiceError } from '@/services'

export const useSignup = () => {
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', currency: 'USD' },
  })
  const signUp = useSignUpMutation()
  const google = useGoogleSignInMutation()

  const password = useWatch({ control: form.control, name: 'password' })

  const onSubmit = form.handleSubmit((values) =>
    signUp.mutate(values, {
      onError: (error) => {
        // The hook already toasts; also mark the field so the user sees what to fix.
        if (isServiceError(error) && error.code === 'auth/email-in-use') {
          form.setError('email', { message: error.message })
        }
      },
    }),
  )

  return {
    form,
    onSubmit,
    password,
    isSubmitting: signUp.isPending,
    onGoogle: () => google.mutate(),
    isGoogleLoading: google.isPending,
  }
}

export type SignupCtx = ReturnType<typeof useSignup>
