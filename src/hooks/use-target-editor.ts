import { useState } from 'react'
import { useSetTargetMutation } from '@/queries/profile/profile-mutations'
import type { SpendTarget } from '@/types/profile'
import { fromCents, getCurrencyDigits, toCents } from '@/utils/money'

/** The "Set target" dialog: period (week / month) + amount, save or remove. */
export const useTargetEditor = (current: SpendTarget | undefined, currency: string, defaultPeriod: SpendTarget['period'], onDone: () => void) => {
  const [period, setPeriod] = useState<SpendTarget['period']>(current?.period ?? defaultPeriod)
  const [amount, setAmount] = useState(current ? fromCents(current.cents, currency).toFixed(getCurrencyDigits(currency)) : '')
  const [error, setError] = useState<string | null>(null)
  const mutation = useSetTargetMutation()

  const save = () => {
    const cents = toCents(amount, currency)
    if (cents === null || cents <= 0) return setError('Enter an amount greater than 0')
    if (cents >= 100_000_000_000) return setError('This amount is too large')
    setError(null)
    mutation.mutate({ period, cents }, { onSuccess: onDone })
  }
  const remove = () => mutation.mutate(null, { onSuccess: onDone })

  return {
    period,
    setPeriod,
    amount,
    setAmount: (value: string) => {
      setAmount(value)
      setError(null)
    },
    error,
    save,
    remove,
    isSaving: mutation.isPending,
    hasTarget: !!current,
  }
}
