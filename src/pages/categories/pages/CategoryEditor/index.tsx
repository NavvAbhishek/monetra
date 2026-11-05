import PagePlaceholder from '@/components/PagePlaceholder'
import { useParams } from '@/router/navigation'

/** /categories/new and /categories/$categoryId — mobile full screen (M5); desktop uses the D4 side panel. */
const CategoryEditor = () => {
  const { categoryId } = useParams({ strict: false })
  return (
    <PagePlaceholder
      title={categoryId ? `Edit category ${categoryId}` : 'New category'}
      screens="M5 · D4"
      phase={6}
    />
  )
}

export default CategoryEditor
