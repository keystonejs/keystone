import type {
  ComponentSchema,
  GenericPreviewProps,
  ArrayField,
  ConditionalField,
  BasicFormField} from '../../api';
import {
  fields,
} from '../../api'
import { select as selectField } from '../select'
import { BlocksFieldInput } from '#field-ui/blocks'

export function blocks<Schemas extends Record<string, ComponentSchema>>(
  blocks: {
    [K in keyof Schemas]: {
      label: string
      itemLabel?: (props: GenericPreviewProps<Schemas[K], unknown>) => string
      schema: Schemas[K]
    }
  },
  opts: {
    label: string
    description?: string
    validation?: {
      length?: {
        min?: number
        max?: number
      }
    }
  }
): ArrayField<ConditionalField<BasicFormField<keyof Schemas & string>, Schemas>> {
  const entries = Object.entries(blocks)
  if (!entries.length) {
    throw new Error('fields.blocks must have at least one entry')
  }
  const select = selectField<{
    label: string
    value: keyof Schemas & string
  }>({
    label: 'Kind',
    defaultValue: entries[0][0],
    options: Object.entries(blocks).map(([key, { label }]) => ({
      label,
      value: key,
    })),
  })
  const element = fields.conditional<BasicFormField<keyof Schemas & string>, Schemas>(
    select,
    Object.fromEntries(entries.map(([key, { schema }]) => [key, schema])) as Schemas
  )
  return {
    ...fields.array(element, {
      label: opts.label,
      description: opts.description,
      validation: opts.validation,
      itemLabel(props) {
        const kind = props.discriminant
        const block = blocks[kind as keyof typeof blocks]
        if (!block.itemLabel) return block.label
        return block.itemLabel(props.value as any)
      },
    }),
    Input: BlocksFieldInput as any,
  }
}
