import { Picker, Item } from '@keystar/ui/picker'
import { useFieldSpan } from '../context'

export function RelationshipFieldInput<Value extends string>(props: {
  value: Value
  onChange: (value: Value) => void
  autoFocus?: boolean
  label: string
  description?: string
  options: readonly { label: string; value: Value }[]
}) {
  const { listKey, label, description, filter, sort, many } = schema
  const list = useList(listKey)
  const formValue = (function () {
    if (many) {
      if (value !== null && !('length' in value)) throw TypeError('bad value')
      const manyValue =
        value === null
          ? []
          : value.map(x => ({
              id: x.id,
              label: x.label || x.id.toString(),
              data: x.data,
              built: undefined,
            }))
      return {
        kind: 'many' as const,
        id: '', // unused
        initialValue: manyValue,
        value: manyValue,
      }
    }

    if (value !== null && 'length' in value) throw TypeError('bad value')
    const oneValue = value
      ? {
          id: value.id,
          label: value.label || value.id.toString(),
          data: value.data,
          built: undefined,
        }
      : null
    return {
      kind: 'one' as const,
      id: '', // unused
      initialValue: oneValue,
      value: oneValue,
    }
  })()

  return (
    <RelationshipFieldView
      autoFocus={autoFocus}
      isRequired={false}
      field={{
        label,
        description: description ?? '',
        display: 'select',
        listKey: '?', // unused
        fieldKey: '?', // unused
        defaultValue: null as any, // unused
        deserialize: null as any, // unused
        serialize: null as any, // unused
        graphqlSelection: null as any, // unused

        // see relationship controller for these fields
        refListKey: list.key,
        many,
        hideCreate: true,
        refLabelField: list.labelField,
        refSearchFields: list.initialSearchFields,
        columns: list.initialColumns,
        initialSort: null,
        selectFilter: filter || null,
        selectSort: sort ?? list.initialSort,
      }}
      onChange={val => {
        if (val.kind === 'count') return // shouldnt happen
        const { value } = val
        if (value === null) {
          onChange(null)
          return
        }
        if (Array.isArray(value)) {
          onChange(value.map(x => ({ id: x.id, label: x.label })))
          return
        }
        onChange({ id: value.id, label: value.label })
      }}
      value={formValue}
      itemValue={{}}
    />
  )
}
