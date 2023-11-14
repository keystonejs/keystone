import { useEffect } from 'react'
import { useRouter } from '../router'

export function usePreventNavigation (shouldPreventNavigationRef: { current: boolean }) {
  const router = useRouter()

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
    router.events.on('routeChangeStart', clientSideRouteChangeHandler)
    const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
      if (shouldPreventNavigationRef.current) {
        event.preventDefault()
      }
    }
    window.addEventListener('beforeunload', beforeUnloadHandler)
    return () => {
      router.events.off('routeChangeStart', clientSideRouteChangeHandler)
      window.removeEventListener('beforeunload', beforeUnloadHandler)
    }
  }, [shouldPreventNavigationRef, router.events])
}
