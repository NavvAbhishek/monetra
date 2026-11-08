import { Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { fieldErrorProps } from '@/components/ui/form-field-ids'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { CURRENCIES } from '@/constant/currencies'
import AuthHeading from '../components/AuthHeading'
import AuthSwitchLink from '../components/AuthSwitchLink'
import GoogleButton from '../components/GoogleButton'
import PasswordStrength from '@/components/PasswordStrength'
import { useSignup } from './hooks/useSignup'

/** M8 (mobile) · D6 (desktop) */
const Signup = () => {
  const { form, onSubmit, password, isSubmitting, onGoogle, isGoogleLoading } = useSignup()
  const { register, control, formState } = form
  const { errors } = formState

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3.5">
      <AuthHeading title="Create account" description="Start tracking your daily expenses." />

      <FormField id="signup-name" label="Name" error={errors.name?.message} className="pt-1.5">
        <Input
          id="signup-name"
          autoComplete="name"
          placeholder="Sam Perera"
          {...fieldErrorProps('signup-name', errors.name?.message)}
          {...register('name')}
        />
      </FormField>

      <FormField id="signup-email" label="Email" error={errors.email?.message}>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="sam@email.com"
          {...fieldErrorProps('signup-email', errors.email?.message)}
          {...register('email')}
        />
      </FormField>

      <FormField id="signup-password" label="Password" error={errors.password?.message}>
        <PasswordInput
          id="signup-password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          {...fieldErrorProps('signup-password', errors.password?.message)}
          {...register('password')}
        />
        <PasswordStrength password={password} />
      </FormField>

      <FormField id="signup-currency" label="Currency" error={errors.currency?.message}>
        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="signup-currency" onBlur={field.onBlur} {...fieldErrorProps('signup-currency', errors.currency?.message)}>
                <SelectValue placeholder="Choose currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <Button type="submit" size="xl" fullWidth loading={isSubmitting} className="mt-1">
        Create account
      </Button>

      <Separator label="or" />
      <GoogleButton label="Sign up with Google" loading={isGoogleLoading} onClick={onGoogle} />

      <AuthSwitchLink prompt="Already have an account?" to="/login" action="Log in" />
    </form>
  )
}

export default Signup
