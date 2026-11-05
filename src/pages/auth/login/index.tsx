import { Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FormField } from '@/components/ui/form-field'
import { fieldErrorProps } from '@/components/ui/form-field-ids'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { Separator } from '@/components/ui/separator'
import { Link } from '@/router/navigation'
import AuthHeading from '../components/AuthHeading'
import AuthSwitchLink from '../components/AuthSwitchLink'
import DemoHint from '../components/DemoHint'
import GoogleButton from '../components/GoogleButton'
import { useLogin } from './hooks/useLogin'

/** M7 (mobile) · D5 (desktop) */
const Login = () => {
  const { form, onSubmit, isSubmitting, onGoogle, isGoogleLoading } = useLogin()
  const { register, control, formState } = form
  const { errors } = formState

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3.5 lg:gap-4">
      <AuthHeading title="Welcome back" description="Log in to see your spending." />

      <FormField id="login-email" label="Email" error={errors.email?.message}>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="sam@email.com"
          {...fieldErrorProps('login-email', errors.email?.message)}
          {...register('email')}
        />
      </FormField>

      <FormField
        id="login-password"
        label="Password"
        error={errors.password?.message}
        labelAction={
          <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary-hover">
            Forgot password?
          </Link>
        }
      >
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...fieldErrorProps('login-password', errors.password?.message)}
          {...register('password')}
        />
      </FormField>

      <div className="flex items-center gap-2.5">
        <Controller
          control={control}
          name="keepLoggedIn"
          render={({ field }) => (
            <Checkbox id="login-keep" checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
          )}
        />
        <Label htmlFor="login-keep" className="text-base font-normal">
          Keep me logged in
        </Label>
      </div>

      <Button type="submit" size="xl" fullWidth loading={isSubmitting}>
        Log in
      </Button>

      <Separator label="or" />
      <GoogleButton label="Continue with Google" loading={isGoogleLoading} onClick={onGoogle} />

      <DemoHint />
      <AuthSwitchLink prompt="New here?" to="/signup" action="Create an account" />
    </form>
  )
}

export default Login
