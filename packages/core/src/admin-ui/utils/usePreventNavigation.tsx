import { useEffect, useRef } from 'react'

import { useKeystone } from '../context.tsx'

export function usePreventNavigation(shouldPreventNavigation: boolean) {
  const { navigationBlockers } = useKeystone()
  const removeBlocker = useRef<(() => void) | undefined>(undefined)

  useEffect(() => {
    if (!shouldPreventNavigation) return

    const remove = navigationBlockers.add()
    removeBlocker.current = remove
    return () => {
      removeBlocker.current = undefined
      remove()
    }
  }, [navigationBlockers, shouldPreventNavigation])

  return () => removeBlocker.current?.()
}
