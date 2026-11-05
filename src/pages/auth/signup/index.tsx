import PagePlaceholder from '@/components/PagePlaceholder'
import { Link } from '@/router/navigation'

const Signup = () => (
  <PagePlaceholder title="Create account" screens="M8 · D6" phase={5}>
    <Link to="/login" className="text-sm font-semibold text-primary hover:text-primary-hover">Already have an account? Log in</Link>
  </PagePlaceholder>
)

export default Signup
