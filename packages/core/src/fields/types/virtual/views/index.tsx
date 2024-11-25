/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core'
import { TextField } from '@keystar/ui/text-field'
import { Text } from '@keystar/ui/typography'
import {
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from '../../../../types'

function stringify (value: unknown) {
  if (typeof value === 'string') return value
  if (value === undefined || value === null) return ''
  if (typeof value !== 'object') return JSON.stringify(value)

  const omitTypename = (key: string, value: any) => (key === '__typename' ? undefined : value)
  const dataWithoutTypename = JSON.parse(JSON.stringify(value), omitTypename)
  return JSON.stringify(dataWithoutTypename, null, 2)
}

export function Field (props: FieldProps<typeof controller>) {
  const { autoFocus, field, value } = props
  if (value === createViewValue) return null

  return <TextField
    autoFocus={autoFocus}
    description={field.description}
    label={field.label}
    isReadOnly={true}
    value={stringify(value)}
  />
}

export const Cell: CellComponent<typeof controller> = ({ value }) => {
  return value != null ? <Text>{stringify(value)}</Text> : null
}

const createViewValue = Symbol('create view virtual field value')

export function controller (
  config: FieldControllerConfig<{ query: string }>
): FieldController<unknown> {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: `${config.path}${config.fieldMeta.query}`,
    defaultValue: createViewValue,
    deserialize: data => data[config.path],
    serialize: () => ({}),
  }
}
