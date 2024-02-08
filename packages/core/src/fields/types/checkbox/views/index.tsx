/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core'
import { Checkbox, FieldContainer, FieldLabel, FieldDescription } from '@keystone-ui/fields'
import {
  type CardValueComponent,
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from '../../../../types'
import { CellContainer } from '../../../../admin-ui/components'

export function Field ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) {
  const { fields, typography, spacing } = useTheme()
  return (
    <FieldContainer>
      <Checkbox
        autoFocus={autoFocus}
        disabled={onChange === undefined}
        onChange={event => {
          onChange?.(event.target.checked)
        }}
        checked={value}
        aria-describedby={field.description === null ? undefined : `${field.path}-description`}
      >
        <span
          css={{
            color: fields.labelColor,
            display: 'block',
            fontWeight: typography.fontWeight.semibold,
            marginBottom: spacing.xsmall,
            minWidth: 120,
          }}
        >
          {field.label}
        </span>
        <FieldDescription id={`${field.path}-description`}>{field.description}</FieldDescription>
      </Checkbox>
    </FieldContainer>
  )
}

export const Cell: CellComponent = ({ item, field }) => {
  const value = !!item[field.path]
  return (
    <CellContainer>
      <Checkbox disabled checked={value} size="small">
        <span css={{}}>{value ? 'True' : 'False'}</span>
      </Checkbox>
    </CellContainer>
  )
}

export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {item[field.path] + ''}
    </FieldContainer>
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
      Filter () {
        return null
      },
      graphql ({ type }) {
        return { [config.path]: { equals: type === 'is' } }
      },
      Label ({ label }) {
        return label.toLowerCase()
      },
      types: {
        is: {
          label: 'is',
          initialValue: true,
        },
        not: {
          label: 'is not',
          initialValue: true,
        },
      },
    },
  }
}
