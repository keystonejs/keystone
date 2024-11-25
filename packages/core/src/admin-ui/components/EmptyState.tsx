import React, { type ReactElement, type ReactNode } from 'react'

import { Icon } from '@keystar/ui/icon'
import { Flex } from '@keystar/ui/layout'
import { SlotProvider } from '@keystar/ui/slots'
import { Heading, Text } from '@keystar/ui/typography'
import { isReactText } from '@keystar/ui/utils'

type EmptyStateProps =
  | { children: ReactNode }
  | {
      title?: ReactNode
      icon?: ReactElement
      message?: ReactNode
      actions?: ReactNode
    }

const emptyStateSlots = {
  heading: { align: 'center', margin: 0 },
  text: { align: 'center' }
} as const
export function EmptyState (props: EmptyStateProps) {
  return (
    <Flex
      alignItems="center"
      direction="column"
      gap="large"
      justifyContent="center"
      minHeight="scale.3000"
      paddingX={{ mobile: 'medium', tablet: 'xlarge', desktop: 'xxlarge' }}
      paddingY="xlarge"
    >
      <SlotProvider slots={emptyStateSlots}>
        {'children' in props ? (
          props.children
        ) : (
          <>
            {props.icon && (
              <Icon src={props.icon} size="large" color="neutral" />
            )}
            {props.title && (
              <Heading size="medium">
                {props.title}
              </Heading>
            )}
            {props.message && isReactText(props.message)
              ? <Text>{props.message}</Text>
              : props.message}
            
            {props.actions}
          </>
        )}
      </SlotProvider>
    </Flex>
  )
}
