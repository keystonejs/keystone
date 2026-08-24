import { useEffect, useMemo } from 'react'
import { useEffectEvent } from 'react-aria/private/utils/useEffectEvent'

import { ActionButton } from '@keystar/ui/button'
import { Divider } from '@keystar/ui/layout'
import { TooltipTrigger, Tooltip } from '@keystar/ui/tooltip'
import { Text } from '@keystar/ui/typography'

import {
  useQuery,
  useMutation,
  gql,
  type TypedDocumentNode,
} from '@keystone-6/core/admin-ui/apollo'
import {
  DeveloperResourcesMenu,
  NavList,
  NavContainer,
  NavFooter,
  NavItem,
  getHrefFromList,
} from '@keystone-6/core/admin-ui/components'
import type { NavigationProps } from '@keystone-6/core/admin-ui/components'
import { useNavigate } from '@keystar/ui/router'

export default ({ labelField }: { labelField: string }) =>
  (props: NavigationProps) => <Navigation labelField={labelField} {...props} />

function Navigation({
  labelField,
  lists,
}: {
  labelField: string
} & NavigationProps) {
  const { data } = useQuery<{
    authenticatedItem: null | {
      label: string
    }
  }>(
    useMemo(
      () => gql`
    query KsAuthFetchSession {
      authenticatedItem {
        label: ${labelField}
      }
    }
  `,
      [labelField]
    )
  )

  return (
    <NavContainer>
      <NavList>
        <NavItem href="/">Dashboard</NavItem>
        <Divider />
        {lists.map(list => (
          <NavItem key={list.key} href={getHrefFromList(list)}>
            {list.label}
          </NavItem>
        ))}
      </NavList>

      <NavFooter>
        {data?.authenticatedItem && <SignoutButton authItemLabel={data.authenticatedItem.label} />}
        <DeveloperResourcesMenu />
      </NavFooter>
    </NavContainer>
  )
}

const END_SESSION = gql`
  mutation KsAuthEndSession {
    endSession
  }
` as TypedDocumentNode<{ endSession: boolean }>

function SignoutButton({ authItemLabel }: { authItemLabel: string }) {
  const navigate = useNavigate()
  const [endSession, { data }] = useMutation(END_SESSION)
  const navigateToSignin = useEffectEvent(() => navigate('/signin'))
  useEffect(() => {
    if (data?.endSession) {
      navigateToSignin()
    }
  }, [data])

  return (
    <TooltipTrigger>
      <ActionButton onPress={() => endSession()}>Sign out</ActionButton>
      <Tooltip>
        <Text>
          Signed in as <strong>{authItemLabel}</strong>
        </Text>
      </Tooltip>
    </TooltipTrigger>
  )
}
