'use client'
import { Divider } from '@keystar/ui/layout'
import {
  getHrefFromList,
  DeveloperResourcesMenu,
  NavContainer,
  NavFooter,
  NavList,
  NavItem,
} from '@keystone-6/core/admin-ui/components'
import type { NavigationProps } from '@keystone-6/core/admin-ui/components'
import { useKeystone } from '@keystone-6/core/admin-ui/context'

export function CustomNavigation({ lists }: NavigationProps) {
  const { basePath } = useKeystone()
  return (
    <NavContainer>
      <NavList>
        <NavItem href="/">Dashboard</NavItem>
        <NavItem href="/custom-page">Custom Page</NavItem>
        <Divider />
        {lists.map(list => (
          <NavItem key={list.key} href={getHrefFromList(list, basePath)}>
            {list.label}
          </NavItem>
        ))}
      </NavList>

      <NavFooter>
        <DeveloperResourcesMenu />
      </NavFooter>
    </NavContainer>
  )
}
