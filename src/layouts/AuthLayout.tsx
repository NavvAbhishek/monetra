import { Suspense } from 'react'
import PageLoader from '@/components/PageLoader'
import { Outlet } from '@/router/navigation'

// Temporary shell — the real D5/D6 split layout and M7/M8 column are built in Phase 4.
const AuthLayout = () => (
  <div className="min-h-svh bg-bg">
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center p-6">
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </main>
  </div>
)

export default AuthLayout
