import { useMemo, useState } from 'react'
import type { SortDescriptor } from '@keystar/ui/table'
import { Cell, Column, Row, TableBody, TableHeader, TableView } from '@keystar/ui/table'
import { Field as KeystarField } from '@keystar/ui/field'
import { useKeystone, useList } from '../../../../admin-ui/context'
import type { controller } from '.'
import { textSelectIcon } from '@keystar/ui/icon/icons/textSelectIcon'
import { EmptyState } from '../../../../admin-ui/components/EmptyState'
import { gql, useQuery } from '../../../../admin-ui/apollo'
import { Text } from '@keystar/ui/typography'
import { GraphQLErrorNotice } from '../../../../admin-ui/components'
import { PaginationControls } from '../../../../___internal-do-not-use-will-break-in-patch/admin-ui/pages/ListPage/PaginationControls'
import type { CountRelationshipValue } from './types'
import { useRelatedItemHref, useRelatedItemLabel } from './ContextualActions'
import { ActionButton } from '@keystar/ui/button'
import { Icon } from '@keystar/ui/icon'
import { arrowUpRightIcon } from '@keystar/ui/icon/icons/arrowUpRightIcon'
import { TooltipTrigger, Tooltip } from '@keystar/ui/tooltip'
import { ProgressCircle } from '@keystar/ui/progress'

export function RelationshipTable({
  field,
  value,
}: {
  field: ReturnType<typeof controller>
  value: CountRelationshipValue
}) {
  if (!field.refFieldKey) {
    throw new Error('refFieldKey is required for displayMode: table')
  }
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const list = useList(field.refListKey)
  const { adminPath } = useKeystone()
  const hasManyOnRefList: boolean = (list.fields[field.refFieldKey].controller as any).many

  const selectedFields = field.columns ?? list.initialColumns
  const columns = useMemo(() => {
    return selectedFields.map(path => {
      const field = list.fields[path]
      return {
        id: path,
        label: field.label,
        allowsSorting: field.isOrderable,
      }
    })
  }, [selectedFields, list])

  const [sort, setSort] = useState<SortDescriptor>(() => {
    if (field.initialSort) {
      return {
        column: field.initialSort.field,
        direction: field.initialSort.direction === 'ASC' ? 'ascending' : 'descending',
      }
    }
    return { column: 'id', direction: 'ascending' }
  })

  const { data, error, loading } = useQuery(
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
              ${selectedFields.includes('id') ? '' : 'id'}
              ${selectedGqlFields}
            }
          }
        `
    }, [list, selectedFields]),
    {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
      variables: {
        where: {
          [field.refFieldKey]: hasManyOnRefList
            ? { some: { id: { equals: value.id } } }
            : { id: { equals: value.id } },
        },
        take: pageSize,
        skip: (currentPage - 1) * pageSize,
        orderBy: [{ [sort.column]: sort.direction === 'ascending' ? 'asc' : 'desc' }],
      },
    }
  )
  const relatedItemLabel = useRelatedItemLabel(field)
  const relatedItemHref = useRelatedItemHref({ field, value })
  const items: Record<string, unknown>[] = data?.items ?? []
  return (
    <KeystarField label={field.label} description={field.description}>
      {inputProps => (
        <>
          <TableView
            {...inputProps}
            selectionMode="none"
            onSortChange={sort => setSort(sort)}
            sortDescriptor={sort}
            density="compact"
            UNSAFE_style={{ minHeight: 29 * 10, maxHeight: 29 * 10 }}
            overflowMode="truncate"
            renderEmptyState={() =>
              loading ? (
                <ProgressCircle isIndeterminate />
              ) : error ? (
                <GraphQLErrorNotice errors={[error.networkError, ...(error.graphQLErrors ?? [])]} />
              ) : (
                <EmptyState
                  icon={textSelectIcon}
                  title="Empty related items"
                  message="There are no related items."
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
          <PaginationControls
            currentPage={currentPage}
            pageSize={pageSize}
            plural={list.plural}
            singular={list.singular}
            total={value.count}
            onChangePage={page => setCurrentPage(page)}
            onChangePageSize={size => setPageSize(size)}
            extraActions={
              <TooltipTrigger>
                <ActionButton href={relatedItemHref!}>
                  <Icon src={arrowUpRightIcon} />
                </ActionButton>
                <Tooltip>{relatedItemLabel}</Tooltip>
              </TooltipTrigger>
            }
          />
        </>
      )}
    </KeystarField>
  )
}
