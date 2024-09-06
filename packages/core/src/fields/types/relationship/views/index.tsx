/** @jsxRuntime classic */
/** @jsx jsx */

import Link from 'next/link'
import { useRouter } from 'next/router'
import { type Key, Fragment, useMemo, useState } from 'react'

import { Icon } from '@keystar/ui/icon'
import { arrowUpRightIcon } from '@keystar/ui/icon/icons/arrowUpRightIcon'
import { plusIcon } from '@keystar/ui/icon/icons/plusIcon'
import { Grid, VStack } from '@keystar/ui/layout'
import { ListView, Item } from '@keystar/ui/list-view'
import { ActionMenu } from '@keystar/ui/menu'
import { Text } from '@keystar/ui/typography'

import { jsx, Stack, useTheme } from '@keystone-ui/core'
import { FieldDescription, FieldLegend } from '@keystone-ui/fields'
import { DrawerController } from '@keystone-ui/modals'
import type {
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
  ListMeta,
} from '../../../../types'
import { useList } from '../../../../admin-ui/context'
import { gql, useQuery } from '../../../../admin-ui/apollo'
import { CellContainer, CreateItemDrawer } from '../../../../admin-ui/components'

import { RelationshipSelect } from './RelationshipSelect'

export function Field (props: FieldProps<typeof controller>) {
  const { field, value, autoFocus, onChange } = props

  const foreignList = useList(field.refListKey)
  const localList = useList(field.listKey)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  if (value.kind === 'count') {
    return (
      <Stack as="fieldset" gap="medium">
        <FieldLegend>{field.label}</FieldLegend>
        <FieldDescription id={`${field.path}-description`}>{field.description}</FieldDescription>
        <div>
          {value.count === 1
            ? `There is 1 ${foreignList.singular} `
            : `There are ${value.count} ${foreignList.plural} `}
          linked to this {localList.singular}
        </div>
      </Stack>
    )
  }

  return (
    <Fragment>
      <VStack gap="medium">
        <Grid gap="regular" alignItems="end" columns="minmax(0, 1fr) auto">
          <RelationshipSelect
            key={field.path}
            autoFocus={autoFocus}
            label={field.label}
            description={field.description || undefined}
            isReadOnly={onChange === undefined}
            labelField={field.refLabelField}
            searchFields={field.refSearchFields}
            list={foreignList}
            state={
              value.kind === 'many'
                ? {
                    kind: 'many',
                    value: value.value,
                    onChange (newItems) {
                      onChange?.({
                        ...value,
                        value: newItems,
                      })
                    },
                  }
                : {
                    kind: 'one',
                    value: value.value,
                    onChange (newVal) {
                      if (value.kind === 'one') {
                        onChange?.({
                          ...value,
                          value: newVal,
                        })
                      }
                    },
                  }
            }
          />

          <ContextualActionsMenu {...props} />
        </Grid>

        {value.kind === 'many' && (
          <ListView items={value.value} minHeight="scale.2000" maxHeight="scale.3600">
            {item => (
              <Item key={item.id}>
                {item.label}
              </Item>
            )}
          </ListView>
        )}
      </VStack>

      {onChange !== undefined && (
        <DrawerController isOpen={isDrawerOpen}>
          <CreateItemDrawer
            listKey={foreignList.key}
            onClose={() => {
              setIsDrawerOpen(false)
            }}
            onCreate={val => {
              setIsDrawerOpen(false)
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
        </DrawerController>
      )}
    </Fragment>
  )
}

function ContextualActionsMenu (props: FieldProps<typeof controller>) {
  const { field, onChange, value } = props

  const router = useRouter()
  const foreignList = useList(field.refListKey)
  const relatedItem = useRelatedItem(props)

  const items = useMemo(() => {
    let result = []
    let allowCreate = !field.hideCreate && onChange !== undefined

    if (allowCreate) {
      result.push({
        icon: plusIcon,
        key: 'add',
        label: `Add ${foreignList.singular.toLocaleLowerCase()}`,
      })
    }
    if (relatedItem) {
      result.push({
        key: 'view',
        ...relatedItem,
      })
    }

    return result
  }, [value])

  const onAction = (key: Key) => {
    switch (key) {
      case 'view': {
        let item = items.find(i => i.key === 'view')
        if (item && 'href' in item) {
          router.push(item.href)
        }
        break
      }
      case 'add': {
        alert('TODO: "create" modal')
        break
      }
    }
  }

  // if there are no items, and the user has no ability to add items, don't
  // render the menu
  if (onChange === undefined && items.length === 0) {
    return null
  }

  return (
    <ActionMenu
      aria-label={`Actions for ${field.label}`}
      // @ts-expect-error FIXME: support both axes in @keystar/ui/menu
      direction="bottom end"
      isDisabled={items.length === 0}
      items={items}
      onAction={onAction}
    >
      {item => (
        <Item key={item.key} textValue={item.label}>
          <Icon src={item.icon} />
          <Text>{item.label}</Text>
        </Item>
      )}
    </ActionMenu>
  )
}

function useRelatedItem ({ field, value }: FieldProps<typeof controller>) {
  const foreignList = useList(field.refListKey)

  if (value.kind === 'count') {
    return null
  }
  if (value.kind === 'many' && !value.value.length) {
    return null
  }
  if (value.kind === 'one' && !value.value) {
    return null
  }

  if (value.kind === 'many') {
    const query = field.refFieldKey && value.id
      ? `!${field.refFieldKey}_matches="${value.id}"`
      :`!id_in="${(value?.value)
        .slice(0, 100) // where does 100 come from?
        .map(item => item.id)
        .join(',')}"`

    return {
      href: `/${foreignList.path}?${query}`,
      icon: arrowUpRightIcon,
      label: `View related ${foreignList.plural.toLocaleLowerCase()}`,
    }
  }

  if (value.value?.id) {
    return {
      href: `/${foreignList.path}/${value.value?.id}`,
      icon: arrowUpRightIcon,
      label: `View ${foreignList.singular.toLocaleLowerCase()}`,
    }
  }

  return null
}

export const Cell: CellComponent<typeof controller> = ({ field, item }) => {
  const list = useList(field.refListKey)
  const { colors } = useTheme()

  if (field.display === 'count') {
    const count = item[`${field.path}Count`] ?? 0
    return (
      <CellContainer>
        {count} {count === 1 ? list.singular : list.plural}
      </CellContainer>
    )
  }

  const data = item[field.path]
  const items = (Array.isArray(data) ? data : [data]).filter(item => item)
  const displayItems = items.length < 5 ? items : items.slice(0, 3)
  const overflow = items.length < 5 ? 0 : items.length - 3
  const styles = {
    color: colors.foreground,
    textDecoration: 'none',

    ':hover': {
      textDecoration: 'underline',
    },
  } as const

  return (
    <CellContainer>
      {displayItems.map((item, index) => (
        <Fragment key={item.id}>
          {!!index ? ', ' : ''}
          <Link href={`/${list.path}/[id]`} as={`/${list.path}/${item.id}`} css={styles}>
            {item.label || item.id}
          </Link>
        </Fragment>
      ))}
      {overflow ? `, and ${overflow} more` : null}
    </CellContainer>
  )
}

type SingleRelationshipValue = {
  kind: 'one'
  id: null | string
  initialValue: { label: string, id: string } | null
  value: { label: string, id: string } | null
}
type ManyRelationshipValue = {
  kind: 'many'
  id: null | string
  initialValue: { label: string, id: string }[]
  value: { label: string, id: string }[]
}
type CountRelationshipValue = {
  kind: 'count'
  id: null | string
  count: number
}

type RelationshipController = FieldController<
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
    defaultValue:
      config.fieldMeta.many
        ? {
            id: null,
            kind: 'many',
            initialValue: [],
            value: [],
          }
        : { id: null, kind: 'one', value: null, initialValue: null },
    deserialize: data => {
      if (config.fieldMeta.displayMode === 'count') {
        return { id: data.id, kind: 'count', count: data[`${config.path}Count`] ?? 0 }
      }
      if (config.fieldMeta.many) {
        let value = (data[config.path] || []).map((x: any) => ({
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
    filter: {
      Filter: ({ typeLabel, onChange, value }) => {
        const foreignList = useList(config.fieldMeta.refListKey)
        const { filterValues, loading } = useRelationshipFilterValues({
          value,
          list: foreignList,
        })
        const state: {
          kind: 'many'
          value: { label: string, id: string }[]
          onChange: (newItems: { label: string, id: string }[]) => void
        } = {
          kind: 'many',
          value: filterValues,
          onChange (newItems) {
            onChange(newItems.map(item => item.id).join(','))
          },
        }
        return (
          <RelationshipSelect
            list={foreignList}
            label={typeLabel}
            labelField={refLabelField}
            searchFields={refSearchFields}
            isLoading={loading}
            isDisabled={onChange === undefined}
            state={state}
          />
        )
      },
      graphql: ({ value }) => {
        const foreignIds = getForeignIds(value)
        if (config.fieldMeta.many) {
          return {
            [config.path]: {
              some: {
                id: {
                  in: foreignIds,
                },
              },
            },
          }
        }
        return {
          [config.path]: {
            id: {
              in: foreignIds,
            },
          },
        }
      },
      Label ({ value }) {
        const foreignList = useList(config.fieldMeta.refListKey)
        const { filterValues } = useRelationshipFilterValues({
          value,
          list: foreignList,
        })

        if (!filterValues.length) {
          return `has no value`
        }
        if (filterValues.length > 1) {
          const values = filterValues.map((i: any) => i.label).join(', ')
          return `is in [${values}]`
        }
        const optionLabel = filterValues[0].label
        return `is ${optionLabel}`
      },
      types: {
        matches: {
          label: 'Matches',
          initialValue: '',
        },
      },
    },
    validate (value) {
      return true
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
          let output: any = {}

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
        if (state.initialValue && !state.value) return { [config.path]: { disconnect: true } }
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

function useRelationshipFilterValues ({ value, list }: { value: string, list: ListMeta }) {
  const foreignIds = getForeignIds(value)
  const { data, loading } = useQuery(gql`
    query FOREIGNLIST_QUERY($where: ${list.graphql.names.whereInputName}!) {
      items: ${list.graphql.names.listQueryName}(where: $where) {
        id
        ${list.labelField}
      }
    }
  `, {
    variables: {
      where: {
        id: {
          in: foreignIds
        }
      }
    },
  })

  return {
    filterValues:
      data?.items?.map((item: any) => {
        return {
          id: item.id,
          label: item[list.labelField] || item.id,
        }
      }) || foreignIds.map(f => ({ label: f, id: f })),
    loading: loading,
  }
}

function getForeignIds (value: string) {
  if (typeof value === 'string' && value.length > 0) return value.split(',')
  return []
}
