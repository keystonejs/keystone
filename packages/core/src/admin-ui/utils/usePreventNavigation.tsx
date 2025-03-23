import { type ReadonlyURLSearchParams, usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function usePreventNavigation(shouldPreventNavigationRef: { current: boolean }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const prevPathnameRef = useRef<string>(null)
  const prevSearchParamsRef = useRef<ReadonlyURLSearchParams>(null)

  useEffect(() => {
    prevPathnameRef.current = pathname
    prevSearchParamsRef.current = searchParams
  }, [])

  useEffect(() => {
    if (
      shouldPreventNavigationRef.current &&
      (pathname !== prevPathnameRef.current || searchParams !== prevSearchParamsRef.current) &&
      !window.confirm('There are unsaved changes, are you sure you want to exit?')
    ) {
      throw 'Navigation cancelled by user'
    }

    prevPathnameRef.current = pathname
    prevSearchParamsRef.current = searchParams
  }, [pathname, searchParams, shouldPreventNavigationRef])

  const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    if (shouldPreventNavigationRef.current) {
      event.preventDefault()
    }
  }

  useEffect(() => {
    window.addEventListener('beforeunload', beforeUnloadHandler)
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler)
    }
  }, [])
}
