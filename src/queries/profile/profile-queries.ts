import { useQuery } from '@tanstack/react-query'
import API from '@/services'
import { QUERY_KEYS } from '../query-keys'
import { useUid } from '../session'

export const useGetProfileQuery = () => {
  const uid = useUid()
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: () => API.profile.profile_get(uid as string),
    enabled: !!uid,
  })
}
