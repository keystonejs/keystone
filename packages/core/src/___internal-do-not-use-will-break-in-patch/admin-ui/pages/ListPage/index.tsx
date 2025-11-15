import isDeepEqual from 'fast-deep-equal'
import type { GraphQLFormattedError } from 'graphql'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ParsedUrlQuery, ParsedUrlQueryInput } from 'querystring'
import { type FormEvent, type Key, Fragment, useEffect, useId, useMemo, useState } from 'react'
import { use, type Usable } from 'react'

import { ActionBar, ActionBarContainer, Item } from '@keystar/ui/action-bar'
import { ActionButton, Button, ButtonGroup } from '@keystar/ui/button'
import { AlertDialog, Dialog, DialogContainer, DialogTrigger } from '@keystar/ui/dialog'
import { Icon } from '@keystar/ui/icon'
import { allIcons as KeystarIcons } from '@keystar/ui/icon/all'
import { chevronDownIcon } from '@keystar/ui/icon/icons/chevronDownIcon'
import { searchXIcon } from '@keystar/ui/icon/icons/searchXIcon'
import { textSelectIcon } from '@keystar/ui/icon/icons/textSelectIcon'
import { undo2Icon } from '@keystar/ui/icon/icons/undo2Icon'
import { Box, Flex, HStack, VStack } from '@keystar/ui/layout'
import { Menu, MenuTrigger } from '@keystar/ui/menu'
import { ProgressCircle } from '@keystar/ui/progress'
import { SearchField } from '@keystar/ui/search-field'
import { Content } from '@keystar/ui/slots'
import { css, tokenSchema } from '@keystar/ui/style'
import {
  type SortDescriptor,
  Cell,
  Column,
  Row,
  TableBody,
  TableHeader,
  TableView,
} from '@keystar/ui/table'
import { toastQueue } from '@keystar/ui/toast'
import { Tooltip, TooltipTrigger } from '@keystar/ui/tooltip'
import { Heading, Text } from '@keystar/ui/typography'

import { TextLink } from '@keystar/ui/link'
import { Notice } from '@keystar/ui/notice'
import type { TypedDocumentNode } from '../../../../admin-ui/apollo'
import { gql, useMutation, useQuery } from '../../../../admin-ui/apollo'
import { CreateButtonLink } from '../../../../admin-ui/components/CreateButtonLink'
import { EmptyState } from '../../../../admin-ui/components/EmptyState'
import { GraphQLErrorNotice } from '../../../../admin-ui/components/GraphQLErrorNotice'
import { PageContainer } from '../../../../admin-ui/components/PageContainer'
import { useKeystone, useList } from '../../../../admin-ui/context'
import { useSearchFilter } from '../../../../fields/types/relationship/views/useFilter'
import type { ActionMeta, FieldMeta, JSONValue, ListMeta } from '../../../../types'
import { FilterAdd } from './FilterAdd'
import { PaginationControls, snapValueToClosest } from './PaginationControls'
import { Tag } from './Tag'
import { searchParamsToUrlQuery, urlQueryToSearchParams } from './lib'

export * from './FilterAdd'
export * from './lib'
export * from './PaginationControls'
export * from './Tag'

type ListPageProps = { params: Usable<{ listKey: string }> }
export type Filter = {
  field: string
  type: string
  value: JSONValue
}

function FilterTag({
  filter,
  field,
  onChange,
  onRemove,
}: {
  filter: Filter
  field: FieldMeta
  onChange: (filter: Filter) => void
  onRemove: () => void
}) {
  const Label = field.controller.filter!.Label
  const tagElement = (
    <Tag onRemove={onRemove}>
      <Text>
        <span>{field.label} </span>
        <Label
          label={field.controller.filter!.types[filter.type].label}
          type={filter.type}
          value={filter.value}
        />
      </Text>
    </Tag>
  )

  // TODO: Special "empty" types need to be documented somewhere. Filters that
  // have no editable value, basically `null` or `!null`. Which offers:
  // * better DX — we can avoid weird nullable types and UIs that don't make sense
  // * better UX — users don't have to jump through mental hoops, like "is not exactly" + submit empty field
  if (filter.type === 'empty' || filter.type === 'not_empty') return tagElement

  return (
    <DialogTrigger type="popover" mobileType="tray">
      {tagElement}
      {onDismiss => (
        <FilterEdit onChange={onChange} onDismiss={onDismiss} field={field} filter={filter} />
      )}
    </DialogTrigger>
  )
}

function FilterEdit({
  filter,
  field,
  onChange: onAdd,
  onDismiss,
}: {
  filter: Filter
  field: FieldMeta
  onChange: (filter: Filter) => void
  onDismiss: () => void
}) {
  const formId = useId()
  const [value, setValue] = useState(filter.value)
  const onSubmit = (event: FormEvent) => {
    if (event.target !== event.currentTarget) return
    event.preventDefault()

    onAdd({
      ...filter,
      value,
    })
    onDismiss()
  }

  const Filter = field.controller.filter!.Filter
  const filterTypeLabel = field.controller.filter?.types[filter.type].label

  return (
    <Dialog>
      <Heading>{field.label}</Heading>
      <Content>
        <form onSubmit={onSubmit} id={formId}>
          <Filter
            autoFocus
            context="edit"
            typeLabel={filterTypeLabel}
            onChange={setValue}
            type={filter.type}
            value={value}
          />
        </form>
      </Content>
      <ButtonGroup>
        <Button onPress={onDismiss}>Cancel</Button>
        <Button type="submit" prominence="high" form={formId}>
          Save
        </Button>
      </ButtonGroup>
    </Dialog>
  )
}

function getFilters(list: ListMeta, query: ParsedUrlQueryInput): Filter[] {
  const param_ = query.filter
  const params = Array.isArray(param_) ? param_ : typeof param_ === 'string' ? [param_] : []

  if (!params.length) {
    if (!list.initialFilter) return []

    const filters: Filter[] = []
    for (const [fieldKey, filter] of Object.entries(list.initialFilter)) {
      const { controller } = list.fields[fieldKey]
      for (const f of controller.filter?.parseGraphQL(filter as any as never) ?? []) {
        filters.push({
          field: fieldKey,
          ...f,
        })
      }
    }

    return filters
  }

  const filters: Filter[] = []
  for (const [fieldPath, field] of Object.entries(list.fields)) {
    if (!field.isFilterable) continue
    if (!field.controller.filter) continue

    for (const filterType in field.controller.filter.types) {
      const prefix = `${fieldPath}_${filterType}`
      for (const queryFilter of params) {
        if (!queryFilter.startsWith(prefix)) continue

        if (queryFilter === prefix) {
          filters.push({
            type: filterType,
            field: fieldPath,
            value: null,
          })
          continue
        }

        const queryValue = queryFilter.slice(prefix.length + 1)
        try {
          const value = JSON.parse(queryValue)
          filters.push({
            type: filterType,
            field: fieldPath,
            value,
          })
        } catch (e) {
          console.error('Error parsing filter', queryFilter)
        }
      }
    }
  }

  return filters
}

function getSort(list: ListMeta, query: ParsedUrlQueryInput): SortDescriptor | null {
  const param = typeof query.sortBy === 'string' ? query.sortBy : null
  if (param === '') return null
  if (!param) {
    if (!list.initialSort) return null
    return {
      column: list.initialSort.field,
      direction: list.initialSort.direction === 'ASC' ? 'ascending' : 'descending',
    }
  }

  const fieldKey = param.startsWith('-') ? param.slice(1) : param
  const direction = param.startsWith('-') ? 'descending' : 'ascending'
  const field = list.fields[fieldKey]
  if (!field) return null
  if (!field.isOrderable) return null

  return {
    column: fieldKey,
    direction,
  }
}

function getCurrentPage(_: ListMeta, query: ParsedUrlQuery) {
  const currentPage = Number(query.page)
  if (Number.isNaN(currentPage) || currentPage < 1) return 1
  return currentPage
}

function getPageSize(list: ListMeta, query: ParsedUrlQuery) {
  const pageSize = Number(query.pageSize)
  if (Number.isNaN(pageSize) || pageSize < 1) return list.pageSize
  return snapValueToClosest(pageSize)
}

function getColumns(list: ListMeta, query: ParsedUrlQueryInput): string[] {
  const param_ = query.column
  const params = Array.isArray(param_) ? param_ : typeof param_ === 'string' ? [param_] : []
  if (!params.length) return list.initialColumns
  return params
}

export function ListPage(props: ListPageProps) {
  const { listKey } = use<{ listKey: string }>(props.params)

  return <ListPageInternal listKey={listKey} />
}

type Selection = Set<string | number> | 'all'
export function ListPageInternal({ listKey: _listKey }: { listKey: string }) {
  const { adminPath, listsKeyByPath } = useKeystone()
  const listKey = listsKeyByPath[_listKey]

  const localStorageListKey = `keystone.list.${listKey}.list.page.info`

  const list = useList(listKey)
  const [loaded, setLoaded] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParamsToUrlQuery(searchParams)
  const [sort, setSort] = useState<SortDescriptor | null>(() => getSort(list, {}))
  const [columns, setColumns] = useState<string[]>(list.initialColumns)
  const [filters, setFilters] = useState<Filter[]>(() => getFilters(list, {}))
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(list.pageSize)
  const [searchString, setSearchString] = useState('')
  const [selectedItems, setSelectedItems] = useState<Selection>(() => new Set([]))
  const [activeAction, setActiveAction] = useState<Key | null>(null)
  const [actionResult, setActionResult] = useState<ActionErrorResult | null>(null)
  const dirty = useMemo(() => {
    const defaultFilters = getFilters(list, {})
    const defaultSort = getSort(list, {})
    return (
      !!searchString ||
      !isDeepEqual(filters, defaultFilters) ||
      !isDeepEqual(sort, defaultSort) ||
      !isDeepEqual(columns, list.initialColumns)
    )
  }, [searchString, filters, sort, columns, list.initialColumns])

  useEffect(() => {
    // if (!isReady) return
    if (loaded) return
    let localStorageQuery
    try {
      localStorageQuery = JSON.parse(localStorage.getItem(localStorageListKey) ?? '{}')
    } catch {}

    setSort(getSort(list, { ...localStorageQuery, ...query }))
    setColumns(getColumns(list, { ...localStorageQuery, ...query }))
    setFilters(getFilters(list, { ...localStorageQuery, ...query }))
    setCurrentPage(getCurrentPage(list, { ...localStorageQuery, ...query }))
    setPageSize(getPageSize(list, { ...localStorageQuery, ...query }))
    setSearchString(typeof query.search === 'string' ? query.search : '')
    setLoaded(true)
  }, [list /*, isReady*/])

  useEffect(() => {
    // if (!isReady) return
    if (!loaded) return // TODO: stop this race condition properly
    const updatedQuery: ParsedUrlQueryInput = {
      ...(columns.length ? { column: columns } : {}),
      ...(sort ? { sortBy: sort.direction === 'ascending' ? sort.column : `-${sort.column}` } : {}),
      ...(filters.length
        ? {
            filter: (function () {
              const result: string[] = []
              for (const filter of filters) {
                if (filter.type === 'not_empty' || filter.type === 'empty') {
                  result.push(`${filter.field}_${filter.type}`)
                  continue
                }

                result.push(`${filter.field}_${filter.type}_${JSON.stringify(filter.value)}`)
              }
              return result
            })(),
          }
        : {}),
      ...(currentPage > 1 ? { page: currentPage } : {}),
      ...(pageSize !== list.pageSize ? { pageSize } : {}),
      ...(searchString ? { search: searchString } : {}),
    }

    localStorage.setItem(localStorageListKey, JSON.stringify(updatedQuery))
    router.replace(urlQueryToSearchParams(updatedQuery))
  }, [columns, sort, filters, currentPage, pageSize, searchString, list])

  const allowCreate = !(list.hideCreate ?? true)
  const isConstrained = Boolean(filters.length || query.search)
  const readableFields = Object.values(list.fields).map(f => ({
    id: f.key,
    value: f.key,
    label: f.label,
    isDisabled: f.listView.fieldMode === 'read',
  }))
  const shownFields = columns.map(fieldKey => list.fields[fieldKey]).filter(Boolean)
  const where = useMemo(
    () =>
      filters.map(filter => {
        return list.fields[filter.field].controller.filter!.graphql({
          type: filter.type,
          value: filter.value,
        })
      }),
    [list, filters]
  )

  const search = useSearchFilter(searchString, list, list.initialSearchFields)
  const { data, error, refetch, loading } = useQuery(
    useMemo((): TypedDocumentNode<{
      items: Record<string, unknown>[] | null
      count: number | null
    }> => {
      const selectedGqlFields = shownFields
        .filter(field => field.key !== 'id') // id is always included
        .map(field => field.controller.graphqlSelection)
        .join('\n')

      // TODO: less interpolation
      return gql`
        query (
          $where: ${list.graphql.names.whereInputName},
          $take: Int!,
          $skip: Int!,
          $orderBy: [${list.graphql.names.listOrderName}!]
        ) {
          items: ${list.graphql.names.listQueryName}(
            where: $where,
            take: $take,
            skip: $skip,
            orderBy: $orderBy
          ) {
            id
            ${selectedGqlFields}
          }
          count: ${list.graphql.names.listQueryCountName}(where: $where)
        }
      `
    }, [list, shownFields]),
    {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
      variables: {
        where: {
          ...(where.length ? { AND: where } : {}),
          ...(search.length ? { OR: search } : {}),
        },
        take: pageSize,
        skip: (currentPage - 1) * pageSize,
        orderBy: sort
          ? [
              {
                [sort.column]: sort.direction === 'ascending' ? 'asc' : 'desc',
              },
            ]
          : undefined,
      },
    }
  )

  useEffect(() => {
    if (typeof data?.count !== 'number') return

    const lastPage = Math.max(Math.ceil(data.count / pageSize), 1)
    if (currentPage > lastPage) {
      setCurrentPage(lastPage)
    }
  }, [data])

  const selectedItemIds = (
    selectedItems === 'all' ? (data?.items?.map(item => item.id) ?? []) : Array.from(selectedItems)
  ).map(String)
  const isEmpty = Boolean(data?.count === 0 && !isConstrained)
  const headers = shownFields.map(field => {
    return {
      id: field.key,
      label: field.label,
      allowsSorting: !isConstrained && !data?.items?.length ? false : field.isOrderable,
    }
  })

  function onAddFilter(newFilter: Filter) {
    setFilters(prevFilters => [...prevFilters, newFilter])
  }

  function resetToDefaults() {
    const defaultFilters = getFilters(list, {})
    const defaultSort = getSort(list, {})
    setSearchString('')
    setColumns(list.initialColumns)
    setFilters(defaultFilters)
    setSort(defaultSort)
  }

  const actions = list.actions.filter(action => action.listView.actionMode === 'enabled')
  const actionsForList = list.hideDelete
    ? actions
    : [
        ...actions,
        {
          key: 'delete',
          label: 'Delete',
          icon: 'trash2Icon',
          graphql: {
            names: {
              one: list.graphql.names.deleteMutationName,
              many: list.graphql.names.deleteManyMutationName,
            },
          },
          messages: {
            promptTitle: 'Delete {singular}?',
            promptTitleMany: 'Delete {count} {singular|plural}?',
            prompt: 'Are you sure you want to delete {singular}? This action cannot be undone.',
            promptMany:
              'Are you sure you want to delete {count} {singular|plural}? This action cannot be undone.',
            promptConfirmLabel: 'Yes, delete',
            promptConfirmLabelMany: 'Yes, delete',
            success: 'Deleted {singular}.',
            successMany: 'Deleted {countSuccess} {singular|plural}.',
            fail: 'Unable to delete {singular}.',
            failMany: 'Unable to delete {countFail} {singular|plural}.',
          },
          itemView: null as any, // unusud
          listView: { actionMode: list.hideDelete ? 'hidden' : 'enabled' },
        } as const,
      ]
  const selectionMode = actionsForList.length > 0 ? 'multiple' : 'none'

  return (
    <PageContainer
      header={<ListPageHeader listKey={listKey} showCreate={allowCreate} />}
      title={list.label}
    >
      <VStack flex gap="large" paddingY="xlarge" minHeight={0} minWidth={0}>
        <HStack gap="regular" alignItems="center">
          <SearchField
            aria-label="Search"
            isDisabled={isEmpty}
            onClear={() => setSearchString('')}
            onChange={v => setSearchString(v)}
            placeholder="Search…"
            value={searchString}
            width="alias.singleLineWidth"
            flexGrow={{ mobile: 1, tablet: 0 }}
          />
          <FilterAdd listKey={listKey} onAdd={onAddFilter} isDisabled={isEmpty} />
          <MenuTrigger>
            <ActionButton isDisabled={isEmpty}>
              <Text>Columns</Text>
              <Icon src={chevronDownIcon} />
            </ActionButton>
            <Menu
              items={readableFields}
              disallowEmptySelection
              onSelectionChange={selection => {
                if (selection === 'all') {
                  setColumns(readableFields.map(field => field.id))
                } else {
                  setColumns(readableFields.filter(f => selection.has(f.id)).map(f => f.id))
                }
              }}
              selectionMode="multiple"
              selectedKeys={columns}
            >
              {item => <Item key={item.value}>{item.label}</Item>}
            </Menu>
          </MenuTrigger>
          {dirty ? (
            <TooltipTrigger>
              <ActionButton aria-label="reset" onPress={resetToDefaults} prominence="low">
                <Icon src={undo2Icon} />
              </ActionButton>
              <Tooltip>Reset to defaults</Tooltip>
            </TooltipTrigger>
          ) : null}
          {
            /*isReady && */
            loading && <ProgressCircle aria-label="Loading…" size="small" isIndeterminate />
          }
        </HStack>

        {filters.length ? (
          <Flex gap="small" wrap>
            {filters.map((filter, i) => {
              const field = list.fields[filter.field]
              function onRemove() {
                setFilters(prevFilters => prevFilters.filter(f => f !== filter))
              }
              function onChange(updatedFilter: Filter) {
                setFilters(prevFilters => [...prevFilters.filter(f => f !== filter), updatedFilter])
              }

              return (
                <FilterTag
                  key={i}
                  field={field}
                  filter={filter}
                  onChange={onChange}
                  onRemove={onRemove}
                />
              )
            })}
          </Flex>
        ) : null}

        <GraphQLErrorNotice errors={[error?.networkError, ...(error?.graphQLErrors ?? [])]} />

        <ActionBarContainer flex minHeight="scale.3000">
          <TableView
            aria-labelledby={LIST_PAGE_TITLE_ID}
            selectionMode={selectionMode}
            onSortChange={setSort}
            sortDescriptor={sort ?? undefined}
            density="spacious"
            overflowMode="truncate"
            onSelectionChange={setSelectedItems}
            selectedKeys={selectedItems}
            renderEmptyState={() =>
              loading ? (
                <ProgressCircle aria-label="Preparing items" isIndeterminate />
              ) : isConstrained ? (
                <EmptyState
                  icon={searchXIcon}
                  title="No results"
                  message="No items found. Try adjusting your search or filters."
                />
              ) : (
                <EmptyState
                  icon={textSelectIcon}
                  title="Empty list"
                  message="Add the first item to see it here."
                />
              )
            }
            flex
            UNSAFE_style={{
              opacity: loading && !!data ? 0.5 : undefined,
            }}
          >
            <TableHeader columns={headers}>
              {({ label, id, ...options }) => (
                <Column key={id} isRowHeader {...options}>
                  {label}
                </Column>
              )}
            </TableHeader>
            <TableBody items={data?.items ?? []}>
              {row => {
                return (
                  <Row href={`${adminPath}/${list.path}/${row?.id}`}>
                    {key => {
                      const field = list.fields[key]
                      const value = row[key]
                      const CellContent = field.views.Cell
                      return (
                        <Cell>
                          {CellContent ? (
                            <CellContent value={value} field={field.controller} item={row} />
                          ) : (
                            <Text>{value?.toString()}</Text>
                          )}
                        </Cell>
                      )
                    }}
                  </Row>
                )
              }}
            </TableBody>
          </TableView>

          <ActionBar
            selectedItemCount={selectedItemIds.length}
            onClearSelection={() => setSelectedItems(new Set())}
            UNSAFE_className={css({
              // TODO: update in @keystar/ui package
              // make `tokenSchema.size.shadow.regular` token "0 1px 4px"
              'div:has([data-focus-scope-start])': {
                backgroundColor: tokenSchema.color.background.canvas,
                border: `${tokenSchema.size.border.regular} solid ${tokenSchema.color.border.emphasis}`,
                borderRadius: tokenSchema.size.radius.regular,
                boxShadow: `0 1px 4px ${tokenSchema.color.shadow.regular}`,
              },
            })}
            onAction={setActiveAction}
          >
            {[
              ...(function* () {
                for (const action of actionsForList) {
                  const iconComponent = action.icon ? KeystarIcons[action.icon] : null
                  yield (
                    <Item key={action.key} textValue={action.label}>
                      {iconComponent ? <Icon src={iconComponent} /> : null}
                      <Text>{action.label}</Text>
                    </Item>
                  )
                }
              })(),
            ]}
          </ActionBar>
        </ActionBarContainer>

        {!!data?.count && (
          <PaginationControls
            singular={list.singular}
            plural={list.plural}
            currentPage={currentPage}
            pageSize={pageSize}
            total={data.count}
            onChangePage={(page: number) => setCurrentPage(page)}
            onChangePageSize={(pageSize: number) => setPageSize(pageSize)}
            defaultPageSize={list.pageSize}
          />
        )}

        <DialogContainer
          onDismiss={() => {
            setActiveAction(null)
          }}
        >
          {actionsForList
            .filter(action => action.key === activeAction)
            .map(action => {
              return (
                <ActionItemsDialog
                  itemIds={selectedItemIds}
                  action={action}
                  list={list}
                  onSuccess={remaining => {
                    refetch()
                    setSelectedItems(remaining)
                  }}
                  onErrors={setActionResult}
                />
              )
            })
            .pop()}
        </DialogContainer>
        <DialogContainer onDismiss={() => setActionResult(null)} isDismissable>
          {actionResult ? (
            <Dialog>
              <Heading>Error details for {actionResult.action.label} action</Heading>
              <Content>
                <VStack gap="large">
                  {[
                    ...(function* () {
                      const { action, errors: actionErrors } = actionResult
                      for (const [itemId, itemActionErrors] of Object.entries(actionErrors)) {
                        const item = data?.items?.find(i => i.id === itemId) ?? null
                        const itemLabel = (item?.[list.labelField] as string | null) ?? itemId
                        const href = `/${list.path}/${itemId}`

                        for (const error of itemActionErrors) {
                          yield (
                            <VStack key={itemId} gap="regular">
                              <Notice tone="critical">
                                <Content>
                                  <Text>
                                    You might try running the action again from{' '}
                                    <TextLink href={href}>
                                      the {list.singular.toLowerCase()}.
                                    </TextLink>
                                  </Text>
                                  <Box
                                    elementType="pre"
                                    backgroundColor="critical"
                                    borderRadius="regular"
                                    maxHeight="100%"
                                    overflow="auto"
                                  >
                                    <Text
                                      color="critical"
                                      UNSAFE_className={css({
                                        fontFamily: tokenSchema.typography.fontFamily.code,
                                      })}
                                    >
                                      {error.message}
                                    </Text>
                                  </Box>
                                </Content>
                                <div>
                                  <Heading>
                                    {replace(action.messages.fail, list, { itemLabel }, false)}
                                  </Heading>
                                </div>
                              </Notice>
                            </VStack>
                          )
                        }
                      }
                    })(),
                  ]}
                </VStack>
              </Content>
            </Dialog>
          ) : null}
        </DialogContainer>
      </VStack>
    </PageContainer>
  )
}

const LIST_PAGE_TITLE_ID = 'keystone-list-page-title'

function ListPageHeader({ listKey, showCreate }: { listKey: string; showCreate?: boolean }) {
  const list = useList(listKey)
  return (
    <Fragment>
      <Heading id={LIST_PAGE_TITLE_ID} elementType="h1" size="small">
        {list.label}
      </Heading>
      {showCreate && (
        <CreateButtonLink
          list={list}
        >{`New ${list.singular.toLocaleLowerCase()}`}</CreateButtonLink>
      )}
    </Fragment>
  )
}

function replace(
  s: string,
  list: ListMeta,
  args: {
    itemLabel?: string
    count?: number
    countFail?: number
    countSuccess?: number
  },
  many: boolean
) {
  if (s.includes('{singular|plural}'))
    s = s.replaceAll('{singular|plural}', many ? '{plural}' : '{singular}')
  if (s.includes('{Singular}')) s = s.replaceAll('{Singular}', list.singular)
  if (s.includes('{Plural}')) s = s.replaceAll('{Plural}', list.plural)
  if (s.includes('{singular}')) s = s.replaceAll('{singular}', list.singular.toLowerCase())
  if (s.includes('{plural}')) s = s.replaceAll('{plural}', list.plural.toLowerCase())
  if ('count' in args) s = s.replaceAll('{count}', String(args.count))
  if ('countFail' in args) s = s.replaceAll('{countFail}', String(args.countFail))
  if ('countSuccess' in args) s = s.replaceAll('{countSuccess}', String(args.countSuccess))
  if ('itemLabel' in args) s = s.replaceAll('{itemLabel}', args.itemLabel ?? '')
  return s
}

export type ActionErrors = Record<string, GraphQLFormattedError[]>
export type ActionErrorResult = {
  action: ActionMeta
  errors: ActionErrors
}

function ActionItemsDialog({
  list,
  itemIds,
  onSuccess,
  onErrors,
  action,
}: {
  list: ListMeta
  itemIds: string[]
  onSuccess: (remaining: Set<string>) => void
  onErrors: (result: ActionErrorResult) => void
  action: ActionMeta
}) {
  const [actionOnItems] = useMutation<{ results?: ({ id: string } | null)[] }>(
    gql`mutation($where: [${list.graphql.names.whereUniqueInputName}!]!) {
      results: ${action.graphql.names.many}(where: $where) {
        id
      }
    }`,
    {
      variables: { where: itemIds.map(id => ({ id })) },
      errorPolicy: 'all',
    }
  )
  const { messages: m } = action

  async function onTryAction() {
    try {
      const { errors } = await actionOnItems()
      const countFail = errors?.length ?? 0
      const countSuccess = itemIds.length - countFail
      const failed = new Set<string>()
      const actionErrors: ActionErrors = {}
      for (const error of errors ?? []) {
        const i = error.path?.[1]
        if (typeof i !== 'number') continue
        const itemId = itemIds[i]

        failed.add(itemId)
        actionErrors[itemId] ??= []
        actionErrors[itemId].push(error)
      }

      if (countSuccess) {
        toastQueue.neutral(
          replace(
            m.successMany,
            list,
            {
              count: itemIds.length,
              countFail,
              countSuccess,
            },
            countSuccess > 1
          ),
          { timeout: 5000 }
        )
      }

      if (countFail) {
        toastQueue.critical(
          replace(
            m.failMany,
            list,
            {
              count: itemIds.length,
              countFail,
              countSuccess,
            },
            countFail > 1
          ),
          {
            actionLabel: 'Details',
            onAction: () => onErrors({ action, errors: actionErrors }),
            shouldCloseOnAction: true,
          }
        )
      }

      return onSuccess(failed)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <AlertDialog
      tone={action.key === 'delete' ? 'critical' : 'neutral'}
      title={replace(m.promptTitleMany, list, { count: itemIds.length }, itemIds.length > 1)}
      cancelLabel="Cancel"
      primaryActionLabel={replace(
        m.promptConfirmLabelMany,
        list,
        { count: itemIds.length },
        itemIds.length > 1
      )}
      onPrimaryAction={onTryAction}
    >
      <Text>{replace(m.promptMany, list, { count: itemIds.length }, itemIds.length > 1)}</Text>
    </AlertDialog>
  )
}
