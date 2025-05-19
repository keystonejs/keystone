import type { ComponentSchema, ObjectField, ObjectFieldOptions } from '../../api.tsx'

export function object<Fields extends Record<string, ComponentSchema>>(
  fields: Fields,
  opts?: ObjectFieldOptions
): ObjectField<Fields> {
  return { ...opts, kind: 'object', fields }
}
