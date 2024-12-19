import React, {
  Fragment,
  useState
} from 'react'
import {
  useListFormatter
} from '@react-aria/i18n'

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
import { BuildItemDialog } from '../../../../admin-ui/components'

import { ContextualActions } from './ContextualActions'
import { ComboboxMany } from './ComboboxMany'
import { ComboboxSingle } from './ComboboxSingle'
import type {
  RelationshipController,
} from './types'

export function Field (props: FieldProps<typeof controller>) {
  const {
    autoFocus,
    field,
    onChange,
    value,
  } = props
  const foreignList = useList(field.refListKey)
  const [dialogIsOpen, setDialogOpen] = useState(false)
  const description = field.description || undefined
  const isReadOnly = onChange === undefined

  if (value.kind === 'count') {
    return (
      <TextField
        autoFocus={autoFocus}
        label={field.label}
        description={description}
        isReadOnly
        value={value.count.toString()}
        width="alias.singleLineWidth"
      />
    )
  }

  return (
    <Fragment>
      <VStack gap="medium">
        <ContextualActions onAdd={() => setDialogOpen(true)} {...props} >
          {value.kind === 'many' ? (
            <ComboboxMany
              autoFocus={autoFocus}
              label={field.label}
              description={description}
              isReadOnly={isReadOnly}
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
              autoFocus={autoFocus}
              label={field.label}
              description={description}
              isReadOnly={isReadOnly}
              labelField={field.refLabelField}
              searchFields={field.refSearchFields}
              list={foreignList}
              state={{
                kind: 'one',
                value: value.value,
                onChange(newItem) {
                  onChange?.({ ...value, value: newItem })
                },
              }}
            />
          )}
        </ContextualActions>

        {value.kind === 'many' && (
          <TagGroup
            aria-label={`related ${foreignList.plural}`}
            items={value.value.map(item => ({
              id: item.id.toString() ?? '',
              label: item.label ?? '',
              href: item.built ? '' : `/${foreignList.path}/${item.id}`,
            }))}
            maxRows={2}
            onRemove={keys => {
              const [key] = [...keys]
              const item = value.value.find(item => item.id.toString() === key)
              if (!item) return
              onChange?.({
                ...value,
                value: value.value.filter(item2 => item2 !== item),
              })
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

      {!isReadOnly && (
        <DialogContainer onDismiss={() => setDialogOpen(false)}>
          {dialogIsOpen && (
            <BuildItemDialog
              listKey={foreignList.key}
              onChange={builtItemData => {
                const id = `_____internal_${Math.random().toString()}`
                const label = (builtItemData?.[foreignList.labelField] as string | null) ?? `[${foreignList.singular} #1]`
                setDialogOpen(false)

                if (value.kind === 'many') {
                  onChange({
                    ...value,
                    value: [
                      ...value.value,
                      {
                        id,
                        label,
                        data: builtItemData,
                        built: true
                      }
                    ],
                  })
                } else if (value.kind === 'one') {
                  onChange({
                    ...value,
                    value: {
                      id,
                      label,
                      data: builtItemData,
                      built: true
                    }
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

// NOTE: fix for `TagGroup` perf issue, should typically be okay to just
// inline the render function
function renderItem (item: { id: string; href: string; label: string }) {
  if (item.href === '') return <Item>{item.label}</Item>
  return <Item href={item.href}>{item.label}</Item>
}

export const Cell: CellComponent<typeof controller> = ({ field, item }) => {
  const list = useList(field.refListKey)

  if (field.display === 'count') {
    const count = item[`${field.path}Count`] as number
    return count != null ? <Numeral value={count} abbreviate /> : null
  }

  const data = item[field.path]
  const items = (Array.isArray(data) ? data : [data]).filter(Boolean)
  const displayItems = items.length < 3 ? items : items.slice(0, 2)
  const overflow = items.length < 3 ? 0 : items.length - 2

  return (
    <Text>
      {displayItems.map((item, index) => (
        <Fragment key={item.id}>
          {index ? ', ' : ''}
          <TextLink href={`/${list.path}/${item.id}`}>
            {item.label || item.id}
          </TextLink>
        </Fragment>
      ))}
      {overflow ? `, and ${overflow} more` : null}
    </Text>
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
      | { displayMode: 'select' }
      | { displayMode: 'count' }
    )
  >
): RelationshipController {
  const {
    listKey,
    path: fieldKey,
    label,
    description,
  } = config
  const {
    displayMode,
    hideCreate,
    many,
    refFieldKey,
    refLabelField,
    refListKey,
    refSearchFields,
  } = config.fieldMeta

  return {
    refFieldKey,
    many,
    listKey,
    path: fieldKey,
    label,
    description,
    display: displayMode,
    refLabelField,
    refSearchFields,
    refListKey,
    graphqlSelection:
      displayMode === 'count'
        ? `${fieldKey}Count`
        : `${fieldKey} {
              id
              label: ${refLabelField}
            }`,
    hideCreate,
    // note we're not making the state kind: 'count' when ui.displayMode is set to 'count'.
    // that ui.displayMode: 'count' is really just a way to have reasonable performance
    // because our other UIs don't handle relationships with a large number of items well
    // but that's not a problem here since we're creating a new item so we might as well them a better UI
    defaultValue: many
      ? {
          kind: 'many',
          id: null,
          initialValue: [],
          value: [],
        }
      : {
          kind: 'one',
          id: null,
          value: null,
          initialValue: null
        },
    validate() { return true },
    deserialize: (data) => {
      if (displayMode === 'count') {
        return {
          id: data.id,
          kind: 'count',
          count: data[`${config.path}Count`] ?? 0,
        }
      }
      if (many) {
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
    serialize: (state) => {
      if (state.kind === 'many') {
        const newAllIds = new Set(state.value.map(x => x.id))
        const initialIds = new Set(state.initialValue.map(x => x.id))
        const disconnect = state.initialValue.filter(x => !newAllIds.has(x.id)) .map(x => ({ id: x.id }))
        const connect = state.value.filter(x => !x.built && !initialIds.has(x.id)).map(x => ({ id: x.id }))
        const create = state.value.filter(x => x.built).map(x => x.data)
        const output = {
          ...(disconnect.length ? { disconnect } : {}),
          ...(connect.length ? { connect } : {}),
          ...(create.length ? { create } : {}),
        }

        if (Object.keys(output).length) {
          return {
            [config.path]: output
          }
        }

      } else if (state.kind === 'one') {
        if (state.initialValue && !state.value) return { [config.path]: { disconnect: true } }
        if (state.value?.built) {
          return {
            [config.path]: {
              create: state.value.data
            },
          }
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
    filter: {
      Filter (props) {
        return null // TODO
      },
      Label ({ label, type, value }) {
        const listFormatter = useListFormatter({
          style: 'short',
          type: 'disjunction',
        })

        if (value === null) {
          if (type === 'empty') return `is empty`
          if (type === 'not_empty') return `is not empty`
          value = '' // shouldnt happen
        }

        if (typeof value === 'string') {
          if (type === 'is') return `is ${value}`
          if (type === 'not_is') return `is not ${value}`
          value = [value] // shouldnt happen
        }

        console.log(value)
        const prefix = type === 'not_some' ? `does not include any of` : `includes any of`
        return `${prefix} (${listFormatter.format(value)})`
      },
      graphql: ({ type, value }) => {
        if (type === 'empty') return { [config.path]: { equals: null } }
        if (type === 'not_empty') return { [config.path]: { not: { equals: null } } }
        if (type === 'is') return { [config.path]: { id: { equals: value } } }
        if (type === 'not_is') return { [config.path]: { not: { id: { equals: value } } } }
        if (type === 'some') return { [config.path]: { some: { id: { in: value } } } }
        if (type === 'not_some') return { [config.path]: { not: { some: { id: { in: value } } } } }
        return { [config.path]: { [type]: value } } // uh
      },
      types: {
        ...(many ? {
          some: {
            label: 'Includes',
            initialValue: [],
          },
          not_some: {
            label: 'Does not include',
            initialValue: [],
          },
        } : {
          empty: {
            label: 'Is empty',
            initialValue: null,
          },
          not_empty: {
            label: 'Is not empty',
            initialValue: null,
          },
          is: {
            label: 'Is',
            initialValue: null,
          },
          not_is: {
            label: 'Is not',
            initialValue: null,
          },
        }),
      },
    },
  }
}
