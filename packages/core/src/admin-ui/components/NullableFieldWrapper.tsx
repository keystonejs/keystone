import React, { type ReactElement } from 'react'

import { Checkbox } from '@keystar/ui/checkbox'
import { Icon } from '@keystar/ui/icon'
import { cornerDownRightIcon } from '@keystar/ui/icon/icons/cornerDownRightIcon'
import { HStack, VStack } from '@keystar/ui/layout'
import { tokenSchema } from '@keystar/ui/style'
import { Text } from '@keystar/ui/typography'

import { InlineCode } from './InlineCode'

type NullableFieldWrapperProps = {
  /** Whether to auto focus the checkbox. */
  autoFocus?: boolean
  /** The field element. */
  children: ReactElement
  /**
   * When `true`, the field is wrapped and the checkbox is shown. Otherwise, the
   * field is rendered directly.
  */
  isAllowed?: boolean
  /** When `true`, you must disable the field to prevent conflicting user input. */
  isNull?: boolean
  /**
   * The checkbox may be readonly in cases where the user has access to see the
   * field, but not edit it.
   */
  isReadOnly?: boolean
  /** The group label. */
  label: string
  /** Handler that is called when the checkbox's state changes. */
  onChange?: (isSelected: boolean) => void
}

/**
 * Wraps a field component with a "group" (ARIA `<fieldset>`), and
 * appends a checkbox to allow setting the value to `null`.
 * 
 * Prefer a more elegant solution where possible, like clearing the value or
 * deselecting an option.
*/
export function NullableFieldWrapper (props: NullableFieldWrapperProps) {
  const { autoFocus, children, isAllowed, isNull, isReadOnly, label, onChange } = props

  if (!isAllowed) {
    return children
  }
  
  return (
    <VStack aria-label={label} gap="medium" role="group">
      {children}

      <HStack gap="regular" paddingStart="regular">
        <Icon src={cornerDownRightIcon} color="neutralTertiary" />
        <Checkbox
          prominence="low"
          autoFocus={isNull && autoFocus}
          isReadOnly={isReadOnly}
          isSelected={isNull}
          onChange={onChange}
          UNSAFE_style={{
            marginTop: `calc(${tokenSchema.size.icon.small} / -2)`,
          }}
        >
          <Text>Set to <InlineCode>null</InlineCode></Text>
        </Checkbox>
      </HStack>
    </VStack>
  )
}