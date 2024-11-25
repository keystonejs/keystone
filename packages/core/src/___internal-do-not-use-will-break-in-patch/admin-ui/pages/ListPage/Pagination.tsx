import { useRouter } from 'next/router'
import React, { type Key, useEffect, useMemo } from 'react'

import { ActionButton } from '@keystar/ui/button'
import { Icon } from '@keystar/ui/icon'
import { chevronLeftIcon } from '@keystar/ui/icon/icons/chevronLeftIcon'
import { chevronRightIcon } from '@keystar/ui/icon/icons/chevronRightIcon'
import { HStack } from '@keystar/ui/layout'
import { Item, Picker } from '@keystar/ui/picker'
import { Text } from '@keystar/ui/typography'

type PaginationProps = {
  pageSize: number
  total: number
  currentPage: number
  singular: string
  plural: string
}

type PageItem = {
  label: string
  id: number
}

const PAGE_SIZES = [10, 25, 50, 100]

export function Pagination (props: PaginationProps) {
  const { currentPage, total, pageSize, singular, plural } = props

  const router = useRouter()
  const { stats } = getPaginationStats({ singular, plural, currentPage, total, pageSize })

  const nextPage = currentPage + 1
  const prevPage = currentPage - 1
  const minPage = 1

  const limit = Math.ceil(total / pageSize)
  const pageItems = useMemo(() => {
    let result: PageItem[] = []
    for (let page = minPage; page <= limit; page++) {
      result.push({
        id: page,
        label: String(page),
      })
    }
    return result
  }, [limit])

  useEffect(() => {
    // Check if the current page is larger than
    // the maximal page given the total and associated page size value.
    // (This could happen due to a deletion event, in which case we want to reroute the user to a previous page).
    if (currentPage > Math.ceil(total / pageSize)) {
      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          page: Math.ceil(total / pageSize),
        },
      })
    }
  }, [total, pageSize, currentPage, router])

  // Don't render the pagination component if the pageSize is greater than the
  // total number of items in the list.
  // if (total <= pageSize) {
  //   return null
  // }

  const onChangePage = (page: Key) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        page: page.toString(),
      },
    })
  }
  const onChangePageSize = (pageSize: Key) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        pageSize: pageSize.toString(),
      },
    })
  }

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
        <HStack
          isHidden={{ below: 'desktop' }}
          gap="regular"
          alignItems="center"
        >
          <Text id="items-per-page">
            {plural} per page:
          </Text>
          <Picker
            aria-labelledby="items-per-page"
            items={PAGE_SIZES.map(n => ({ label: String(n), id: n }))}
            onSelectionChange={onChangePageSize}
            selectedKey={pageSize}
            // disable sizes greater than the total, allowing the next page to be the last
            disabledKeys={PAGE_SIZES.filter(n => {
              return n > snapValueToNextAvailable(total)
            })}
            width="scale.1000"
          >
            {item => (
              <Item>{item.label}</Item>
            )}
          </Picker>
        </HStack>
        <Text color="neutralSecondary">
          {stats}
        </Text>
      </HStack>

      {/*
        right-side
        mobile: next/prev
        desktop^: current page (picker), next/prev
      */}
      <HStack gap="large" alignItems="center">
        <HStack
          isHidden={{ below: 'desktop' }}
          gap="regular"
          alignItems="center"
        >
          <Picker
            // prominence="low"
            aria-label={`Page number, of 11 pages`}
            items={pageItems}
            onSelectionChange={onChangePage}
            selectedKey={currentPage}
            width="scale.1000"
          >
            {item => (
              <Item>{item.label}</Item>
            )}
          </Picker>
          <Text>of {limit} pages</Text>
        </HStack>
        <HStack gap="regular">
          <ActionButton
            aria-label="Previous page"
            isDisabled={prevPage < minPage}
            onPress={() => onChangePage(prevPage)}
            // prominence="low"
          >
            <Icon src={chevronLeftIcon} />
          </ActionButton>
          <ActionButton
            aria-label="Next page"
            isDisabled={nextPage > limit}
            onPress={() => onChangePage(nextPage)}
            // prominence="low"
          >
            <Icon src={chevronRightIcon} />
          </ActionButton>
        </HStack>
      </HStack>
    </HStack>
  )
}

export function usePaginationParams ({ defaultPageSize }: { defaultPageSize: number }) {
  const { query } = useRouter()
  const currentPage = Math.max(
    typeof query.page === 'string' && !Number.isNaN(parseInt(query.page)) ? Number(query.page) : 1,
    1
  )
  const pageSize = snapValueToClosest(typeof query.pageSize === 'string' && !Number.isNaN(parseInt(query.pageSize))
      ? parseInt(query.pageSize)
      : defaultPageSize)

  return { currentPage, pageSize }
}

function getPaginationStats ({ singular, plural, pageSize, currentPage, total }: PaginationProps) {
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

function snapValueToClosest (input: number, range = PAGE_SIZES) {
  return range.reduce((prev, curr) => Math.abs(curr - input) < Math.abs(prev - input) ? curr : prev)
}
function snapValueToNextAvailable (input: number, range = PAGE_SIZES) {
  return range.find(value => input <= value) ?? range[range.length - 1]
}
