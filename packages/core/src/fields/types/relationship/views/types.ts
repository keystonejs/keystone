import type { FieldController } from '../../../../types'

export type SingleRelationshipValue = {
  kind: 'one'
  id: null | string
  initialValue: { label: string, id: string } | null
  value: { label: string, id: string } | null
}
export type ManyRelationshipValue = {
  kind: 'many'
  id: null | string
  initialValue: { label: string, id: string }[]
  value: { label: string, id: string }[]
}
export type CountRelationshipValue = {
  kind: 'count'
  id: null | string
  count: number
}

export type ManyValueState = {
  kind: 'many'
  value: { label: string, id: string, data?: Record<string, any> }[]
  onChange(value: { label: string, id: string, data: Record<string, any> }[]): void
}
export type SingleValueState = {
  kind: 'one'
  value: { label: string, id: string, data?: Record<string, any> } | null
  onChange(value: { label: string, id: string, data: Record<string, any> } | null): void
}

export type RelationshipController = FieldController<
  ManyRelationshipValue | SingleRelationshipValue | CountRelationshipValue,
  string
> & {
  display: 'select' | 'count'
  listKey: string
  refListKey: string
  refFieldKey?: string
  refLabelField: string
  refSearchFields: string[]
  hideCreate: boolean
  many: boolean
}