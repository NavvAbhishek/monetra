import { useQuery } from '@tanstack/react-query'
import API from '@/services'
import { QUERY_KEYS } from '../query-keys'

/** Checks the code in a reset link. Resolves to the account's email; an expired / used link is an error. */
export const useVerifyResetCodeQuery = (code: string | null) =>
  useQuery({
    queryKey: QUERY_KEYS.resetCode(code ?? ''),
    queryFn: () => API.auth.auth_verifyResetCode(code as string),
    enabled: !!code,
    retry: false, // an expired link will not become valid by retrying
    staleTime: Infinity,
    gcTime: 0,
  })
