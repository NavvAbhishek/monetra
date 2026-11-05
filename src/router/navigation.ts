// App-wide navigation API. Pages import from here, not from @tanstack/react-router,
// so the router library stays swappable (file_structure.md §3).
export {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useMatches,
  useNavigate,
  useParams,
  useRouter,
  useSearch,
} from '@tanstack/react-router'
export type { LinkProps } from '@tanstack/react-router'
