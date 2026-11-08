import { useMutation, useQueryClient } from '@tanstack/react-query'
import API from '@/services'
import type { PastRecordInput } from '@/types/pastRecord'
import { Notification } from '@/utils/notification'
import { QUERY_KEYS } from '../query-keys'
import { errorMessage, requireUid } from '../session'

const useRefresh = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pastRecords })
}

export const useCreatePastRecordMutation = () => {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: (input: PastRecordInput) => API.pastRecords.pastRecord_create(requireUid(), input),
    onSuccess: () => {
      void refresh()
      Notification.success('Past spending added')
    },
    onError: (error) => Notification.error(errorMessage(error)),
  })
}

/** CSV import: saves all the confirmed rows. */
export const useImportPastRecordsMutation = () => {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: (inputs: readonly PastRecordInput[]) => API.pastRecords.pastRecord_createMany(requireUid(), inputs),
    onSuccess: (count) => {
      void refresh()
      Notification.success(`Imported ${count} ${count === 1 ? 'record' : 'records'}`)
    },
    onError: (error) => Notification.error(errorMessage(error)),
  })
}

export const useUpdatePastRecordMutation = () => {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PastRecordInput }) =>
      API.pastRecords.pastRecord_update(requireUid(), id, input),
    onSuccess: () => {
      void refresh()
      Notification.success('Changes saved')
    },
    onError: (error) => Notification.error(errorMessage(error)),
  })
}

export const useDeletePastRecordMutation = () => {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: (id: string) => API.pastRecords.pastRecord_delete(requireUid(), id),
    onSuccess: () => {
      void refresh()
      Notification.success('Record deleted')
    },
    onError: (error) => Notification.error(errorMessage(error)),
  })
}
