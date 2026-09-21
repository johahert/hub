import { useEffect, useRef, type RefObject } from 'react'

const MAX_TILT = 8 // degrees, at full pointer speed
const SMOOTHING = 0.45 // share of each new reading folded into the current tilt
const REST_MS = 130 // stillness before the card levels out again

// Rotates a dragged card with the horizontal speed of the pointer, so it hangs
// from the cursor instead of pointing at it. The angle is written to the target
// element as --kanban-tilt rather than to React state: pointermove fires far too
// often to re-render on, and the styling that reads it is pure CSS anyway.
export function useDragTilt(target: RefObject<HTMLElement | null>) {
  const tilt = useRef(0)
  const lastX = useRef<number | null>(null)
  const restTimer = useRef<number | null>(null)
  const listener = useRef<((event: PointerEvent) => void) | null>(null)

  useEffect(
    () => () => {
      if (listener.current) window.removeEventListener('pointermove', listener.current)
      if (restTimer.current !== null) clearTimeout(restTimer.current)
    },
    [],
  )

  const write = (value: number) => {
    tilt.current = value
    target.current?.style.setProperty('--kanban-tilt', `${value.toFixed(2)}deg`)
  }

  const stop = () => {
    if (listener.current) {
      window.removeEventListener('pointermove', listener.current)
      listener.current = null
    }
    if (restTimer.current !== null) {
      clearTimeout(restTimer.current)
      restTimer.current = null
    }
    lastX.current = null
    write(0)
  }

  const start = () => {
    stop()
    const onPointerMove = (event: PointerEvent) => {
      const previous = lastX.current
      lastX.current = event.clientX
      if (previous === null) return

      const raw = (event.clientX - previous) * 0.9
      const clamped = Math.max(-MAX_TILT, Math.min(MAX_TILT, raw))
      write(tilt.current * (1 - SMOOTHING) + clamped * SMOOTHING)

      if (restTimer.current !== null) clearTimeout(restTimer.current)
      restTimer.current = window.setTimeout(() => write(0), REST_MS)
    }

    listener.current = onPointerMove
    window.addEventListener('pointermove', onPointerMove)
  }

  return { start, stop }
}
