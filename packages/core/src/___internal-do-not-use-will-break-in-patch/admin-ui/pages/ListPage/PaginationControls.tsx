import { ActionButton } from '@keystar/ui/button'
import { Icon } from '@keystar/ui/icon'
import { chevronLeftIcon } from '@keystar/ui/icon/icons/chevronLeftIcon'
import { chevronRightIcon } from '@keystar/ui/icon/icons/chevronRightIcon'
import { HStack } from '@keystar/ui/layout'
import { Picker } from '@keystar/ui/picker'
import { Item } from '@keystar/ui/tag'
import { Text } from '@keystar/ui/typography'
import type { ReactNode } from 'react'
import React, { useMemo } from 'react'

type PageItem = {
  label: string
  id: number
}

export function PaginationControls(props: {
  pageSize: number
  total: number
  currentPage: number
  singular: string
  plural: string
  onChangePage: (page: number) => void
  onChangePageSize: (pageSize: number) => void
  extraActions?: ReactNode
}) {
  const { currentPage, total, pageSize } = props

  const { stats } = getPaginationStats(props)

  const nextPage = currentPage + 1
  const prevPage = currentPage - 1
  const minPage = 1

  const limit = Math.ceil(total / pageSize)
  const pageItems = useMemo(() => {
    const result: PageItem[] = []
    for (let page = minPage; page <= limit; page++) {
      result.push({
        id: page,
        label: String(page),
      })
    }
    return result
  }, [limit])

  // Don't render the pagination component if the pageSize is greater than the
  // total number of items in the list.
  // if (total <= pageSize) {
  //   return null
  // }

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
            // disable sizes greater than the total, allowing the next page to be the last
            disabledKeys={PAGE_SIZES.filter(n => {
              return n > snapValueToNextAvailable(total)
            })}
            width="scale.1000"
          >
            {item => <Item>{item.label}</Item>}
          </Picker>
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
            aria-label={`Page number, of 11 pages`}
            items={pageItems}
            onSelectionChange={page => {
              props.onChangePage(Number(page))
            }}
            selectedKey={currentPage}
            width="scale.1000"
          >
            {item => <Item>{item.label}</Item>}
          </Picker>
          <Text>of {limit} pages</Text>
        </HStack>
        <HStack gap="regular">
          <ActionButton
            aria-label="Previous page"
            isDisabled={prevPage < minPage}
            onPress={() => props.onChangePage(prevPage)}
            // prominence="low"
          >
            <Icon src={chevronLeftIcon} />
          </ActionButton>
          <ActionButton
            aria-label="Next page"
            isDisabled={nextPage > limit}
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

function snapValueToNextAvailable(input: number, range = PAGE_SIZES) {
  return range.find(value => input <= value) ?? range[range.length - 1]
}

export function snapValueToClosest(input: number, range = PAGE_SIZES) {
  return range.reduce((prev, curr) =>
    Math.abs(curr - input) < Math.abs(prev - input) ? curr : prev
  )
}
