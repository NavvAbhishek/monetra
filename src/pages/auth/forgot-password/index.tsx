import PagePlaceholder from '@/components/PagePlaceholder'
import { Link } from '@/router/navigation'

const ForgotPassword = () => (
  <PagePlaceholder title="Reset password" screens="not in design" phase={5}>
    <Link to="/login" className="text-sm font-semibold text-primary hover:text-primary-hover">Back to log in</Link>
  </PagePlaceholder>
)

export default ForgotPassword
