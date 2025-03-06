import React, {
  type Key,
  Fragment,
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
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

import type { TypedDocumentNode } from '../../../../admin-ui/apollo'
import { gql, useMutation, useQuery, useSuspenseQuery } from '../../../../admin-ui/apollo'
import { PageContainer } from '../../../../admin-ui/components/PageContainer'
import { useList } from '../../../../admin-ui/context'
import { EmptyState } from '../../../../admin-ui/components/EmptyState'
import { GraphQLErrorNotice } from '../../../../admin-ui/components/GraphQLErrorNotice'
import { CreateButtonLink } from '../../../../admin-ui/components/CreateButtonLink'
import { FieldSelection } from './FieldSelection'
import { FilterAdd } from './FilterAdd'
import { FilterList } from './FilterList'
import { Pagination, usePaginationParams } from './Pagination'
import { useSearchFilter } from '../../../../fields/types/relationship/views/useFilter'
import { ProgressCircle } from '@keystar/ui/progress'
import { parseFilters, parseSelectedFields, parseSortBy } from './search-params'

type ListPageProps = { listKey: string }
type SelectedKeys = 'all' | Set<number | string>

const storeableQueries = ['sortBy', 'fields']

function useQueryParamsFromLocalStorage(listKey: string) {
  const router = useRouter()
  const localStorageKey = `keystone.list.${listKey}.list.page.info`
  const resetToDefaults = () => {
    localStorage.removeItem(localStorageKey)
    router.replace({ pathname: router.pathname })
  }

  useEffect(() => {
    const hasSomeQueryParamsWhichAreAboutListPage = Object.keys(router.query).some(x => {
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
    for (const key in router.query) {
      if (key.startsWith('!') || storeableQueries.includes(key)) {
        queryParamsToSerialize[key] = router.query[key] as string
      }
    }
    if (Object.keys(queryParamsToSerialize).length) {
      localStorage.setItem(localStorageKey, JSON.stringify(queryParamsToSerialize))
    } else {
      localStorage.removeItem(localStorageKey)
    }
  }, [localStorageKey, router])

  return { resetToDefaults }
}

export const getListPage = (props: ListPageProps) => () => <ListPage {...props} />

function ListPage({ listKey }: ListPageProps) {
  const list = useList(listKey)
  const { query, push } = useRouter()
  const { resetToDefaults } = useQueryParamsFromLocalStorage(listKey)
  const { currentPage, pageSize } = usePaginationParams({
    defaultPageSize: list.pageSize,
  })
  const filters = useMemo(() => parseFilters(list, query), [list, query])
  const [searchString, setSearchString] = useState(
    typeof query.search === 'string' ? query.search : ''
  )

  const updateSearch = (value: string) => {
    const { search, ...queries } = query

    if (value.trim()) {
      push({ query: { ...queries, search: value } })
    } else {
      push({ query: queries })
    }
  }

  const allowCreate = !(list.hideCreate ?? true)
  const isConstrained = Boolean(filters.filters.length || query.search)

  return (
    <PageContainer
      header={<ListPageHeader listKey={listKey} showCreate={allowCreate} />}
      title={list.label}
    >
      <VStack flex gap="large" paddingY="xlarge" minHeight={0} minWidth={0}>
        {/* TODO: FIXME: not sure where to put this */}
        {/* {list.description !== null && (
          <p css={{ marginTop: '24px', maxWidth: '704px' }}>{list.description}</p>
        )} */}
        <HStack gap="regular" alignItems="center">
          <SearchField
            aria-label="Search"
            // label={`Search by ${searchLabels.length ? searchLabels.join(', ') : 'ID'}`}
            onClear={() => updateSearch('')}
            onSubmit={updateSearch}
            onChange={setSearchString}
            placeholder="Search…"
            value={searchString}
            width="alias.singleLineWidth"
            flexGrow={{ mobile: 1, tablet: 0 }}
          />
          <FilterAdd listKey={listKey} />
          <FieldSelection listKey={listKey} />
          {Boolean(isConstrained || query.sortBy || query.fields) && (
            <TooltipTrigger>
              <ActionButton aria-label="reset" onPress={resetToDefaults} prominence="low">
                <Icon src={undo2Icon} />
              </ActionButton>
              <Tooltip>Reset to defaults</Tooltip>
            </TooltipTrigger>
          )}
        </HStack>

        {filters.filters.length ? <FilterList filters={filters.filters} list={list} /> : null}

        <Suspense fallback={<ProgressCircle isIndeterminate />}>
          <ListTable
            listKey={listKey}
            currentPage={currentPage}
            pageSize={pageSize}
            where={filters.where}
            isConstrained={isConstrained}
          />
        </Suspense>
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

function ListTable({
  currentPage,
  listKey,
  pageSize,
  where,
  isConstrained,
}: {
  currentPage: number
  listKey: string
  pageSize: number
  where: Record<string, unknown>
  isConstrained: boolean
}) {
  const list = useList(listKey)
  const { query } = useRouter()
  const searchParam = typeof query.search === 'string' ? query.search : ''
  const deferredSearchParam = useDeferredValue(searchParam)
  const search = useSearchFilter(deferredSearchParam, list, list.initialSearchFields)
  const selectedFields = useMemo(
    () => parseSelectedFields(list, query.fields),
    [list, query.fields]
  )

  const sort = parseSortBy(list, query.sortBy)

  const { data, error, refetch } = useSuspenseQuery(
    useMemo((): TypedDocumentNode<
      {
        items: Record<string, unknown>[] | null
        count: number | null
      },
      {
        where: Record<string, unknown>
        take: number
        skip: number
        orderBy: { [key: string]: 'asc' | 'desc' }[] | undefined
      }
    > => {
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
      variables: {
        where: { ...where, ...search },
        take: pageSize,
        skip: (currentPage - 1) * pageSize,
        orderBy: sort
          ? [{ [sort.column]: sort.direction === 'ascending' ? 'asc' : 'desc' }]
          : undefined,
      },
    }
  )

  const router = useRouter()
  const [selectedKeys, setSelectedKeys] = useState<SelectedKeys>(() => new Set([]))
  const onSortChange = (sortDescriptor: SortDescriptor) => {
    const sortBy =
      sortDescriptor.direction === 'ascending' ? `-${sortDescriptor.column}` : sortDescriptor.column
    router.push({ query: { ...router.query, sortBy } })
  }
  const selectedItemCount = selectedKeys === 'all' ? 'all' : selectedKeys.size
  const [idsForDeletion, setIdsForDeletion] = useState<Set<Key> | null>(null)
  const columns = [...selectedFields].map(path => {
    const field = list.fields[path]
    return {
      id: path,
      label: field.label,
      allowsSorting: field.isOrderable,
    }
  })

  const items = data?.items ?? []

  return (
    <Fragment>
      <GraphQLErrorNotice errors={[error?.networkError, ...(error?.graphQLErrors ?? [])]} />
      <ActionBarContainer flex minHeight="scale.3000">
        <TableView
          aria-labelledby={LIST_PAGE_TITLE_ID}
          selectionMode={list.hideDelete ? 'none' : 'multiple'}
          onSortChange={onSortChange}
          sortDescriptor={parseSortBy(list, query.sortBy)}
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
                  const ids = items.filter(x => x.id != null).map(x => `${x.id}`)
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

      {!!data?.count && (
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          plural={list.plural}
          singular={list.singular}
          total={data.count}
        />
      )}

      <DialogContainer
        onDismiss={() => {
          setSelectedKeys(new Set())
          setIdsForDeletion(null)
        }}
      >
        {idsForDeletion && (
          <DeleteItemsDialog items={idsForDeletion} listKey={listKey} refetch={refetch} />
        )}
      </DialogContainer>
    </Fragment>
  )
}

function DeleteItemsDialog(props: { items: Set<Key>; listKey: string; refetch: () => void }) {
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
        `Unable to delete ${unsuccessfulItems} item${unsuccessfulItems === 1 ? '' : 's'}.`,
        {
          timeout: 5000,
        }
      )
    }

    if (successfulItems) {
      toastQueue.neutral(`Deleted ${successfulItems} item${successfulItems === 1 ? '' : 's'}.`, {
        timeout: 5000,
      })
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
