import type { ComponentSchema, GenericPreviewProps, ArrayField } from '../../api'

export function array<ElementField extends ComponentSchema>(
  element: ElementField,
  opts?: {
    label?: string
    description?: string
    itemLabel?: (val: GenericPreviewProps<ElementField, unknown>) => string
    validation?: {
      length?: {
        min?: number
        max?: number
      }
    }
  }
): ArrayField<ElementField> {
  return {
    kind: 'array',
    element,
    label: opts?.label ?? 'Items',
    description: opts?.description,
    itemLabel: opts?.itemLabel,
    validation: opts?.validation,
  }
}
