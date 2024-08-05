/** @jsxImportSource @emotion/react */

'use client'

import {
  type AnchorHTMLAttributes,
  type ReactNode,
  useState,
  createContext,
  useContext,
  useMemo,
} from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

import { useMediaQuery } from '../../lib/media'
import { useHeaderContext } from '../Header'
import { Badge } from '../primitives/Badge'
import { ArrowR } from '../icons/ArrowR'

type NavContext = {
  isSectionCollapsed: (title: string) => boolean
  collapseSection: (title: string) => void
  expandSection: (title: string) => void
}

const NavContext = createContext<NavContext | undefined>(undefined)

/* Save section collapse/expand states */
export const NavContextProvider = ({ children }: { children: ReactNode }) => {
  const [collapsedSections, setCollapsedSections] = useState<string[]>([])

  const contextValue = useMemo(() => {
    const collapseSection = (title: string) => {
      const isSectionAlreadyCollapsed = collapsedSections.includes(title)
      if (!isSectionAlreadyCollapsed) {
        setCollapsedSections([...collapsedSections, title])
      }
    }
    const expandSection = (title: string) => {
      const isSectionAlreadyExpanded = !collapsedSections.includes(title)
      if (!isSectionAlreadyExpanded) {
        setCollapsedSections(collapsedSections.filter((cs) => cs !== title))
      }
    }
    const isSectionCollapsed = (title: string) => {
      return collapsedSections.some((cs) => cs === title)
    }

    return { isSectionCollapsed, collapseSection, expandSection }
  }, [collapsedSections, setCollapsedSections])

  return <NavContext.Provider value={contextValue}>{children}</NavContext.Provider>
}

const useNavContext = () => {
  const navContext = useContext(NavContext)
  if (navContext === undefined) {
    throw new Error('NavContextProvider is not wrapped in the tree')
  }

  return navContext
}

type NavSectionProps = {
  title: string
  children: ReactNode
}

export function NavSection ({ title, children }: NavSectionProps) {
  const { isSectionCollapsed, collapseSection, expandSection } = useNavContext()
  const isCollapsed = isSectionCollapsed(title)
  return (
    <section>
      <button
        css={{
          display: 'inline-flex',
          height: 'auto',
          padding: 0,
          border: 'none',
          background: 'transparent',
          fontSize: '1rem',
          marginBottom: '1rem',
          alignItems: 'center',
          fontWeight: 700,
          cursor: 'pointer',
          color: 'var(--text-heading)',
          ':hover': {
            color: 'var(--link)',
          },
        }}
        onClick={() => (isCollapsed ? expandSection(title) : collapseSection(title))}
      >
        {title}
        <ArrowR
          css={{
            marginLeft: '0.25rem',
            width: '14px',
            transition: 'transform 150ms',
            ...(isCollapsed ? {} : { transform: 'rotate(90deg)' }),

            path: { strokeWidth: '0.125em' },
          }}
        />
      </button>

      <div
        css={{
          paddingLeft: 'var(--space-medium)',
          ...(isCollapsed ? { height: 0, overflow: 'hidden' } : { height: '100%' }),
        }}
      >
        {children}
      </div>
    </section>
  )
}

type NavItemProps = {
  href: string
  isActive?: boolean
  isPlaceholder?: boolean
  alwaysVisible?: boolean
} & AnchorHTMLAttributes<HTMLAnchorElement>

export function NavItem ({
  href,
  isActive: _isActive,
  isPlaceholder,
  alwaysVisible,
  ...props
}: NavItemProps) {
  const pathname = usePathname()
  const mq = useMediaQuery()
  const isActive = typeof _isActive !== 'undefined' ? _isActive : pathname === href
  const ctx = useHeaderContext()
  const isMobileNavOpen = ctx ? ctx.mobileNavIsOpen : true
  const desktopOpenState = ctx ? ctx.desktopOpenState : -1

  return (
    <Link
      href={href}
      {...(alwaysVisible ? {} : { tabIndex: isMobileNavOpen ? 0 : desktopOpenState })}
      css={mq({
        display: 'block',
        textDecoration: 'none',
        paddingBottom: '1rem',
        color: isActive
          ? 'var(--link)'
          : `${isPlaceholder ? 'var(--text-disabled)' : 'var(--text)'}`,
        ':hover': {
          color: 'var(--link)',
        },
      })}
      {...props}
    />
  )
}

type PrimaryNavItemProps = {
  href: string
  children: ReactNode
} & AnchorHTMLAttributes<HTMLAnchorElement>

export function PrimaryNavItem ({ href, children }: PrimaryNavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href
  const ctx = useHeaderContext()
  const isMobileNavOpen = ctx ? ctx.mobileNavIsOpen : true
  const desktopOpenState = ctx ? ctx.desktopOpenState : -1

  return (
    <Link
      href={href}
      tabIndex={isMobileNavOpen ? 0 : desktopOpenState}
      css={{
        display: 'block',
        fontSize: '1rem',
        color: isActive ? 'var(--link)' : 'var(--text-heading)',
        marginBottom: '1rem',
        alignItems: 'center',
        fontWeight: 400,
        ':hover': {
          color: 'var(--link)',
        },
      }}
    >
      {children}
    </Link>
  )
}

export function DocsNavigation ({ docsNavigation }: { docsNavigation?: React.ReactNode }) {
  return (
    <NavContextProvider>
      {docsNavigation}
    </NavContextProvider>
  )
}