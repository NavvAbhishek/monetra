import { useQuery } from '@tanstack/react-query'
import API from '@/services'
import { QUERY_KEYS } from '../query-keys'
import { useUid } from '../session'

export const useGetPastRecordsQuery = () => {
  const uid = useUid()
  return useQuery({
    queryKey: QUERY_KEYS.pastRecords,
    queryFn: () => API.pastRecords.pastRecord_list(uid as string),
    enabled: !!uid,
  })
}
