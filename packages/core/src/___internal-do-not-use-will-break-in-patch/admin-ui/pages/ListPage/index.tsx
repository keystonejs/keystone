import React, { type Key, Fragment, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'

import { ActionBar, ActionBarContainer, Item } from '@keystar/ui/action-bar'
import { ActionButton } from '@keystar/ui/button'
import { AlertDialog, DialogContainer } from '@keystar/ui/dialog'
import { Icon } from '@keystar/ui/icon'
import { textSelectIcon } from '@keystar/ui/icon/icons/textSelectIcon'
import { searchXIcon } from '@keystar/ui/icon/icons/searchXIcon'
import { trash2Icon } from '@keystar/ui/icon/icons/trash2Icon'
import { undo2Icon } from '@keystar/ui/icon/icons/undo2Icon'
import { HStack, VStack } from '@keystar/ui/layout'
import { ProgressCircle } from '@keystar/ui/progress'
import { SearchField } from '@keystar/ui/search-field'
import { css, tokenSchema } from '@keystar/ui/style'
import {
  type SortDescriptor,
  TableView,
  TableBody,
  TableHeader,
  Column,
  Cell,
  Row,
} from '@keystar/ui/table'
import { toastQueue } from '@keystar/ui/toast'
import { TooltipTrigger, Tooltip } from '@keystar/ui/tooltip'
import { Heading, Text } from '@keystar/ui/typography'

import {
  type DataGetter,
  type DeepNullable,
  makeDataGetter,
} from '../../../../admin-ui/utils'
import {
  type TypedDocumentNode,
  gql,
  useMutation,
  useQuery,
} from '../../../../admin-ui/apollo'
import { PageContainer } from '../../../../admin-ui/components/PageContainer'
import {
  useList,
  useKeystone
} from '../../../../admin-ui/context'
import { EmptyState } from '../../../../admin-ui/components/EmptyState'
import { GraphQLErrorNotice } from '../../../../admin-ui/components/GraphQLErrorNotice'
import { CreateButtonLink } from '../../../../admin-ui/components/CreateButtonLink'
import { FieldSelection } from './FieldSelection'
import { FilterAdd } from './FilterAdd'
import { FilterList } from './FilterList'
import { Pagination, usePaginationParams } from './Pagination'
import { useFilters } from './useFilters'
import { useSearchFilter } from '../../../../fields/types/relationship/views/useFilter'
import { useSelectedFields } from './useSelectedFields'
import { useSort } from './useSort'

type ListPageProps = { listKey: string }
type SelectedKeys = 'all' | Set<number | string>
type FetchedFieldMeta = {
  path: string
  isOrderable: boolean
  isFilterable: boolean
  listView: { fieldMode: 'read' | 'hidden' }
}

const listMetaGraphqlQuery: TypedDocumentNode<
  {
    keystone: {
      adminMeta: {
        list: {
          hideCreate: boolean
          hideDelete: boolean
          fields: FetchedFieldMeta[]
        } | null
      }
    }
  },
  { listKey: string }
> = gql`
  query ($listKey: String!) {
    keystone {
      adminMeta {
        list(key: $listKey) {
          hideDelete
          hideCreate
          fields {
            path
            isOrderable
            isFilterable
            listView {
              fieldMode
            }
          }
        }
      }
    }
  }
`

const storeableQueries = ['sortBy', 'fields']

function useQueryParamsFromLocalStorage(listKey: string) {
  const router = useRouter()
  const localStorageKey = `keystone.list.${listKey}.list.page.info`
  const resetToDefaults = () => {
    localStorage.removeItem(localStorageKey)
    router.replace({ pathname: router.pathname })
  }

  useEffect(() => {
    const hasSomeQueryParamsWhichAreAboutListPage = Object.keys(
      router.query
    ).some(x => {
      return x.startsWith('!') || storeableQueries.includes(x)
    })

    if (!hasSomeQueryParamsWhichAreAboutListPage && router.isReady) {
      const queryParamsFromLocalStorage = localStorage.getItem(localStorageKey)
      let parsed
      try {
        parsed = JSON.parse(queryParamsFromLocalStorage!)
      } catch (err) {}
      if (parsed) {
        router.replace({ query: { ...router.query, ...parsed } })
      }
    }
  }, [localStorageKey, router.isReady])

  useEffect(() => {
    const queryParamsToSerialize: Record<string, string> = {}
    Object.keys(router.query).forEach(key => {
      if (key.startsWith('!') || storeableQueries.includes(key)) {
        queryParamsToSerialize[key] = router.query[key] as string
      }
    })
    if (Object.keys(queryParamsToSerialize).length) {
      localStorage.setItem(
        localStorageKey,
        JSON.stringify(queryParamsToSerialize)
      )
    } else {
      localStorage.removeItem(localStorageKey)
    }
  }, [localStorageKey, router])

  return { resetToDefaults }
}

export const getListPage = (props: ListPageProps) => () => <ListPage {...props} />

function ListPage ({ listKey }: ListPageProps) {
  const keystone = useKeystone()
  const list = useList(listKey)
  const { query, push } = useRouter()
  const { resetToDefaults } = useQueryParamsFromLocalStorage(listKey)
  const { currentPage, pageSize } = usePaginationParams({
    defaultPageSize: list.pageSize,
  })
  const metaQuery = useQuery(listMetaGraphqlQuery, { variables: { listKey } })

  const { listViewFieldModesByField, filterableFields, orderableFields } =
    useMemo(() => {
      const listViewFieldModesByField: Record<string, 'read' | 'hidden'> = {}
      const orderableFields = new Set<string>()
      const filterableFields = new Set<string>()
      for (const field of metaQuery.data?.keystone.adminMeta.list?.fields || []) {
        listViewFieldModesByField[field.path] = field.listView.fieldMode
        if (field.isOrderable) {
          orderableFields.add(field.path)
        }
        if (field.isFilterable) {
          filterableFields.add(field.path)
        }
      }

      return { listViewFieldModesByField, orderableFields, filterableFields }
    }, [metaQuery.data?.keystone.adminMeta.list?.fields])

  const sort = useSort(list, orderableFields)
  const filters = useFilters(list, filterableFields)
  const searchParam = typeof query.search === 'string' ? query.search : ''
  const [searchString, setSearchString] = useState(searchParam)
  const search = useSearchFilter(searchParam, list, list.initialSearchFields, keystone.adminMeta.lists)

  useEffect(() => {
    if (searchParam === searchString) return
    setSearchString(searchParam)
  }, [searchParam])
  const updateSearch = (value: string) => {
    const { search, ...queries } = query

    if (value.trim()) {
      push({ query: { ...queries, search: value } })
    } else {
      push({ query: queries })
    }
  }

  const selectedFields = useSelectedFields(list, listViewFieldModesByField)
  const {
    data: newData,
    error: newError,
    refetch,
  } = useQuery(
    useMemo(() => {
      const selectedGqlFields = [...selectedFields]
        .map(fieldPath => list.fields[fieldPath].controller.graphqlSelection)
        .join('\n')

      // TODO: FIXME: this is bad
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
            ${selectedFields.has('id') ? '' : 'id'}
            ${selectedGqlFields}
          }
          count: ${list.graphql.names.listQueryCountName}(where: $where)
        }
      `
    }, [list, selectedFields]),
    {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
      skip: !metaQuery.data,
      variables: {
        where: { ...filters.where, ...search },
        take: pageSize,
        skip: (currentPage - 1) * pageSize,
        orderBy: sort
          ? [{ [sort.field]: sort.direction.toLowerCase() }]
          : undefined,
      },
    }
  )

  const [dataState, setDataState] = useState({ data: newData, error: newError })
  if (newData && dataState.data !== newData) setDataState({ data: newData, error: newError })

  const { data, error } = dataState
  const dataGetter = makeDataGetter<
    DeepNullable<{ count: number; items: { id: string; [key: string]: any }[] }>
  >(data, error?.graphQLErrors)

  const allowCreate = !(metaQuery.data?.keystone.adminMeta.list?.hideCreate ?? true)
  const allowDelete = !(metaQuery.data?.keystone.adminMeta.list?.hideDelete ?? true)
  const isConstrained = Boolean(filters.filters.length || query.search)
  const isEmpty = Boolean(data && data.count === 0 && !isConstrained)

  return (
    <PageContainer
      header={<ListPageHeader listKey={listKey} showCreate={allowCreate} />}
      title={list.label}
    >
      <GraphQLErrorNotice
        errors={[
          error?.networkError,
          ...error?.graphQLErrors ?? []
        ]}
      />
      {data && metaQuery.data ? (
        <VStack flex gap="large" paddingY="xlarge" minHeight={0} minWidth={0}>
          {/* FIXME: this is really weird; not sure where it should live. */}
          {/* {list.description !== null && (
            <p css={{ marginTop: '24px', maxWidth: '704px' }}>{list.description}</p>
          )} */}

          <HStack gap="regular" alignItems="center">
            <SearchField
              aria-label="Search"
              isDisabled={isEmpty}
              // label={`Search by ${searchLabels.length ? searchLabels.join(', ') : 'ID'}`}
              onClear={() => updateSearch('')}
              onSubmit={updateSearch}
              onChange={setSearchString}
              placeholder="Search…"
              value={searchString}
              width="alias.singleLineWidth"
              flexGrow={{ mobile: 1, tablet: 0 }}
            />
            <FilterAdd
              filterableFields={filterableFields}
              isDisabled={isEmpty}
              listKey={listKey}
            />
            <FieldSelection
              fieldModesByFieldPath={listViewFieldModesByField}
              isDisabled={isEmpty}
              list={list}
            />
            {Boolean(isConstrained || query.sortBy || query.fields) && (
              <TooltipTrigger>
                <ActionButton
                  aria-label="reset"
                  onPress={resetToDefaults}
                  prominence="low"
                >
                  <Icon src={undo2Icon} />
                </ActionButton>
                <Tooltip>Reset to defaults</Tooltip>
              </TooltipTrigger>
            )}
          </HStack>

          {filters.filters.length ? (
            <FilterList filters={filters.filters} list={list} />
          ) : null}

          <ListTable
            allowDelete={allowDelete}
            count={data.count}
            currentPage={currentPage}
            itemsGetter={dataGetter.get('items')}
            isConstrained={isConstrained}
            listKey={listKey}
            orderableFields={orderableFields}
            pageSize={pageSize}
            refetch={refetch}
            selectedFields={selectedFields}
          />
        </VStack>
      ) : (
        <VStack height="100%" alignItems="center" justifyContent="center">
          <ProgressCircle
            aria-label="loading items"
            size="large"
            isIndeterminate
          />
        </VStack>
      )}
    </PageContainer>
  )
}

const LIST_PAGE_TITLE_ID = 'keystone-list-page-title'

function ListPageHeader ({
  listKey,
  showCreate,
}: {
  listKey: string
  showCreate?: boolean
}) {
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

function ListTable({
  allowDelete,
  count,
  currentPage,
  isConstrained,
  itemsGetter,
  listKey,
  orderableFields,
  pageSize,
  refetch,
  selectedFields,
}: {
  allowDelete: boolean
  count: number
  currentPage: number
  isConstrained: boolean
  itemsGetter: DataGetter<DeepNullable<{ id: string; [key: string]: any }[]>>
  listKey: string
  orderableFields: Set<string>
  pageSize: number
  refetch: () => void
  selectedFields: ReturnType<typeof useSelectedFields>
}) {
  const list = useList(listKey)
  const router = useRouter()
  const [selectedKeys, setSelectedKeys] = useState<SelectedKeys>(() => new Set([]))
  const onSortChange = (sortDescriptor: SortDescriptor) => {
    const sortBy =
      sortDescriptor.direction === 'ascending'
        ? `-${sortDescriptor.column}`
        : sortDescriptor.column
    router.push({ query: { ...router.query, sortBy } })
  }
  const items = itemsGetter.data ? getNonNullItems(itemsGetter.data) : []
  const selectionMode = allowDelete ? 'multiple' : 'none'
  const selectedItemCount = selectedKeys === 'all' ? 'all' : selectedKeys.size
  const [idsForDeletion, setIdsForDeletion] = useState<Set<Key> | null>(null)
  const columns = [...selectedFields].map(path => {
    const field = list.fields[path]
    return {
      id: path,
      label: field.label,
      allowsSorting: !isConstrained && !items.length ? false : orderableFields.has(path),
    }
  })

  return (
    <Fragment>
      <ActionBarContainer flex minHeight="scale.3000">
        <TableView
          aria-labelledby={LIST_PAGE_TITLE_ID}
          selectionMode={selectionMode}
          onSortChange={onSortChange}
          sortDescriptor={
            parseSortQuery(router.query.sortBy) ||
            parseInitialSort(list.initialSort)
          }
          density="spacious"
          overflowMode="truncate"
          onSelectionChange={setSelectedKeys}
          selectedKeys={selectedKeys}
          renderEmptyState={() =>
            isConstrained ? (
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
        >
          <TableHeader columns={columns}>
            {({ label, id, ...options }) => (
              <Column key={id} isRowHeader {...options}>
                {label}
              </Column>
            )}
          </TableHeader>
          <TableBody items={items}>
            {row => {
              return (
                <Row href={`/${list.path}/${row?.id}`}>
                  {key => {
                    const field = list.fields[key]
                    const value = row[key]
                    const CellContent = field.views.Cell
                    return (
                      <Cell>
                        {CellContent ? (
                          <CellContent
                            value={value}
                            field={field.controller}
                            item={row}
                          />
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
          selectedItemCount={selectedItemCount}
          onClearSelection={() => setSelectedKeys(new Set())}
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
          onAction={key => {
            switch (key) {
              case 'delete':
                if (selectedKeys === 'all') {
                  const ids = []
                  for (const item of items) {
                    if (item.id != null) {
                      ids.push(item.id)
                    }
                  }

                  setIdsForDeletion(new Set(ids))
                } else {
                  setIdsForDeletion(selectedKeys)
                }
                break
              default:
                break
            }
          }}
        >
          <Item key="delete" textValue="Delete">
            <Icon src={trash2Icon} />
            <Text>Delete</Text>
          </Item>
        </ActionBar>
      </ActionBarContainer>

      {count > 0 && (
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          plural={list.plural}
          singular={list.singular}
          total={count}
        />
      )}

      <DialogContainer
        onDismiss={() => {
          setSelectedKeys(new Set())
          setIdsForDeletion(null)
        }}
      >
        {idsForDeletion && (
          <DeleteItemsDialog
            items={idsForDeletion}
            listKey={listKey}
            refetch={refetch}
          />
        )}
      </DialogContainer>
    </Fragment>
  )
}

function parseSortQuery(
  queryString?: string | string[]
): SortDescriptor | undefined {
  if (!queryString) return undefined

  // TODO: handle multiple sort queries?
  if (Array.isArray(queryString)) return parseSortQuery(queryString[0])

  const column = queryString.startsWith('-')
    ? queryString.slice(1)
    : queryString
  const direction = queryString.startsWith('-') ? 'ascending' : 'descending'

  return { column, direction }
}

function parseInitialSort(
  sort?: { field: string; direction: 'ASC' | 'DESC' } | null
): SortDescriptor | undefined {
  if (!sort) return undefined
  return {
    column: sort.field,
    direction: sort.direction === 'ASC' ? 'ascending' : 'descending',
  }
}

function DeleteItemsDialog(props: {
  items: Set<Key>
  listKey: string
  refetch: () => void
}) {
  const { items, listKey, refetch } = props
  const list = useList(listKey)

  const [deleteItems] = useMutation(
    useMemo(
      () =>
        gql`
        mutation($where: [${list.graphql.names.whereUniqueInputName}!]!) {
          ${list.graphql.names.deleteManyMutationName}(where: $where) {
            id
            ${list.labelField}
          }
        }
`,
      [list]
    ),
    { errorPolicy: 'all' }
  )

  const onDelete = async () => {
    const { data, errors } = await deleteItems({
      variables: { where: [...items].map(id => ({ id })) },
    })
    /*
      Data returns an array where successful deletions are item objects
      and unsuccessful deletions are null values.
      Run a reduce to count success and failure as well as
      to generate the success message to be passed to the success toast
     */
    const { successfulItems, unsuccessfulItems } = data[
      list.graphql.names.deleteManyMutationName
    ].reduce(
      (
        acc: {
          successfulItems: number
          unsuccessfulItems: number
          successMessage: string
        },
        curr: any
      ) => {
        if (curr) {
          acc.successfulItems++
          acc.successMessage =
            acc.successMessage === ''
              ? (acc.successMessage += curr[list.labelField])
              : (acc.successMessage += `, ${curr[list.labelField]}`)
        } else {
          acc.unsuccessfulItems++
        }
        return acc
      },
      { successfulItems: 0, unsuccessfulItems: 0, successMessage: '' } as {
        successfulItems: number
        unsuccessfulItems: number
        successMessage: string
      }
    )

    // if there are errors
    if (errors?.length) {
      // find out how many items failed to delete.
      // reduce error messages down to unique instances, and append to the toast as a message.
      toastQueue.critical(
        `Unable to delete ${unsuccessfulItems} item${
          unsuccessfulItems === 1 ? '' : 's'
        }.`,
        {
          timeout: 5000,
        }
      )
    }

    if (successfulItems) {
      toastQueue.neutral(
        `Deleted ${successfulItems} item${successfulItems === 1 ? '' : 's'}.`,
        {
          timeout: 5000,
        }
      )
    }

    return refetch()
  }

  return (
    <AlertDialog
      title="Delete items"
      cancelLabel="Cancel"
      primaryActionLabel="Yes, delete"
      onPrimaryAction={onDelete}
      tone="critical"
    >
      Are you sure? This will permanently delete {items.size} item
      {items.size === 1 ? '' : 's'}.
    </AlertDialog>
  )
}

function getNonNullItems<T>(arr: T[]) {
  return arr.filter(item => item != null) as NonNullable<T>[]
}
