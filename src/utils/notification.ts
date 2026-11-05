import { toast } from 'sonner'

/** App-wide toasts (file_structure.md §6). Use this, not sonner directly. */
export const Notification = {
  success: (message: string, description?: string) => toast.success(message, { description }),
  error: (message = 'Something went wrong', description?: string) => toast.error(message, { description }),
  info: (message: string, description?: string) => toast(message, { description }),
  /** Toast with an Undo button (swipe-to-delete, CLAUDE.md §7.3). */
  undo: (message: string, onUndo: () => void, durationMs = 5000) =>
    toast(message, { duration: durationMs, action: { label: 'Undo', onClick: onUndo } }),
}
