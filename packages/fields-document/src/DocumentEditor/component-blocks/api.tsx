import { g } from '@keystone-6/core'

import type { HTMLAttributes, ReactElement, ReactNode } from 'react'
import { isValidURL } from '../isValidURL'
import type {
  BlockFormattingConfig,
  ChildField,
  ConditionalField,
  ComponentBlock,
  ComponentSchema,
  GenericPreviewProps,
  InlineMarksConfig,
  ObjectField,
  RelationshipField,
  FormField,
  ArrayField,
} from './api-shared'
import {
  makeIntegerFieldInput,
  makeMultiselectFieldInput,
  makeSelectFieldInput,
  makeUrlFieldInput,
  Checkbox,
  Text,
  TextField,
  TextArea,
} from '#fields-ui'

export * from './api-shared'

type InputArgs<T> = {
  value: T
  onChange(value: T): void
  autoFocus: boolean
}

export const fields = {
  text({
    label,
    defaultValue = '',
    displayMode,
  }: {
    label: string
    defaultValue?: string
    displayMode?: 'input' | 'textarea'
  }): FormField<string, undefined> {
    return {
      kind: 'form' as const,
      Input({ value, onChange, autoFocus }: InputArgs<string>) {
        if (displayMode === 'textarea') {
          return (
            <TextArea
              autoFocus={autoFocus}
              label={label}
              onChange={x => onChange?.(x)}
              value={value}
            />
          )
        }
        return (
          <TextField
            autoFocus={autoFocus}
            label={label}
            onChange={x => onChange?.(x)}
            value={value}
          />
        )
      },
      options: undefined,
      defaultValue,
      validate(value: unknown) {
        return typeof value === 'string'
      },
      graphql: {
        input: g.String,
        output: g.field({
          type: g.String,
        }),
      },
    }
  },
  integer({
    label,
    defaultValue = 0,
  }: {
    label: string
    defaultValue?: number
  }): FormField<number, undefined> {
    const validate = (value: unknown) => {
      return typeof value === 'number' && Number.isFinite(value)
    }
    return {
      kind: 'form' as const,
      Input: makeIntegerFieldInput({ label, validate }),
      options: undefined,
      defaultValue,
      validate,
      graphql: {
        input: g.Int,
        output: g.field({
          type: g.Int,
        }),
      },
    }
  },
  url({
    label,
    defaultValue = '',
  }: {
    label: string
    defaultValue?: string
  }): FormField<string, undefined> {
    const validate = (value: unknown) => {
      return typeof value === 'string' && (value === '' || isValidURL(value))
    }
    return {
      kind: 'form' as const,
      Input: makeUrlFieldInput({ label, validate }),
      options: undefined,
      defaultValue,
      validate,
      graphql: {
        input: g.String,
        output: g.field({
          type: g.String,
        }),
      },
    }
  },
  select<const Option extends { label: string; value: string }>({
    label,
    options,
    defaultValue,
  }: {
    label: string
    options: readonly Option[]
    defaultValue: Option['value']
  }): FormField<Option['value'], readonly Option[]> {
    const optionValuesSet = new Set(options.map(x => x.value))
    if (!optionValuesSet.has(defaultValue))
      throw new Error(
        `A defaultValue of ${defaultValue} was provided to a select field but it does not match the value of one of the options provided`
      )

    return {
      kind: 'form' as const,
      Input: makeSelectFieldInput({ label, options }),
      options,
      defaultValue,
      validate(value: unknown) {
        return typeof value === 'string' && optionValuesSet.has(value)
      },
      graphql: {
        input: g.String,
        output: g.field({
          type: g.String,
          // TODO: FIXME why is this required
          resolve({ value }) {
            return value
          },
        }),
      },
    }
  },
  multiselect<const Option extends { label: string; value: string }>({
    label,
    options,
    defaultValue,
  }: {
    label: string
    options: readonly Option[]
    defaultValue: readonly Option['value'][]
  }): FormField<readonly Option['value'][], readonly Option[]> {
    const valuesToOption = new Map(options.map(x => [x.value, x]))
    return {
      kind: 'form' as const,
      Input: makeMultiselectFieldInput({ label, options }),
      options,
      defaultValue,
      validate(value: unknown) {
        return (
          Array.isArray(value) &&
          value.every(value => typeof value === 'string' && valuesToOption.has(value))
        )
      },
      graphql: {
        input: g.list(g.nonNull(g.String)),
        output: g.field({
          type: g.list(g.nonNull(g.String)),
          // TODO: why is this required
          resolve({ value }) {
            return value
          },
        }),
      },
    }
  },
  checkbox({
    label,
    defaultValue = false,
  }: {
    label: string
    defaultValue?: boolean
  }): FormField<boolean, undefined> {
    return {
      kind: 'form' as const,
      Input({ value, onChange, autoFocus }: InputArgs<boolean>) {
        return (
          <Checkbox
            autoFocus={autoFocus}
            isReadOnly={onChange == null}
            isSelected={value}
            onChange={onChange}
          >
            <Text>{label}</Text>
          </Checkbox>
        )
      },
      options: undefined,
      defaultValue,
      validate(value: unknown) {
        return typeof value === 'boolean'
      },
      graphql: {
        input: g.Boolean,
        output: g.field({ type: g.Boolean }),
      },
    }
  },
  empty() {
    return {
      kind: 'form' as const,
      Input() {
        return null
      },
      options: undefined,
      defaultValue: null,
      validate(value: unknown) {
        return value === null || value === undefined
      },
    }
  },
  child(
    options:
      | {
          kind: 'block'
          placeholder: string
          formatting?: BlockFormattingConfig | 'inherit'
          dividers?: 'inherit'
          links?: 'inherit'
          relationships?: 'inherit'
          componentBlocks?: 'inherit'
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
      kind: 'child' as const,
      options:
        options.kind === 'block'
          ? {
              kind: 'block' as const,
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
              componentBlocks: options.componentBlocks,
            }
          : {
              kind: 'inline' as const,
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
  object<Fields extends Record<string, ComponentSchema>>(fields: Fields) {
    return {
      kind: 'object' as const,
      fields,
    }
  },
  conditional<
    DiscriminantField extends { defaultValue: any },
    ConditionalValues extends {
      [Key in `${DiscriminantField['defaultValue']}`]: ComponentSchema
    },
  >(
    discriminant: DiscriminantField,
    values: ConditionalValues
  ): ConditionalField<DiscriminantField, ConditionalValues> {
    return {
      kind: 'conditional' as const,
      discriminant,
      values,
    }
  },
  relationship<Many extends boolean | undefined = false>({
    listKey,
    label,
    labelField,
    selection,
    many,
  }: {
    listKey: string
    label: string
    /** The label field to use for this relationship when showing the select */
    labelField?: string
    /** The GraphQL selection to use for this relationship when hydrating .data */
    selection?: string
  } & (Many extends undefined | false ? { many?: Many } : { many: Many })): RelationshipField<
    Many extends true ? true : false
  > {
    return {
      kind: 'relationship' as const,
      listKey,
      label,
      labelField: labelField ?? null,
      selection: selection ?? null,
      many: (many ? true : false) as any,
    }
  },
  array<ElementField extends ComponentSchema>(
    element: ElementField,
    opts?: {
      itemLabel?: (props: GenericPreviewProps<ElementField, unknown>) => string
      label?: string
    }
  ): ArrayField<ElementField> {
    return {
      kind: 'array' as const,
      element,
      itemLabel: opts?.itemLabel,
      label: opts?.label,
    }
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
  },
>(
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

export function NotEditable({ children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <span style={{ userSelect: 'none' }} contentEditable={false} {...props}>
      {children}
    </span>
  )
}
