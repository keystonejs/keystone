import type { FieldController } from '../../../../types'

export type RelationshipValue = {
  id: string | number
  label: string | null
  data?: Record<string, unknown>
  built?: true
}

export type SingleRelationshipValue = {
  kind: 'one'
  id: null | string
  initialValue: RelationshipValue | null
  value: RelationshipValue | null
}

export type ManyRelationshipValue = {
  kind: 'many'
  id: null | string
  initialValue: RelationshipValue[]
  value: RelationshipValue[]
}

export type CountRelationshipValue = {
  kind: 'count'
  id: null | string
  count: number
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
