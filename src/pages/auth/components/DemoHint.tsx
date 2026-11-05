import { IS_MOCK_BACKEND } from '@/lib/env'

/**
 * Shown only on the mock backend (UI-first phase): how to get in. Delete this file and its
 * usages once Firebase is live (Phase 12).
 */
const DemoHint = () =>
  IS_MOCK_BACKEND ? (
    <p className="rounded-panel bg-primary-soft px-3.5 py-2.5 text-xs text-text-soft">
      Demo mode: use <strong>sam@email.com</strong> and any password of 8+ characters to see sample data.
    </p>
  ) : null

export default DemoHint
