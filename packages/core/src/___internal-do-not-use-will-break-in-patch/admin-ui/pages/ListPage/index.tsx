/** @jsxRuntime classic */
/** @jsx jsx */

import { Fragment, type HTMLAttributes, type ReactNode, useEffect, useMemo, useState } from 'react'

import { Button } from '@keystone-ui/button'
import { Box, Center, Heading, jsx, Stack, useTheme, VisuallyHidden } from '@keystone-ui/core'
import { CheckboxControl, TextInput } from '@keystone-ui/fields'
import { ArrowRightCircleIcon } from '@keystone-ui/icons/icons/ArrowRightCircleIcon'
import { LoadingDots } from '@keystone-ui/loading'
import { AlertDialog } from '@keystone-ui/modals'
import { useToasts } from '@keystone-ui/toast'

import { SearchIcon } from '@keystone-ui/icons/icons/SearchIcon'
import { type ListMeta } from '../../../../types'
import {
  getRootGraphQLFieldsFromFieldController,
  type DataGetter,
  type DeepNullable,
  makeDataGetter,
} from '../../../../admin-ui/utils'
import { gql, type TypedDocumentNode, useMutation, useQuery } from '../../../../admin-ui/apollo'
import { CellLink } from '../../../../admin-ui/components'
import { PageContainer, HEADER_HEIGHT } from '../../../../admin-ui/components/PageContainer'
import { Pagination, PaginationLabel, usePaginationParams } from '../../../../admin-ui/components/Pagination'
import { useList } from '../../../../admin-ui/context'
import { GraphQLErrorNotice } from '../../../../admin-ui/components/GraphQLErrorNotice'
import { Link, useRouter } from '../../../../admin-ui/router'
import { useFilter } from '../../../../fields/types/relationship/views/RelationshipSelect'
import { CreateButtonLink } from '../../../../admin-ui/components/CreateButtonLink'
import { FieldSelection } from './FieldSelection'
import { FilterAdd } from './FilterAdd'
import { FilterList } from './FilterList'
import { SortSelection } from './SortSelection'
import { useFilters } from './useFilters'
import { useSelectedFields } from './useSelectedFields'
import { useSort } from './useSort'

type ListPageProps = { listKey: string }

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

function useQueryParamsFromLocalStorage (listKey: string) {
  const router = useRouter()
  const localStorageKey = `keystone.list.${listKey}.list.page.info`

  const resetToDefaults = () => {
    localStorage.removeItem(localStorageKey)
    router.replace({ pathname: router.pathname })
  }

  // GET QUERY FROM CACHE IF CONDITIONS ARE RIGHT
  // MERGE QUERY PARAMS FROM CACHE WITH QUERY PARAMS FROM ROUTER
  useEffect(
    () => {
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
    },
    [localStorageKey, router.isReady]
  )
  useEffect(() => {
    const queryParamsToSerialize: Record<string, string> = {}
    Object.keys(router.query).forEach(key => {
      if (key.startsWith('!') || storeableQueries.includes(key)) {
        queryParamsToSerialize[key] = router.query[key] as string
      }
    })
    if (Object.keys(queryParamsToSerialize).length) {
      localStorage.setItem(localStorageKey, JSON.stringify(queryParamsToSerialize))
    } else {
      localStorage.removeItem(localStorageKey)
    }
  }, [localStorageKey, router])

  return { resetToDefaults }
}

export const getListPage = (props: ListPageProps) => () => <ListPage {...props} />

function ListPage ({ listKey }: ListPageProps) {
  const list = useList(listKey)

  const { query, push } = useRouter()
  const { resetToDefaults } = useQueryParamsFromLocalStorage(listKey)
  const { currentPage, pageSize } = usePaginationParams({ defaultPageSize: list.pageSize })
  const metaQuery = useQuery(listMetaGraphqlQuery, { variables: { listKey } })

  const { listViewFieldModesByField, filterableFields, orderableFields } = useMemo(() => {
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

  const searchFields = Object.keys(list.fields).filter(key => list.fields[key].search)
  const searchLabels = searchFields.map(key => list.fields[key].label)

  const searchParam = typeof query.search === 'string' ? query.search : ''
  const [searchString, updateSearchString] = useState(searchParam)
  const search = useFilter(searchParam, list, searchFields)
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
          $where: ${list.gqlNames.whereInputName},
          $take: Int!,
          $skip: Int!,
          $orderBy: [${list.gqlNames.listOrderName}!]
        ) {
          items: ${list.gqlNames.listQueryName}(
            where: $where,
            take: $take,
            skip: $skip,
            orderBy: $orderBy
          ) {
            ${
              // TODO: maybe namespace all the fields instead of doing this
              selectedFields.has('id') ? '' : 'id'
            }
            ${selectedGqlFields}
          }
          count: ${list.gqlNames.listQueryCountName}(where: $where)
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
        orderBy: sort ? [{ [sort.field]: sort.direction.toLowerCase() }] : undefined,
      },
    }
  )

  const [dataState, setDataState] = useState({ data: newData, error: newError })
  if (newData && dataState.data !== newData) {
    setDataState({ data: newData, error: newError })
  }

  const { data, error } = dataState
  const dataGetter = makeDataGetter<
    DeepNullable<{ count: number, items: { id: string, [key: string]: any }[] }>
  >(data, error?.graphQLErrors)

  const [selectedItemsState, setSelectedItems] = useState(() => ({
    itemsFromServer: undefined as any,
    selectedItems: new Set() as ReadonlySet<string>,
  }))

  // this removes the selected items which no longer exist when the data changes
  // because someone goes to another page, changes filters or etc.
  if (data && data.items && selectedItemsState.itemsFromServer !== data.items) {
    const newSelectedItems = new Set<string>()
    data.items.forEach((item: any) => {
      if (selectedItemsState.selectedItems.has(item.id)) {
        newSelectedItems.add(item.id)
      }
    })
    setSelectedItems({ itemsFromServer: data.items, selectedItems: newSelectedItems })
  }

  const theme = useTheme()
  const showCreate = !(metaQuery.data?.keystone.adminMeta.list?.hideCreate ?? true) || null

  return (
    <PageContainer header={<ListPageHeader listKey={listKey} />} title={list.label}>
      {error?.graphQLErrors.length || error?.networkError ? (
        <GraphQLErrorNotice errors={error?.graphQLErrors} networkError={error?.networkError} />
      ) : null}
      {metaQuery.error ? 'Error...' : null}
      {data && metaQuery.data ? (
        <Fragment>
          {list.description !== null && (
            <p css={{ marginTop: '24px', maxWidth: '704px' }}>{list.description}</p>
          )}
          <Stack across gap="medium" align="center" marginTop="xlarge">
            <form
              onSubmit={e => {
                e.preventDefault()
                updateSearch(searchString)
              }}
            >
              <Stack across>
                <TextInput
                  css={{ borderRadius: '4px 0px 0px 4px' }}
                  autoFocus
                  value={searchString}
                  onChange={e => updateSearchString(e.target.value)}
                  placeholder={`Search by ${searchLabels.length ? searchLabels.join(', ') : 'ID'}`}
                />
                <Button css={{ borderRadius: '0px 4px 4px 0px' }} type="submit">
                  <SearchIcon />
                </Button>
              </Stack>
            </form>
            {showCreate && <CreateButtonLink list={list} />}
            {data.count || filters.filters.length ? (
              <FilterAdd listKey={listKey} filterableFields={filterableFields} />
            ) : null}
            {filters.filters.length ? <FilterList filters={filters.filters} list={list} /> : null}
            {Boolean(filters.filters.length || query.sortBy !== undefined || query.fields || query.search) && (
              <Button size="small" onClick={resetToDefaults}>
                Reset to defaults
              </Button>
            )}
          </Stack>
          {data.count ? (
            <Fragment>
              <ResultsSummaryContainer>
                {(() => {
                  const selectedItems = selectedItemsState.selectedItems
                  const selectedItemsCount = selectedItems.size
                  if (selectedItemsCount) {
                    return (
                      <Fragment>
                        <span css={{ marginRight: theme.spacing.small }}>
                          Selected {selectedItemsCount} of {data.items.length}
                        </span>
                        {!(metaQuery.data?.keystone.adminMeta.list?.hideDelete ?? true) && (
                          <DeleteManyButton
                            list={list}
                            selectedItems={selectedItems}
                            refetch={refetch}
                          />
                        )}
                      </Fragment>
                    )
                  }
                  return (
                    <Fragment>
                      <PaginationLabel
                        currentPage={currentPage}
                        pageSize={pageSize}
                        plural={list.plural}
                        singular={list.singular}
                        total={data.count}
                      />
                      , sorted by <SortSelection list={list} orderableFields={orderableFields} />
                      with{' '}
                      <FieldSelection
                        list={list}
                        fieldModesByFieldPath={listViewFieldModesByField}
                      />{' '}
                    </Fragment>
                  )
                })()}
              </ResultsSummaryContainer>
              <ListTable
                count={data.count}
                currentPage={currentPage}
                itemsGetter={dataGetter.get('items')}
                listKey={listKey}
                pageSize={pageSize}
                selectedFields={selectedFields}
                sort={sort}
                selectedItems={selectedItemsState.selectedItems}
                onSelectedItemsChange={selectedItems => {
                  setSelectedItems({
                    itemsFromServer: selectedItemsState.itemsFromServer,
                    selectedItems,
                  })
                }}
                orderableFields={orderableFields}
              />
            </Fragment>
          ) : (
            <ResultsSummaryContainer>No {list.plural} found.</ResultsSummaryContainer>
          )}
        </Fragment>
      ) : (
        <Center css={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}>
          <LoadingDots label="Loading item data" size="large" tone="passive" />
        </Center>
      )}
    </PageContainer>
  )
}

const ListPageHeader = ({ listKey }: { listKey: string }) => {
  const list = useList(listKey)
  return (
    <Fragment>
      <div
        css={{
          alignItems: 'center',
          display: 'flex',
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        <Heading type="h3">{list.label}</Heading>
      </div>
    </Fragment>
  )
}

const ResultsSummaryContainer = ({ children }: { children: ReactNode }) => (
  <p
    css={{
      // TODO: don't do this
      // (this is to make it so things don't move when a user selects an item)
      minHeight: 38,

      display: 'flex',
      alignItems: 'center',
    }}
  >
    {children}
  </p>
)

const SortDirectionArrow = ({ direction }: { direction: 'ASC' | 'DESC' }) => {
  const size = '0.25em'
  return (
    <span
      css={{
        borderLeft: `${size} solid transparent`,
        borderRight: `${size} solid transparent`,
        borderTop: `${size} solid`,
        display: 'inline-block',
        height: 0,
        marginLeft: '0.33em',
        marginTop: '-0.125em',
        verticalAlign: 'middle',
        width: 0,
        transform: `rotate(${direction === 'DESC' ? '0deg' : '180deg'})`,
      }}
    />
  )
}

function DeleteManyButton ({
  selectedItems,
  list,
  refetch,
}: {
  selectedItems: ReadonlySet<string>
  list: ListMeta
  refetch: () => void
}) {
  const [deleteItems, deleteItemsState] = useMutation(
    useMemo(
      () =>
        gql`
        mutation($where: [${list.gqlNames.whereUniqueInputName}!]!) {
          ${list.gqlNames.deleteManyMutationName}(where: $where) {
            id
            ${list.labelField}
          }
        }
`,
      [list]
    ),
    { errorPolicy: 'all' }
  )
  const [isOpen, setIsOpen] = useState(false)
  const toasts = useToasts()
  return (
    <Fragment>
      <Button
        isLoading={deleteItemsState.loading}
        tone="negative"
        onClick={async () => {
          setIsOpen(true)
        }}
      >
        Delete
      </Button>
      <AlertDialog
        // TODO: change the copy in the title and body of the modal
        isOpen={isOpen}
        title="Delete Confirmation"
        tone="negative"
        actions={{
          confirm: {
            label: 'Delete',
            action: async () => {
              const { data, errors } = await deleteItems({
                variables: { where: [...selectedItems].map(id => ({ id })) },
              })
              /*
                Data returns an array where successful deletions are item objects
                and unsuccessful deletions are null values.
                Run a reduce to count success and failure as well as
                to generate the success message to be passed to the success toast
               */
              const { successfulItems, unsuccessfulItems, successMessage } = data[
                list.gqlNames.deleteManyMutationName
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

              // If there are errors
              if (errors?.length) {
                // Find out how many items failed to delete.
                // Reduce error messages down to unique instances, and append to the toast as a message.
                toasts.addToast({
                  tone: 'negative',
                  title: `Failed to delete ${unsuccessfulItems} of ${
                    data[list.gqlNames.deleteManyMutationName].length
                  } ${list.plural}`,
                  message: errors
                    .reduce((acc, error) => {
                      if (acc.indexOf(error.message) < 0) {
                        acc.push(error.message)
                      }
                      return acc
                    }, [] as string[])
                    .join('\n'),
                })
              }

              if (successfulItems) {
                toasts.addToast({
                  tone: 'positive',
                  title: `Deleted ${successfulItems} of ${
                    data[list.gqlNames.deleteManyMutationName].length
                  } ${list.plural} successfully`,
                  message: successMessage,
                })
              }

              return refetch()
            },
          },
          cancel: {
            label: 'Cancel',
            action: () => {
              setIsOpen(false)
            },
          },
        }}
      >
        Are you sure you want to delete {selectedItems.size}{' '}
        {selectedItems.size === 1 ? list.singular : list.plural}?
      </AlertDialog>
    </Fragment>
  )
}

function ListTable ({
  selectedFields,
  listKey,
  itemsGetter,
  count,
  sort,
  currentPage,
  pageSize,
  selectedItems,
  onSelectedItemsChange,
  orderableFields,
}: {
  selectedFields: ReturnType<typeof useSelectedFields>
  listKey: string
  itemsGetter: DataGetter<DeepNullable<{ id: string, [key: string]: any }[]>>
  count: number
  sort: { field: string, direction: 'ASC' | 'DESC' } | null
  currentPage: number
  pageSize: number
  selectedItems: ReadonlySet<string>
  onSelectedItemsChange(selectedItems: ReadonlySet<string>): void
  orderableFields: Set<string>
}) {
  const list = useList(listKey)
  const { query } = useRouter()
  const shouldShowLinkIcon = selectedFields.keys().some((k, i) => !list.fields[k].views.Cell.supportsLinkTo && i === 0)
  return (
    <Box paddingBottom="xlarge">
      <TableContainer>
        <VisuallyHidden as="caption">{list.label} list</VisuallyHidden>
        <colgroup>
          <col width="30" />
          {shouldShowLinkIcon && <col width="30" />}
          {[...selectedFields].map(path => (
            <col key={path} />
          ))}
        </colgroup>
        <TableHeaderRow>
          <TableHeaderCell css={{ paddingLeft: 0 }}>
            <label
              css={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'start',
                cursor: 'pointer',
              }}
            >
              <CheckboxControl
                size="small"
                checked={selectedItems.size === itemsGetter.data?.length}
                css={{ cursor: 'default' }}
                onChange={() => {
                  const newSelectedItems = new Set<string>()
                  if (selectedItems.size !== itemsGetter.data?.length) {
                    itemsGetter.data?.forEach(item => {
                      if (item !== null && item.id !== null) {
                        newSelectedItems.add(item.id)
                      }
                    })
                  }
                  onSelectedItemsChange(newSelectedItems)
                }}
              />
            </label>
          </TableHeaderCell>
          {shouldShowLinkIcon && <TableHeaderCell />}
          {[...selectedFields].map(path => {
            const label = list.fields[path].label
            if (!orderableFields.has(path)) return <TableHeaderCell key={path}>{label}</TableHeaderCell>
            return (
              <TableHeaderCell key={path}>
                <Link
                  css={{
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit',
                    ':hover': { color: 'inherit' },
                  }}
                  href={{
                    query: {
                      ...query,
                      sortBy: sort?.field === path && sort.direction === 'ASC' ? `-${path}` : path,
                    },
                  }}
                >
                  {label}
                  {sort?.field === path && <SortDirectionArrow direction={sort.direction} />}
                </Link>
              </TableHeaderCell>
            )
          })}
        </TableHeaderRow>
        <tbody>
          {(itemsGetter.data ?? []).map((_, index) => {
            const itemGetter = itemsGetter.get(index)
            if (itemGetter.data === null || itemGetter.data.id === null) {
              if (itemGetter.errors) {
                return (
                  <tr css={{ color: 'red' }} key={`index:${index}`}>
                    {itemGetter.errors[0].message}
                  </tr>
                )
              }
              return null
            }
            const itemId = itemGetter.data.id
            return (
              <tr key={itemId || `index:${index}`}>
                <TableBodyCell>
                  <label
                    css={{
                      display: 'flex',
                      minHeight: 38,
                      alignItems: 'center',
                      justifyContent: 'start',
                    }}
                  >
                    <CheckboxControl
                      size="small"
                      checked={selectedItems.has(itemId)}
                      css={{ cursor: 'default' }}
                      onChange={() => {
                        const newSelectedItems = new Set(selectedItems)
                        if (selectedItems.has(itemId)) {
                          newSelectedItems.delete(itemId)
                        } else {
                          newSelectedItems.add(itemId)
                        }
                        onSelectedItemsChange(newSelectedItems)
                      }}
                    />
                  </label>
                </TableBodyCell>
                {shouldShowLinkIcon && (
                  <TableBodyCell>
                    <Link
                      css={{
                        textDecoration: 'none',
                        minHeight: 38,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      href={`/${list.path}/[id]`}
                      as={`/${list.path}/${encodeURIComponent(itemId)}`}
                    >
                      <ArrowRightCircleIcon size="smallish" aria-label="Go to item" />
                    </Link>
                  </TableBodyCell>
                )}
                {[...selectedFields].map((path, i) => {
                  const field = list.fields[path]
                  const { Cell } = list.fields[path].views
                  const itemForField: Record<string, any> = {}
                  for (const graphqlField of getRootGraphQLFieldsFromFieldController(field.controller)) {
                    const fieldGetter = itemGetter.get(graphqlField)
                    if (fieldGetter.errors) {
                      const errorMessage = fieldGetter.errors[0].message
                      return (
                        <TableBodyCell css={{ color: 'red' }} key={path}>
                          {i === 0 && Cell.supportsLinkTo ? (
                            <CellLink
                              href={`/${list.path}/[id]`}
                              as={`/${list.path}/${encodeURIComponent(itemId)}`}
                            >
                              {errorMessage}
                            </CellLink>
                          ) : (
                            errorMessage
                          )}
                        </TableBodyCell>
                      )
                    }
                    itemForField[graphqlField] = fieldGetter.data
                  }

                  return (
                    <TableBodyCell key={path}>
                      <Cell
                        field={field.controller}
                        item={itemForField}
                        linkTo={
                          i === 0 && Cell.supportsLinkTo
                            ? {
                                href: `/${list.path}/[id]`,
                                as: `/${list.path}/${encodeURIComponent(itemId)}`,
                              }
                            : undefined
                        }
                      />
                    </TableBodyCell>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </TableContainer>
      <Pagination singular={list.singular} plural={list.plural} total={count} currentPage={currentPage} pageSize={pageSize} />
    </Box>
  )
}

function TableContainer ({ children }: { children: ReactNode }) {
  return (
    <table
      css={{
        minWidth: '100%',
        tableLayout: 'fixed',
        'tr:last-child td': { borderBottomWidth: 0 },
      }}
      cellPadding="0"
      cellSpacing="0"
    >
      {children}
    </table>
  )
}

function TableHeaderRow ({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr>{children}</tr>
    </thead>
  )
}

function TableHeaderCell (props: HTMLAttributes<HTMLElement>) {
  const { colors, spacing, typography } = useTheme()
  return (
    <th
      css={{
        backgroundColor: colors.background,
        borderBottom: `2px solid ${colors.border}`,
        color: colors.foregroundDim,
        fontSize: typography.fontSize.medium,
        fontWeight: typography.fontWeight.medium,
        padding: spacing.small,
        textAlign: 'left',
        position: 'sticky',
        top: 0,
      }}
      {...props}
    />
  )
}

function TableBodyCell (props: HTMLAttributes<HTMLElement>) {
  const { colors, typography } = useTheme()
  return (
    <td
      css={{
        borderBottom: `1px solid ${colors.border}`,
        fontSize: typography.fontSize.medium,
      }}
      {...props}
    />
  )
}
