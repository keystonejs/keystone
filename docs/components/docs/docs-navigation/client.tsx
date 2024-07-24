/** @jsxImportSource @emotion/react */

'use client'

import { type NavigationMap } from '.'
import { Badge } from '../../primitives/Badge'
import { NavItem, NavSection } from '../Navigation'

function KeystaticNavItem ({ item }: { item: NonNullable<NavigationMap>[number]['items'][number] }) {
  return (
    <NavItem href={item.href}>
      {item.label}
      {/* Status badges */}
      {item.status !== 'default' && ' '}
      {(item.status === 'new' || item.status === 'updated') && (
        <Badge look="success">{item.status}</Badge>
      )}
    </NavItem>
  )
}

export function DocsNavigationClient ({ navigationMap }: { navigationMap: NavigationMap }) {
  if (!navigationMap) return null

  return (
    <nav
      css={{
        fontWeight: 500,
      }}
    >
      {navigationMap &&
        navigationMap.map((group, i) => (
          <div key={i}>
            {/* No collapsible section for the first group */}
            {i === 0 ? (
              group.items.map((item, j) => <KeystaticNavItem key={`${item.label}-${j}`} item={item} />)
            ) : (
              <NavSection key={i} title={group.groupName}>
                {group.items.map((item, j) => (
                  <KeystaticNavItem key={`${item.label}-${j}`} item={item} />
                ))}
              </NavSection>
            )}
          </div>
        ))}
    </nav>
  )
}
