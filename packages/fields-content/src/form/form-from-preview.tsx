import type { MemoExoticComponent, ReactElement, ReactNode } from 'react'
import { memo } from 'react'

import type { ComponentSchema, GenericPreviewProps, ReadonlyPropPath } from './api'
import { PathContextProvider } from './fields/text/path-context'
import { ObjectFieldInput } from './fields/object/ui'
import { ConditionalFieldInput } from './fields/conditional/ui'
import { ArrayFieldInput } from './fields/array/ui'

export type ExtraFieldInputProps = {
  autoFocus: boolean
  forceValidation: boolean
  omitFieldAtPath?: string[]
}

function getInputComponent(schema: ComponentSchema): any {
  if (schema.kind === 'object') {
    return schema.Input ?? ObjectFieldInput
  }
  if (schema.kind === 'conditional') {
    return schema.Input ?? ConditionalFieldInput
  }
  if (schema.kind === 'array') {
    return schema.Input ?? ArrayFieldInput
  }
  return schema.Input
}

export const InnerFormValueContentFromPreviewProps: MemoExoticComponent<
  (
    props: GenericPreviewProps<ComponentSchema, unknown> & {
      autoFocus?: boolean
      forceValidation?: boolean
      // array fields are not supported because the use case for this (omitting content fields) is not used
      omitFieldAtPath?: string[]
    }
  ) => ReactNode
> = memo(function InnerFormValueContentFromPreview(props) {
  if (props.omitFieldAtPath?.length === 0) return null
  let Input = getInputComponent(props.schema)
  return (
    <Input
      {...(props as any)}
      autoFocus={!!props.autoFocus}
      forceValidation={!!props.forceValidation}
    />
  )
})

const emptyArray: ReadonlyPropPath = []
export const FormValueContentFromPreviewProps: MemoExoticComponent<
  (
    props: GenericPreviewProps<ComponentSchema, unknown> & {
      autoFocus?: boolean
      forceValidation?: boolean
    }
  ) => ReactElement
> = memo(function FormValueContentFromPreview({ ...props }) {
  let Input = getInputComponent(props.schema)
  return (
    <PathContextProvider value={emptyArray}>
      <Input
        {...(props as any)}
        autoFocus={!!props.autoFocus}
        forceValidation={!!props.forceValidation}
      />
    </PathContextProvider>
  )
})
