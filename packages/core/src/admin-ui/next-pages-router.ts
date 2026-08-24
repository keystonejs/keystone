import { useEffect, useMemo, useState } from 'react'

import type { KeystoneRouter } from './context.tsx'
import { useRouter } from './router.tsx'

export function useNextPagesRouter(): { router: KeystoneRouter; isReady: boolean } {
  const { push, replace, basePath, isReady } = useRouter()
  // Next's router can be ready on the first client render but not on the server.
  // Wait until after hydration so both initially render the same empty tree.
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  const router = useMemo<KeystoneRouter>(
    () => ({
      navigate(href, options) {
        if (options?.replace) {
          replace(href)
        } else {
          push(href)
        }
      },
      useHref(href) {
        if (!basePath || !href.startsWith('/') || href.startsWith('//')) return href
        if (href === '/') return basePath
        return `${basePath}${href}`
      },
      usePathname: useNextPathname,
      useSearch: useNextSearch,
      useNavigationBlocker: useNextNavigationBlocker,
    }),
    [basePath, push, replace]
  )

  return { router, isReady: isMounted && isReady }
}

function useNextNavigationBlocker({
  shouldBlockNavigation,
}: Parameters<KeystoneRouter['useNavigationBlocker']>[0]) {
  const { events } = useRouter()
  useEffect(() => {
    const onRouteChangeStart = () => {
      if (shouldBlockNavigation()) {
        // Next's Pages Router requires throwing to interrupt routeChangeStart.
        // Use a string to avoid Next's development error overlay.
        throw 'Navigation cancelled by user'
      }
    }
    events.on('routeChangeStart', onRouteChangeStart)
    return () => {
      events.off('routeChangeStart', onRouteChangeStart)
    }
  }, [events, shouldBlockNavigation])
}

function useNextPathname() {
  const { asPath } = useRouter()
  return useMemo(() => new URL(asPath, 'http://keystone.local').pathname, [asPath])
}

function useNextSearch() {
  const { asPath } = useRouter()
  return useMemo(() => new URL(asPath, 'http://keystone.local').search, [asPath])
}
