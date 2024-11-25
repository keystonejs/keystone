import React, { useEffect } from 'react'

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

type AuthenticatedItem = {
  label: string
  id: string
}

export default ({ labelField }: { labelField: string }) => (props: NavigationProps) => <Navigation labelField={labelField} {...props} />

function Navigation ({
  labelField,
  lists
}: {
  labelField: string
} & NavigationProps) {
  const { data } = useQuery<{
    authenticatedItem: AuthenticatedItem | null
  }>(gql`
    query Session {
      authenticatedItem {
        id
        label: ${labelField}
      }
    }
  `)

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

function SignoutButton (props: { authItemLabel: string, children?: React.ReactNode }) {
  const { authItemLabel, children = 'Sign out' } = props
  const { signout } = useSignout()

  return (
    <TooltipTrigger>
      <ActionButton onPress={() => signout()}>
        {children}
      </ActionButton>
      <Tooltip>
        <Text>Signed in as <strong>{authItemLabel}</strong></Text>
      </Tooltip>
    </TooltipTrigger>
  )
}

const END_SESSION = gql`
  mutation EndSession {
    endSession
  }
`

function useSignout () {
  const [signout, result] = useMutation(END_SESSION)

  // TODO: handle errors
  useEffect(() => {
    if (result.data?.endSession) {
      window.location.reload()
    }
  }, [result.data])

  return {
    signout,
    loading: result.loading,
  }
}
