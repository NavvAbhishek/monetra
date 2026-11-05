// Shared animation / surface classes for floating UI (tw-animate-css).
export const popInOut =
  'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'

export const fadeInOut =
  'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0'

/** Menu / list item used by Select and DropdownMenu. */
export const menuItemClass =
  'relative flex h-10 cursor-pointer items-center gap-2.5 rounded-control px-3 text-base font-medium outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-muted [&_svg]:size-4 [&_svg]:shrink-0'
