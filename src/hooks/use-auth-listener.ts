import { useEffect } from 'react'
import API from '@/services'
import { useAuthStore } from '@/stores/auth.store'

/** Mount once (App.tsx): keeps `auth.store` in sync with the backend session. */
export const useAuthListener = () => {
  useEffect(() => API.auth.auth_onChange((user) => useAuthStore.getState().setUser(user)), [])
}
