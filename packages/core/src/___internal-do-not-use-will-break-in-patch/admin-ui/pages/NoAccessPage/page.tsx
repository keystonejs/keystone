'use client'
import { Icon } from '@keystar/ui/icon'
import { shieldAlertIcon } from '@keystar/ui/icon/icons/shieldAlertIcon'
import { Heading, Text } from '@keystar/ui/typography'

import { ErrorContainer } from '../../../../admin-ui/components/Errors'

export type NoAccessPageProps = { sessionsEnabled: boolean }

export function NoAccessPage({ sessionsEnabled }: NoAccessPageProps) {
  return (
    <ErrorContainer>
      <Icon color="neutral" src={shieldAlertIcon} size="large" />
      <Heading elementType="h1" margin={0}>
        No access
      </Heading>
      <Text>
        Unable to access to this page. You may need to request access from your system
        administrator, or sign in with a different account.
      </Text>
    </ErrorContainer>
  )
}
