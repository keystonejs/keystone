import { useEffect } from 'react'

export function usePreventNavigation(shouldPreventNavigationRef: { current: boolean }) {
  useEffect(() => {
    const clientSideRouteChangeHandler = () => {
      if (
        shouldPreventNavigationRef.current &&
        !window.confirm('There are unsaved changes, are you sure you want to exit?')
      ) {
        // throwing from here seems to be the only way to prevent the navigation
        // we're throwing just a string here rather than an error because throwing an error
        // causes Next to show an error overlay in dev but it doesn't show the overlay when we throw a string
        throw 'Navigation cancelled by user'
      }
    }
    const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
      if (shouldPreventNavigationRef.current) {
        clientSideRouteChangeHandler()
        event.preventDefault()
        event.returnValue = ''
        return
      }
    }
    window.addEventListener('beforeunload', beforeUnloadHandler)
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler)
    }
  }, [shouldPreventNavigationRef])
}
