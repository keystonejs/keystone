import React from 'react'
import { Badge } from '@keystar/ui/badge'
import { Checkbox } from '@keystar/ui/checkbox'
import { Text } from '@keystar/ui/typography'

import type {
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '../../../../types'

export function Field ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) {
  return (
    <Checkbox
      autoFocus={autoFocus}
      isReadOnly={onChange == null}
      isSelected={value}
      onChange={onChange}
    >
      <Text>{field.label}</Text>
      {field.description && <Text slot="description">{field.description}</Text>}
    </Checkbox>
  )
}

export const Cell: CellComponent = ({ item, field }) => {
  const value = !!item[field.path]
  return (
    <Badge tone={value ? 'positive' : 'critical'}>
      <Text>{value ? 'true' : 'false'}</Text>
    </Badge>
  )
}

type CheckboxController = FieldController<boolean, boolean>

export const controller = (
  config: FieldControllerConfig<{ defaultValue: boolean }>
): CheckboxController => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: config.fieldMeta.defaultValue,
    deserialize (item) {
      const value = item[config.path]
      return typeof value === 'boolean' ? value : false
    },
    serialize (value) {
      return {
        [config.path]: value,
      }
    },
    filter: {
      Filter (props) {
        const { autoFocus, context, typeLabel, onChange, value, type, ...otherProps } = props
        return (
          <Checkbox autoFocus={autoFocus} onChange={onChange} isSelected={value} {...otherProps}>
            {typeLabel} {config.label.toLocaleLowerCase()}
          </Checkbox>
        )
      },
      Label ({ label, type, value }) {
        return `${label.toLowerCase()} ${value ? 'true' : 'false'}`
      },
      graphql ({ type, value }) {
        return {
          [config.path]: {
            equals: type === 'not' ? !value : value,
          }
        }
      },
      types: {
        is: {
          label: 'Is',
          initialValue: true,
        },
        not: {
          label: 'Is not',
          initialValue: true,
        },
      },
    },
  }
}
