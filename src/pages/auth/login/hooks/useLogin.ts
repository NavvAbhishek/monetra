import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useGoogleSignInMutation, useSignInMutation } from '@/queries/auth/auth-mutations'
import { loginSchema, type LoginFormValues } from '@/schemas/auth/authSchema'

export const useLogin = () => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', keepLoggedIn: true },
  })
  const signIn = useSignInMutation()
  const google = useGoogleSignInMutation()

  // On success the auth listener updates the session and GuestRoute sends the user to the dashboard.
  const onSubmit = form.handleSubmit((values) => signIn.mutate(values))

  return {
    form,
    onSubmit,
    isSubmitting: signIn.isPending,
    onGoogle: () => google.mutate(),
    isGoogleLoading: google.isPending,
  }
}

export type LoginCtx = ReturnType<typeof useLogin>
