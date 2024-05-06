/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core'
import { FieldProps } from '@keystone-6/core/types'
import { FieldContainer, FieldDescription, FieldLabel } from '@keystone-ui/fields'
import { controller } from '@keystone-6/core/fields/types/relationship/views'
import useFieldProps from '../useFieldProps'
import { useKeystone } from '@keystone-6/core/admin-ui/context'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'
import { useEffect, useState } from 'react'

export const Field = (props: FieldProps<typeof controller>) => {
  const metaProps = useFieldProps(props.field.listKey, props.field.path)
  console.log(props, metaProps)
  return (
    <FieldContainer>
      <FieldLabel>{props.field.label}</FieldLabel>
      <FieldDescription id={`${props.field.path}-description`}>{props.field.description}</FieldDescription>
    </FieldContainer>
  )
}