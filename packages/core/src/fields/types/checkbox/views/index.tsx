import { Checkbox } from '@keystar/ui/checkbox'
import { Icon } from '@keystar/ui/icon'
import { checkIcon } from '@keystar/ui/icon/icons/checkIcon'
import { Text, VisuallyHidden } from '@keystar/ui/typography'

import type {
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
  SimpleFieldTypeInfo,
} from '../../../../types'
import { entriesTyped } from '../../../../lib/core/utils'

export function Field({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) {
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

export const Cell: CellComponent<typeof controller> = ({ value }) => {
  return value ? <Icon src={checkIcon} aria-label="true" /> : <VisuallyHidden>false</VisuallyHidden>
}

type CheckboxController = FieldController<
  boolean,
  boolean,
  SimpleFieldTypeInfo<'Boolean'>['inputs']['where']
>

export function controller(
  config: FieldControllerConfig<{ defaultValue: boolean }>
): CheckboxController {
  return {
    fieldKey: config.fieldKey,
    label: config.label,
    description: config.description,
    defaultValue: config.fieldMeta.defaultValue,
    deserialize(item) {
      const value = item[config.fieldKey]
      return typeof value === 'boolean' ? value : false
    },
    serialize(value) {
      return { [config.fieldKey]: value }
    },
    graphqlSelection: config.fieldKey,
    filter: {
      Filter(props) {
        const { autoFocus, context, typeLabel, onChange, value, type, ...otherProps } = props
        return (
          <Checkbox autoFocus={autoFocus} onChange={onChange} isSelected={value} {...otherProps}>
            {typeLabel} {config.label.toLocaleLowerCase()}
          </Checkbox>
        )
      },
      Label({ label, type, value }) {
        return `${label.toLowerCase()} ${value ? 'true' : 'false'}`
      },
      graphql({ type, value }) {
        return {
          [config.fieldKey]: {
            equals: type === 'not' ? !value : value,
          },
        }
      },
      parseGraphQL: value => {
        return entriesTyped(value).flatMap(([type, value]) => {
          if (value == null) return []
          if (type === 'equals') return { type: 'is', value }
          if (type === 'not') {
            if (value.equals == null) return []
            return { type: 'not', value: value.equals }
          }
          return []
        })
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
