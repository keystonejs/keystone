/** @jsxRuntime classic */
/** @jsx jsx */
import { graphql } from '@keystone-6/core'
import { jsx } from '@keystone-ui/core'
import {
  FieldContainer,
  FieldLabel,
  Select,
  TextInput,
  Checkbox,
  MultiSelect,
} from '@keystone-ui/fields'
import {
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  useState
} from 'react'
import { isValidURL } from '../isValidURL'
import {
  type ArrayField,
  type BlockFormattingConfig,
  type ChildField,
  type ComponentBlock,
  type ComponentSchema,
  type ConditionalField,
  type FormField,
  type FormFieldWithGraphQLField,
  type GenericPreviewProps,
  type InlineMarksConfig,
  type ObjectField,
  type RelationshipField,
} from './api-shared'

export * from './api-shared'

export const fields = {
  text ({
    label,
    defaultValue = '',
  }: {
    label: string
    defaultValue?: string
  }): FormFieldWithGraphQLField<string, undefined> {
    return {
      kind: 'form',
      Input ({ value, onChange, autoFocus }) {
        return (
          <FieldContainer>
            <FieldLabel>{label}</FieldLabel>
            <TextInput
              autoFocus={autoFocus}
              value={value}
              onChange={event => {
                onChange(event.target.value)
              }}
            />
          </FieldContainer>
        )
      },
      options: undefined,
      defaultValue,
      validate (value) {
        return typeof value === 'string'
      },
      graphql: {
        input: graphql.String,
        output: graphql.field({ type: graphql.String }),
      },
    }
  },
  integer ({
    label,
    defaultValue = 0,
  }: {
    label: string
    defaultValue?: number
  }): FormFieldWithGraphQLField<number, undefined> {
    const validate = (value: unknown) => {
      return typeof value === 'number' && Number.isFinite(value)
    }
    return {
      kind: 'form',
      Input ({ value, onChange, autoFocus, forceValidation }) {
        const [blurred, setBlurred] = useState(false)
        const [inputValue, setInputValue] = useState(String(value))
        const showValidation = forceValidation || (blurred && !validate(value))

        return (
          <FieldContainer>
            <FieldLabel>{label}</FieldLabel>
            <TextInput
              onBlur={() => setBlurred(true)}
              autoFocus={autoFocus}
              value={inputValue}
              onChange={event => {
                const raw = event.target.value
                setInputValue(raw)
                if (/^[+-]?\d+$/.test(raw)) {
                  onChange(Number(raw))
                } else {
                  onChange(NaN)
                }
              }}
            />
            {showValidation && <span css={{ color: 'red' }}>Please specify an integer</span>}
          </FieldContainer>
        )
      },
      options: undefined,
      defaultValue,
      validate,
      graphql: {
        input: graphql.Int,
        output: graphql.field({ type: graphql.Int }),
      },
    }
  },
  url ({
    label,
    defaultValue = '',
  }: {
    label: string
    defaultValue?: string
  }): FormFieldWithGraphQLField<string, undefined> {
    const validate = (value: unknown) => {
      return typeof value === 'string' && (value === '' || isValidURL(value))
    }
    return {
      kind: 'form',
      Input ({ value, onChange, autoFocus, forceValidation }) {
        const [blurred, setBlurred] = useState(false)
        const showValidation = forceValidation || (blurred && !validate(value))
        return (
          <FieldContainer>
            <FieldLabel>{label}</FieldLabel>
            <TextInput
              onBlur={() => setBlurred(true)}
              autoFocus={autoFocus}
              value={value}
              onChange={event => {
                onChange(event.target.value)
              }}
            />
            {showValidation && <span css={{ color: 'red' }}>Please provide a valid URL</span>}
          </FieldContainer>
        )
      },
      options: undefined,
      defaultValue,
      validate,
      graphql: {
        input: graphql.String,
        output: graphql.field({ type: graphql.String }),
      },
    }
  },
  select<Option extends { label: string, value: string }> ({
    label,
    options,
    defaultValue,
  }: {
    label: string
    options: readonly Option[]
    defaultValue: Option['value']
  }): FormFieldWithGraphQLField<Option['value'], readonly Option[]> {
    const optionValuesSet = new Set(options.map(x => x.value))
    if (!optionValuesSet.has(defaultValue)) {
      throw new Error(
        `A defaultValue of ${defaultValue} was provided to a select field but it does not match the value of one of the options provided`
      )
    }
    return {
      kind: 'form',
      Input ({ value, onChange, autoFocus }) {
        return (
          <FieldContainer>
            <FieldLabel>{label}</FieldLabel>
            <Select
              autoFocus={autoFocus}
              value={options.find(option => option.value === value) || null}
              onChange={option => {
                if (option) {
                  onChange(option.value)
                }
              }}
              options={options}
            />
          </FieldContainer>
        )
      },
      options,
      defaultValue,
      validate (value) {
        return typeof value === 'string' && optionValuesSet.has(value)
      },
      graphql: {
        input: graphql.String,
        output: graphql.field({
          type: graphql.String,
          // TODO: investigate why this resolve is required here
          resolve ({ value }) {
            return value
          },
        }),
      },
    }
  },
  multiselect<Option extends { label: string, value: string }> ({
    label,
    options,
    defaultValue,
  }: {
    label: string
    options: readonly Option[]
    defaultValue: readonly Option['value'][]
  }): FormFieldWithGraphQLField<readonly Option['value'][], readonly Option[]> {
    const valuesToOption = new Map(options.map(x => [x.value, x]))
    return {
      kind: 'form',
      Input ({ value, onChange, autoFocus }) {
        return (
          <FieldContainer>
            <FieldLabel>{label}</FieldLabel>
            <MultiSelect
              autoFocus={autoFocus}
              value={value.map(x => valuesToOption.get(x)!)}
              options={options}
              onChange={options => {
                onChange(options.map(x => x.value))
              }}
            />
          </FieldContainer>
        )
      },
      options,
      defaultValue,
      validate (value) {
        return (
          Array.isArray(value) &&
          value.every(value => typeof value === 'string' && valuesToOption.has(value))
        )
      },
      graphql: {
        input: graphql.list(graphql.nonNull(graphql.String)),
        output: graphql.field({
          type: graphql.list(graphql.nonNull(graphql.String)),
          // TODO: investigate why this resolve is required here
          resolve ({ value }) {
            return value
          },
        }),
      },
    }
  },
  checkbox ({
    label,
    defaultValue = false,
  }: {
    label: string
    defaultValue?: boolean
  }): FormFieldWithGraphQLField<boolean, undefined> {
    return {
      kind: 'form',
      Input ({ value, onChange, autoFocus }) {
        return (
          <FieldContainer>
            <Checkbox
              checked={value}
              autoFocus={autoFocus}
              onChange={event => {
                onChange(event.target.checked)
              }}
            >
              {label}
            </Checkbox>
          </FieldContainer>
        )
      },
      options: undefined,
      defaultValue,
      validate (value) {
        return typeof value === 'boolean'
      },
      graphql: {
        input: graphql.Boolean,
        output: graphql.field({ type: graphql.Boolean }),
      },
    }
  },
  empty (): FormField<null, undefined> {
    return {
      kind: 'form',
      Input () {
        return null
      },
      options: undefined,
      defaultValue: null,
      validate (value) {
        return value === null || value === undefined
      },
    }
  },
  child (
    options:
      | {
          kind: 'block'
          placeholder: string
          formatting?: BlockFormattingConfig | 'inherit'
          dividers?: 'inherit'
          links?: 'inherit'
          relationships?: 'inherit'
        }
      | {
          kind: 'inline'
          placeholder: string
          formatting?:
            | 'inherit'
            | {
                inlineMarks?: InlineMarksConfig
                softBreaks?: 'inherit'
              }
          links?: 'inherit'
          relationships?: 'inherit'
        }
  ): ChildField {
    return {
      kind: 'child',
      options:
        options.kind === 'block'
          ? {
              kind: 'block',
              placeholder: options.placeholder,
              dividers: options.dividers,
              formatting:
                options.formatting === 'inherit'
                  ? {
                      blockTypes: 'inherit',
                      headingLevels: 'inherit',
                      inlineMarks: 'inherit',
                      listTypes: 'inherit',
                      alignment: 'inherit',
                      softBreaks: 'inherit',
                    }
                  : options.formatting,
              links: options.links,
              relationships: options.relationships,
            }
          : {
              kind: 'inline',
              placeholder: options.placeholder,
              formatting:
                options.formatting === 'inherit'
                  ? { inlineMarks: 'inherit', softBreaks: 'inherit' }
                  : options.formatting,
              links: options.links,
              relationships: options.relationships,
            },
    }
  },
  object<Fields extends Record<string, ComponentSchema>> (fields: Fields): ObjectField<Fields> {
    return { kind: 'object', fields }
  },
  conditional<
    DiscriminantField extends FormField<string | boolean, any>,
    ConditionalValues extends {
      [Key in `${DiscriminantField['defaultValue']}`]: ComponentSchema
    }
  > (
    discriminant: DiscriminantField,
    values: ConditionalValues
  ): ConditionalField<DiscriminantField, ConditionalValues> {
    if (
      (discriminant.validate('true') || discriminant.validate('false')) &&
      (discriminant.validate(true) || discriminant.validate(false))
    ) {
      throw new Error(
        'The discriminant of a conditional field only supports string values, or boolean values, not both.'
      )
    }
    return {
      kind: 'conditional',
      discriminant,
      values: values,
    }
  },
  relationship<Many extends boolean | undefined = false> ({
    listKey,
    selection,
    label,
    many,
  }: {
    listKey: string
    label: string
    selection?: string
  } & (Many extends undefined | false ? { many?: Many } : { many: Many })): RelationshipField<
    Many extends true ? true : false
  > {
    return {
      kind: 'relationship',
      listKey,
      selection,
      label,
      many: (many ? true : false) as any,
    }
  },
  array<ElementField extends ComponentSchema> (
    element: ElementField,
    opts?: {
      itemLabel?: (props: GenericPreviewProps<ElementField, unknown>) => string
      label?: string
    }
  ): ArrayField<ElementField> {
    return { kind: 'array', element, itemLabel: opts?.itemLabel, label: opts?.label }
  },
}

export type PreviewProps<Schema extends ComponentSchema> = GenericPreviewProps<Schema, ReactNode>

export type PreviewPropsForToolbar<Schema extends ComponentSchema> = GenericPreviewProps<
  Schema,
  undefined
>

export function component<
  Schema extends {
    [Key in any]: ComponentSchema
  }
> (
  options: {
    /** The preview component shown in the editor */
    preview: (props: PreviewProps<ObjectField<Schema>>) => ReactElement | null
    /** The schema for the props that the preview component, toolbar and rendered component will receive */
    schema: Schema
    /** The label to show in the insert menu and chrome around the block if chromeless is false */
    label: string
  } & (
    | {
        chromeless: true
        toolbar?: (props: {
          props: PreviewPropsForToolbar<ObjectField<Schema>>
          onRemove(): void
        }) => ReactElement
      }
    | {
        chromeless?: false
        toolbar?: (props: {
          props: PreviewPropsForToolbar<ObjectField<Schema>>
          onShowEditMode(): void
          onRemove(): void
        }) => ReactElement
      }
  )
): ComponentBlock<Schema> {
  return options as any
}

export const NotEditable = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <span css={{ userSelect: 'none' }} contentEditable={false} {...props}>
    {children}
  </span>
)
