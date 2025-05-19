import type { BasicFormField, ComponentSchema, ConditionalField } from '../../api'

export function conditional<
  DiscriminantField extends BasicFormField<string> | BasicFormField<boolean>,
  ConditionalValues extends {
    [Key in `${ReturnType<DiscriminantField['defaultValue']>}`]: ComponentSchema
  },
>(
  discriminant: DiscriminantField,
  values: ConditionalValues
): ConditionalField<DiscriminantField, ConditionalValues> {
  return {
    kind: 'conditional',
    discriminant,
    values: values,
  }
}
