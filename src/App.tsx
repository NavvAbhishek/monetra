import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { SHOW_DEVTOOLS } from '@/lib/env'
import { queryClient } from '@/lib/query-client'
import { router } from '@/router'

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    <Toaster />
    {SHOW_DEVTOOLS && <ReactQueryDevtools buttonPosition="bottom-left" />}
  </QueryClientProvider>
)

export default App
