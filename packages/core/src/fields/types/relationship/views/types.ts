import type { FieldController } from '../../../../types'

export type RelationshipValue = {
  id: string
  label: string | null
  data?: Record<string, unknown>
  built: undefined | boolean
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
  id: string
  count: number
}

export type RelationshipController = FieldController<
  ManyRelationshipValue | SingleRelationshipValue | CountRelationshipValue,
  string[] | (string | null) // | number // TODO: count
> & {
  display: 'select' | 'count' | 'table'
  listKey: string
  refListKey: string
  refFieldKey?: string
  refLabelField: string
  refSearchFields: string[]
  hideCreate: boolean
  many: boolean
  columns: string[] | null
  initialSort: { field: string; direction: 'ASC' | 'DESC' } | null
  selectFilter: Record<string, any> | null
  sort: { field: string; direction: 'ASC' | 'DESC' } | null
}
