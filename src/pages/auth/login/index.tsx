import PagePlaceholder from '@/components/PagePlaceholder'
import { Link } from '@/router/navigation'

const Login = () => (
  <PagePlaceholder title="Welcome back" screens="M7 · D5" phase={5}>
    <Link to="/" className="text-sm font-semibold text-primary hover:text-primary-hover">Continue to app →</Link>
    <Link to="/signup" className="text-sm font-semibold text-primary hover:text-primary-hover">Create an account</Link>
    <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary-hover">Forgot password?</Link>
  </PagePlaceholder>
)

export default Login
