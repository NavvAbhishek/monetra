import { useMutation, useQueryClient } from '@tanstack/react-query'
import API from '@/services'
import type { Profile, ProfilePatch } from '@/types/profile'
import { Notification } from '@/utils/notification'
import { QUERY_KEYS } from '../query-keys'
import { errorMessage, requireUid } from '../session'

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: ProfilePatch) => API.profile.profile_update(requireUid(), patch),
    onSuccess: (profile: Profile) => {
      queryClient.setQueryData(QUERY_KEYS.profile, profile)
      Notification.success('Settings saved')
    },
    onError: (error) => Notification.error(errorMessage(error)),
  })
}
