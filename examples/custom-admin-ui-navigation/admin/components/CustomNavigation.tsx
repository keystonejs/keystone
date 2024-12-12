import React from 'react'

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

export function CustomNavigation ({ lists }: NavigationProps) {
  return (
    <NavContainer>
      <NavList>
        <NavItem href='/'>Dashboard</NavItem>
        <NavItem href='https://keystonejs.com'>Keystone Docs</NavItem>
        <Divider />
        {lists.map((list) => (
          <NavItem key={list.key} href={getHrefFromList(list)}>
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
