import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useQueryParams, type QueryParams } from '../router'

export function usePreventNavigation(shouldPreventNavigationRef: { current: boolean }) {
  const pathname = usePathname()
  const { query } = useQueryParams()

  const prevPathnameRef = useRef<string>(null)
  const prevSearchParamsRef = useRef<QueryParams>(null)

  useEffect(() => {
    prevPathnameRef.current = pathname
    prevSearchParamsRef.current = query
  }, [])

  useEffect(() => {
    if (
      shouldPreventNavigationRef.current &&
      (pathname !== prevPathnameRef.current || query !== prevSearchParamsRef.current) &&
      !window.confirm('There are unsaved changes, are you sure you want to exit?')
    ) {
      throw 'Navigation cancelled by user'
    }

    prevPathnameRef.current = pathname
    prevSearchParamsRef.current = query
  }, [pathname, query, shouldPreventNavigationRef])

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
