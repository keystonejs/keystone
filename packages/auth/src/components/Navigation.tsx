import React, {
  useEffect,
  useMemo
} from 'react'

import { ActionButton } from '@keystar/ui/button'
import { Divider } from '@keystar/ui/layout'
import { TooltipTrigger, Tooltip } from '@keystar/ui/tooltip'
import { Text } from '@keystar/ui/typography'

import {
  useQuery,
  useMutation,
  gql,
} from '@keystone-6/core/admin-ui/apollo'
import {
  DeveloperResourcesMenu,
  NavList,
  NavContainer,
  NavFooter,
  NavItem,
  getHrefFromList
} from '@keystone-6/core/admin-ui/components'
import type { NavigationProps } from '@keystone-6/core/admin-ui/components'

export default ({ labelField }: { labelField: string }) => (props: NavigationProps) => <Navigation labelField={labelField} {...props} />

function Navigation ({
  labelField,
  lists
}: {
  labelField: string
} & NavigationProps) {
  const { data } = useQuery<{
    authenticatedItem: null | {
      label: string
      id: string
    }
  }>(useMemo(() => gql`
    query Session {
      authenticatedItem {
        id
        label: ${labelField}
      }
    }
  `, [labelField]))

  return (
    <NavContainer>
      <NavList>
        <NavItem href='/'>Dashboard</NavItem>
        <Divider />
        {lists.map((list) => (
          <NavItem key={list.key} href={getHrefFromList(list)}>
            {list.label}
          </NavItem>
        ))}
      </NavList>

      <NavFooter>
        {data?.authenticatedItem && (
          <SignoutButton authItemLabel={data.authenticatedItem.label} />
        )}
        <DeveloperResourcesMenu />
      </NavFooter>
    </NavContainer>
  )
}

const END_SESSION = gql`
  mutation EndSession {
    endSession
  }
`

function SignoutButton ({
  authItemLabel
}: {
  authItemLabel: string
}) {
  const [endSession, { data }] = useMutation(END_SESSION)
  useEffect(() => {
    if (data?.endSession) {
      window.location.reload()
    }
  }, [data])

  return (
    <TooltipTrigger>
      <ActionButton onPress={() => endSession()}>Sign out</ActionButton>
      <Tooltip>
        <Text>Signed in as <strong>{authItemLabel}</strong></Text>
      </Tooltip>
    </TooltipTrigger>
  )
}
