import { Link } from '@/router/navigation'

const NotFound = () => (
  <div className="grid min-h-svh place-items-center bg-bg p-6">
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-hero font-extrabold text-primary">404</p>
      <h1 className="text-2xl font-extrabold text-ink">Page not found</h1>
      <p className="text-sm text-muted-foreground">The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="text-sm font-semibold text-primary hover:text-primary-hover">
        Back to dashboard
      </Link>
    </div>
  </div>
)

export default NotFound
