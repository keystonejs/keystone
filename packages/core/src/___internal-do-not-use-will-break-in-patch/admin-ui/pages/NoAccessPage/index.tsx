import React from 'react'
import { Icon } from '@keystar/ui/icon'
import { shieldAlertIcon } from '@keystar/ui/icon/icons/shieldAlertIcon'
import { Heading, Text } from '@keystar/ui/typography'

import { ErrorContainer } from '../../../../admin-ui/components/Errors'

type NoAccessPage = { sessionsEnabled: boolean }

export const getNoAccessPage = (props: NoAccessPage) => () => <NoAccessPage {...props} />

export function NoAccessPage ({ sessionsEnabled }: NoAccessPage) {
  return (
    <ErrorContainer>
      <Icon color="neutral" src={shieldAlertIcon} size="large" />
      <Heading elementType="h1" margin={0}>No access</Heading>
      <Text>Unable to access to this page. You may need to request access from your system administrator, or sign in with a different account.</Text>
    </ErrorContainer>
  )
}
