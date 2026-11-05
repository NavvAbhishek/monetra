import { useRef, useState, type PointerEvent, type ReactNode } from 'react'
import * as Icon from '@/components/icons'
import { Link } from '@/router/navigation'
import { cn } from '@/lib/utils'

/** Width of one revealed action button (Edit / Delete) — 66px in the design (`w-16.5`). */
const ACTION_PX = 66
const OPEN_PX = ACTION_PX * 2
/** Movement under this many px is a tap, not a swipe. */
const TAP_SLOP_PX = 6

export type SwipeableRowProps = {
  expenseId: string
  onDelete: () => void
  children: ReactNode
}

/**
 * Mobile expense row (M2): tap to edit, swipe left to reveal Edit / Delete.
 * Pointer events, so it works for touch, pen and mouse. Vertical scrolling stays native (`touch-pan-y`).
 */
const SwipeableRow = ({ expenseId, onDelete, children }: SwipeableRowProps) => {
  const [offset, setOffset] = useState(0) // 0 (closed) … -OPEN_PX (open)
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ startX: number; startOffset: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const isOpen = offset < 0

  const onPointerDown = (e: PointerEvent) => {
    drag.current = { startX: e.clientX, startOffset: offset, moved: false }
    suppressClick.current = false
  }

  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.startX
    if (!d.moved && Math.abs(dx) < TAP_SLOP_PX) return
    if (!d.moved) {
      d.moved = true
      setDragging(true)
      e.currentTarget.setPointerCapture?.(e.pointerId)
    }
    setOffset(Math.min(0, Math.max(-OPEN_PX, d.startOffset + dx)))
  }

  const endDrag = () => {
    const d = drag.current
    drag.current = null
    if (!d?.moved) return
    suppressClick.current = true // the finger-lift must not also count as a tap on the link
    setDragging(false)
    setOffset((current) => (current < -OPEN_PX / 2 ? -OPEN_PX : 0))
  }

  return (
    <div className="relative overflow-hidden">
      {/* revealed actions */}
      {/* hidden unless open / dragging — otherwise their colour bleeds through the row's anti-aliased edge */}
      <div className={cn('absolute inset-y-0 right-0 flex', !isOpen && !dragging && 'invisible')} aria-hidden={!isOpen}>
        <Link
          to="/expenses/$expenseId"
          params={{ expenseId }}
          tabIndex={isOpen ? 0 : -1}
          className="flex w-16.5 flex-col items-center justify-center gap-0.5 bg-primary text-2xs font-semibold text-primary-foreground"
        >
          <Icon.Pencil className="size-4" aria-hidden />
          Edit
        </Link>
        <button
          type="button"
          tabIndex={isOpen ? 0 : -1}
          onClick={() => {
            setOffset(0)
            onDelete()
          }}
          className="flex w-16.5 flex-col items-center justify-center gap-0.5 bg-danger text-2xs font-semibold text-danger-foreground"
        >
          <Icon.Trash2 className="size-4" aria-hidden />
          Delete
        </button>
      </div>

      {/* the row itself */}
      <div
        data-testid="swipe-row"
        data-open={isOpen || undefined}
        style={{ transform: `translateX(${offset}px)` }}
        className={cn('relative touch-pan-y bg-card', !dragging && 'transition-transform duration-200')}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            suppressClick.current = false
            e.preventDefault()
            e.stopPropagation()
          } else if (isOpen) {
            // tapping an open row just closes it
            e.preventDefault()
            e.stopPropagation()
            setOffset(0)
          }
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default SwipeableRow
