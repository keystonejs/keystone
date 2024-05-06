/** @jsxRuntime classic */
/** @jsx jsx */

import { Stack, jsx } from '@keystone-ui/core'
import { FieldProps } from '@keystone-6/core/types'
import { FieldContainer, FieldDescription, FieldLabel, TextArea } from '@keystone-ui/fields'
import { controller } from '@keystone-6/core/fields/types/virtual/views'
import useFieldProps from '../useFieldProps'
import { randomUUID } from 'crypto'

export const Field = (props: FieldProps<typeof controller>) => {
  const metaProps = useFieldProps(props.field.listKey, props.field.path)
  console.log(props, metaProps)
  const onChange = (event: any) => {
    props.onChange?.({ data: props.value, unique: randomUUID })
  }
  return (
    <FieldContainer>
      <FieldLabel>{props.field.label}</FieldLabel>
      <FieldDescription id={`${props.field.path}-description`}>{props.field.description}</FieldDescription>

      <Stack>
        <TextArea
          id={props.field.path}
          aria-describedby={props.field.description === null ? undefined : `${props.field.path}-description`}
          readOnly={props.onChange === undefined}
          autoFocus={props.autoFocus}
          onChange={onChange}
          value={JSON.stringify(props.value)}
        />
      </Stack>
    </FieldContainer>
  )
}