import { useMutation, useQueryClient } from '@tanstack/react-query'
import API from '@/services'
import { resetDb } from '@/services/mock/db'
import { Notification } from '@/utils/notification'

/**
 * Mock backend only (UI-first phase): wipes all mock data and logs out, so the next login
 * starts from fresh sample data. Remove with the mock UI in Phase 12.
 */
export const useResetMockDataMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      resetDb()
      await API.auth.auth_signOut()
    },
    onSuccess: () => {
      queryClient.clear()
      Notification.success('Demo data reset')
    },
  })
}
