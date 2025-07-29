import { ActionButton } from '@keystar/ui/button'
import { Icon } from '@keystar/ui/icon'
import { chevronLeftIcon } from '@keystar/ui/icon/icons/chevronLeftIcon'
import { chevronRightIcon } from '@keystar/ui/icon/icons/chevronRightIcon'
import { undo2Icon } from '@keystar/ui/icon/icons/undo2Icon'
import { HStack } from '@keystar/ui/layout'
import { Picker } from '@keystar/ui/picker'
import { Item } from '@keystar/ui/tag'
import { Tooltip, TooltipTrigger } from '@keystar/ui/tooltip'
import { Text } from '@keystar/ui/typography'
import type { ReactNode } from 'react'
import { useMemo } from 'react'

type PageItem = {
  label: string
  id: number
}

export function PaginationControls(props: {
  singular: string
  plural: string
  currentPage: number
  pageSize: number
  total: number
  defaultPageSize?: number
  onChangePage: (page: number) => void
  onChangePageSize: (pageSize: number) => void
  extraActions?: ReactNode
}) {
  const { currentPage, total, pageSize, defaultPageSize } = props
  const { stats } = getPaginationStats(props)

  const nextPage = currentPage + 1
  const prevPage = currentPage - 1
  const lastPage = Math.max(Math.ceil(total / pageSize), 1)

  const pageItems = useMemo(() => {
    const result: PageItem[] = []
    for (let page = 1; page <= lastPage; page++) {
      result.push({
        id: page,
        label: String(page),
      })
    }
    return result
  }, [lastPage])

  return (
    <HStack
      as="nav"
      role="navigation"
      aria-label="Pagination"
      // alignItems="center"
      justifyContent="space-between"
    >
      {/*
        left-side
        mobile: counts
        desktop^: items per page (picker), counts
      */}
      <HStack gap="large" alignItems="center">
        <HStack isHidden={{ below: 'desktop' }} gap="regular" alignItems="center">
          <Text id="items-per-page">{props.plural} per page:</Text>
          <Picker
            aria-labelledby="items-per-page"
            items={PAGE_SIZES.map(n => ({ label: String(n), id: n }))}
            onSelectionChange={key => {
              props.onChangePageSize(Number(key))
            }}
            selectedKey={pageSize}
            width="scale.1000"
          >
            {item => <Item>{item.label}</Item>}
          </Picker>
          {defaultPageSize !== undefined && pageSize !== defaultPageSize ? (
            <TooltipTrigger>
              <ActionButton
                aria-label="reset"
                onPress={() => props.onChangePageSize(defaultPageSize)}
                prominence="low"
              >
                <Icon src={undo2Icon} />
              </ActionButton>
              <Tooltip>Reset to defaults</Tooltip>
            </TooltipTrigger>
          ) : null}
        </HStack>
        <Text color="neutralSecondary">{stats}</Text>
      </HStack>

      {/*
        right-side
        mobile: next/prev
        desktop^: current page (picker), next/prev
      */}
      <HStack gap="large" alignItems="center">
        <HStack isHidden={{ below: 'desktop' }} gap="regular" alignItems="center">
          <Picker
            // prominence="low"
            aria-label={`Page number, of ${lastPage} pages`}
            items={pageItems}
            onSelectionChange={page => {
              props.onChangePage(Number(page))
            }}
            selectedKey={currentPage}
            width="scale.1000"
          >
            {item => <Item>{item.label}</Item>}
          </Picker>
          <Text>of {lastPage} pages</Text>
        </HStack>
        <HStack gap="regular">
          <ActionButton
            aria-label="Previous page"
            isDisabled={prevPage < 1}
            onPress={() => props.onChangePage(prevPage)}
            // prominence="low"
          >
            <Icon src={chevronLeftIcon} />
          </ActionButton>
          <ActionButton
            aria-label="Next page"
            isDisabled={nextPage > lastPage}
            onPress={() => props.onChangePage(nextPage)}
            // prominence="low"
          >
            <Icon src={chevronRightIcon} />
          </ActionButton>
          {props.extraActions}
        </HStack>
      </HStack>
    </HStack>
  )
}

function getPaginationStats({
  singular,
  plural,
  pageSize,
  currentPage,
  total,
}: {
  singular: string
  plural: string
  pageSize: number
  currentPage: number
  total: number
}) {
  let stats = ''
  if (total > pageSize) {
    const start = pageSize * (currentPage - 1) + 1
    const end = Math.min(start + pageSize - 1, total)
    stats = `${start} - ${end} of ${total} ${plural}`
  } else {
    if (total > 1 && plural) {
      stats = `${total} ${plural}`
    } else if (total === 1 && singular) {
      stats = `${total} ${singular}`
    }
  }
  return { stats }
}

const PAGE_SIZES = [10, 25, 50, 100]

export function snapValueToClosest(input: number, range = PAGE_SIZES) {
  return range.reduce((prev, curr) =>
    Math.abs(curr - input) < Math.abs(prev - input) ? curr : prev
  )
}
