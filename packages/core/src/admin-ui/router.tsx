'use client'
/**
 * This file is exposed by the /router entrypoint, and helps ensure that other
 * packages import the same instance of next's router.
 */

// not using export * because Rollup's CJS re-export code doesn't ignore __esModule on the exports object so it will re-define it if it exists
// and since __esModule isn't configurable(at least with the code that's _generally_ emitted by Rollup, Babel, tsc and etc.)
// an error will be thrown
// that's normally not a problem because modules generally use Object.defineProperty(exports, '__esModule', { value: true })
// which means that the property isn't enumerable but Next uses Babel's loose mode and Babel's loose mode for the CJS transform
// uses exports.__esModule = true instead of defineProperty so the property is enumerable
export { Router, withRouter } from 'next/router'
import { useRouter as _useRouter, usePathname, useSearchParams } from 'next/navigation'

import NextLink, { type LinkProps as NextLinkProps } from 'next/link'
import { type AnchorHTMLAttributes } from 'react'

export type LinkProps = NextLinkProps & AnchorHTMLAttributes<HTMLAnchorElement>

export const Link = NextLink

import NextHead from 'next/head'

export const Head = NextHead

export function useRouter () {
  const _router = _useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const query: Record<string, string> = {}
  for (let [key, value] of searchParams.entries()) {
    query[key] = value
  }
  
  const router = {
    push: (...params: any[]) => {
      if(typeof params[0] === 'string') {        
        return _router.push(params[0])
      }
      if(typeof params[0] === 'object') {
        const {pathname: _path, query } = params[0] as any
        return _router.push((_path ?? pathname) + query ? `?${new URLSearchParams(query).toString()}` : '')
      }
    },
    replace: (...params: any[]) => {
      if(typeof params[0] === 'string') {        
        return _router.replace(params[0])
      }
      if(typeof params[0] === 'object') {
        const {pathname: _path, query } = params[0] as any
        return _router.replace((_path ?? pathname) + query ? `?${new URLSearchParams(query).toString()}` : '')
      }
    },
    query,
    pathname,
  }

  return router
}