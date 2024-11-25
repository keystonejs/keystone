import React, { Fragment, useState } from 'react'

import { DialogContainer } from '@keystar/ui/dialog'
import { VStack } from '@keystar/ui/layout'
import { TextLink } from '@keystar/ui/link'
import { TagGroup, Item } from '@keystar/ui/tag'
import { TextField } from '@keystar/ui/text-field'
import { Numeral, Text } from '@keystar/ui/typography'

import type {
  CellComponent,
  FieldControllerConfig,
  FieldProps,
} from '../../../../types'
import { useList } from '../../../../admin-ui/context'
import { CreateItemDialog } from '../../../../admin-ui/components'

import { ContextualActions } from './ContextualActions'
import { ComboboxMany } from './ComboboxMany'
import { ComboboxSingle } from './ComboboxSingle'
import type { RelationshipController } from './types'

export function Field (props: FieldProps<typeof controller>) {
  const { field, value, autoFocus, onChange } = props

  const foreignList = useList(field.refListKey)
  const [dialogIsOpen, setDialogOpen] = useState(false)

  if (value.kind === 'count') {
    return (
      <TextField
        autoFocus={autoFocus}
        isReadOnly
        label={field.label}
        value={value.count.toString()}
        width="alias.singleLineWidth"
      />
    )
  }

  return (
    <Fragment>
      <VStack gap="medium">
        <ContextualActions onAdd={() => setDialogOpen(true)} {...props}>
          {value.kind === 'many' ? (
            <ComboboxMany
              key={field.path}
              autoFocus={autoFocus}
              label={field.label}
              description={field.description || undefined}
              isReadOnly={onChange === undefined}
              labelField={field.refLabelField}
              searchFields={field.refSearchFields}
              list={foreignList}
              state={{
                kind: 'many',
                value: value.value,
                onChange(newItems) {
                  onChange?.({ ...value, value: newItems })
                },
              }}
            />
          ) : (
            <ComboboxSingle
              key={field.path}
              autoFocus={autoFocus}
              label={field.label}
              description={field.description || undefined}
              isReadOnly={onChange === undefined}
              labelField={field.refLabelField}
              searchFields={field.refSearchFields}
              list={foreignList}
              state={{
                kind: 'one',
                value: value.value,
                onChange(newVal) {
                  onChange?.({ ...value, value: newVal })
                },
              }}
            />
          )}
        </ContextualActions>

        {value.kind === 'many' && (
          <TagGroup
            aria-label={`related ${foreignList.plural}`}
            items={value.value.map(item => ({
              id: item.id,
              label: item.label,
              href: `/${foreignList.path}/${item.id}`,
            }))}
            maxRows={2}
            onRemove={keys => {
              const key = keys.values().next().value
              const item = key
                ? value.value.find(item => item.id === key)
                : null
              if (item) {
                onChange?.({
                  ...value,
                  value: value.value.filter(i => i.id !== item.id),
                })
              }
            }}
            renderEmptyState={() => (
              <Text color="neutralSecondary" size="small">
                No related {foreignList.plural.toLowerCase()}…
              </Text>
            )}
          >
            {renderItem}
          </TagGroup>
        )}
      </VStack>

      {onChange !== undefined && (
        <DialogContainer onDismiss={() => setDialogOpen(false)}>
          {dialogIsOpen && (
            <CreateItemDialog
              listKey={foreignList.key}
              onCreate={val => {
                setDialogOpen(false)
                if (value.kind === 'many') {
                  onChange({
                    ...value,
                    value: [...value.value, val],
                  })
                } else if (value.kind === 'one') {
                  onChange({
                    ...value,
                    value: val,
                  })
                }
              }}
            />
          )}
        </DialogContainer>
      )}
    </Fragment>
  )
}

// NOTE: temp fix for `TagGroup` perf issue, should typically be okay to just
// inline the render function
function renderItem(item: { id: string; href: string; label: string }) {
  return <Item href={item.href}>{item.label}</Item>
}

export const Cell: CellComponent<typeof controller> = ({ field, item }) => {
  const list = useList(field.refListKey)

  if (field.display === 'count') {
    const count = item[`${field.path}Count`]
    return count != null ? <Numeral value={count} abbreviate /> : null
  }

  const data = item[field.path]
  const items = (Array.isArray(data) ? data : [data]).filter(Boolean)
  const displayItems = items.length < 3 ? items : items.slice(0, 2)
  const overflow = items.length < 3 ? 0 : items.length - 2

  return (
    <Fragment>
      {displayItems.map((item, index) => (
        <Fragment key={item.id}>
          {index ? ', ' : ''}
          <TextLink href={`/${list.path}/${item.id}`}>
            {item.label || item.id}
          </TextLink>
        </Fragment>
      ))}
      {overflow ? `, and ${overflow} more` : null}
    </Fragment>
  )
}

export function controller (
  config: FieldControllerConfig<
    {
      refFieldKey?: string
      refListKey: string
      many: boolean
      hideCreate: boolean
      refLabelField: string
      refSearchFields: string[]
    } & (
      | {
          displayMode: 'select'
        }
      | {
          displayMode: 'count'
        }
    )
  >
): RelationshipController {
  const refLabelField = config.fieldMeta.refLabelField
  const refSearchFields = config.fieldMeta.refSearchFields

  return {
    refFieldKey: config.fieldMeta.refFieldKey,
    many: config.fieldMeta.many,
    listKey: config.listKey,
    path: config.path,
    label: config.label,
    description: config.description,
    display: config.fieldMeta.displayMode,
    refLabelField,
    refSearchFields,
    refListKey: config.fieldMeta.refListKey,
    graphqlSelection:
      config.fieldMeta.displayMode === 'count'
        ? `${config.path}Count`
        : `${config.path} {
              id
              label: ${refLabelField}
            }`,
    hideCreate: config.fieldMeta.hideCreate,
    // note we're not making the state kind: 'count' when ui.displayMode is set to 'count'.
    // that ui.displayMode: 'count' is really just a way to have reasonable performance
    // because our other UIs don't handle relationships with a large number of items well
    // but that's not a problem here since we're creating a new item so we might as well them a better UI
    defaultValue: config.fieldMeta.many
      ? {
          id: null,
          kind: 'many',
          initialValue: [],
          value: [],
        }
      : { id: null, kind: 'one', value: null, initialValue: null },
    validate() {
      return true
    },
    deserialize: data => {
      if (config.fieldMeta.displayMode === 'count') {
        return {
          id: data.id,
          kind: 'count',
          count: data[`${config.path}Count`] ?? 0,
        }
      }
      if (config.fieldMeta.many) {
        const value = (data[config.path] || []).map((x: any) => ({
          id: x.id,
          label: x.label || x.id,
        }))
        return {
          kind: 'many',
          id: data.id,
          initialValue: value,
          value,
        }
      }
      let value = data[config.path]
      if (value) {
        value = {
          id: value.id,
          label: value.label || value.id,
        }
      }
      return {
        kind: 'one',
        id: data.id,
        value,
        initialValue: value,
      }
    },
    serialize: state => {
      if (state.kind === 'many') {
        const newAllIds = new Set(state.value.map(x => x.id))
        const initialIds = new Set(state.initialValue.map(x => x.id))
        const disconnect = state.initialValue
          .filter(x => !newAllIds.has(x.id))
          .map(x => ({ id: x.id }))
        const connect = state.value.filter(x => !initialIds.has(x.id)).map(x => ({ id: x.id }))
        if (disconnect.length || connect.length) {
          const output: any = {}

          if (disconnect.length) {
            output.disconnect = disconnect
          }

          if (connect.length) {
            output.connect = connect
          }

          return {
            [config.path]: output,
          }
        }
      } else if (state.kind === 'one') {
        if (state.initialValue && !state.value) {
          return { [config.path]: { disconnect: true } }
        }

        if (state.value && state.value.id !== state.initialValue?.id) {
          return {
            [config.path]: {
              connect: {
                id: state.value.id,
              },
            },
          }
        }
      }
      return {}
    },
  }
}
