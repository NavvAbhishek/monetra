import { useMutation, useQueryClient } from '@tanstack/react-query'
import API from '@/services'
import type { Profile, ProfilePatch, SpendTarget } from '@/types/profile'
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

/** Sets (or removes, with `null`) the spending target. The dashboard card shows its own feedback, so one short toast only. */
export const useSetTargetMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (target: SpendTarget | null) => API.profile.profile_update(requireUid(), { target }),
    onSuccess: (profile: Profile, target) => {
      queryClient.setQueryData(QUERY_KEYS.profile, profile)
      Notification.success(target ? 'Target saved' : 'Target removed')
    },
    onError: (error) => Notification.error(errorMessage(error)),
  })
}
