'use client'

import { Field as KeystarField } from '@keystar/ui/field'
import { Text } from '@keystar/ui/typography'
import type { CellComponent, FieldProps } from '@keystone-6/core/types'

import { Editor } from './editor'
import { type controller } from './views-shared'

export { controller } from './views-shared'

const noop = () => {}

export function Field(props: FieldProps<typeof controller>) {
  const { field, onChange, value } = props

  return (
    <KeystarField label={field.label} description={field.description}>
      {inputProps => <Editor {...inputProps} onChange={onChange ?? noop} value={value} />}
    </KeystarField>
  )
}

export const Cell: CellComponent<typeof controller> = ({ value }) => {
  if (!value) return null
  return <Text>{JSON.stringify(value.content, null, 2).slice()}</Text>
}

export const allowedExportsOnCustomViews = ['components']
