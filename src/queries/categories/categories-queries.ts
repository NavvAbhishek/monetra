import { useQuery } from '@tanstack/react-query'
import API from '@/services'
import { QUERY_KEYS } from '../query-keys'
import { useUid } from '../session'

export const useGetCategoriesQuery = () => {
  const uid = useUid()
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: () => API.categories.category_list(uid as string),
    enabled: !!uid,
  })
}
