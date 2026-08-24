import { useEffect } from 'react'

import { addNavigationBlocker } from './navigation.ts'

export function usePreventNavigation(shouldPreventNavigationRef: { current: boolean }) {
  useEffect(() => {
    const removeNavigationBlocker = addNavigationBlocker(() => shouldPreventNavigationRef.current)
    return () => {
      removeNavigationBlocker()
    }
  }, [shouldPreventNavigationRef])
}
