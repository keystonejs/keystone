import React from 'react'

import { TextField } from '@keystar/ui/text-field'

import type {
  FieldController,
  FieldControllerConfig,
  IdFieldConfig,
} from '../../types'

export function Field () {
  return null
}

export function controller (
  config: FieldControllerConfig<IdFieldConfig>
): FieldController<void, string> {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: undefined,
    deserialize: () => {},
    serialize: () => ({}),
    filter: {
      Filter (props) {
        const { autoFocus, context, onChange, type, typeLabel, value, ...otherProps } = props
        const labelProps = context === 'add'
          ? { label: config.label, description: typeLabel }
          : { label: typeLabel }

        return (
          <TextField
            {...otherProps}
            {...labelProps}
            autoFocus={autoFocus}
            onChange={onChange}
            value={value}
          />
        )
      },

      graphql: ({ type, value }) => {
        if (type === 'not') return { [config.path]: { not: { equals: value } } }
        const valueWithoutWhitespace = value.replace(/\s/g, '')
        const key = type === 'is' ? 'equals' : type === 'not_in' ? 'notIn' : type

        return {
          [config.path]: {
            [key]: ['in', 'not_in'].includes(type)
              ? valueWithoutWhitespace.split(',')
              : valueWithoutWhitespace,
          },
        }
      },
      Label ({ label, value, type }) {
        let renderedValue = value.replace(/\s/g, '')
        if (['in', 'not_in'].includes(type)) {
          renderedValue = value.split(',').join(', ')
        }
        return `${label.toLowerCase()}: ${renderedValue}`
      },
      types: {
        is: { label: 'Is exactly', initialValue: '' },
        not: { label: 'Is not exactly', initialValue: '' },
        gt: { label: 'Is greater than', initialValue: '' },
        lt: { label: 'Is less than', initialValue: '' },
        gte: { label: 'Is greater than or equal to', initialValue: '' },
        lte: { label: 'Is less than or equal to', initialValue: '' },
        in: { label: 'Is one of', initialValue: '' },
        not_in: { label: 'Is not one of', initialValue: '' },
      },
    },
  }
}
