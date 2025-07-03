'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { type Key, useEffect } from 'react'

import { PaginationControls, snapValueToClosest } from './PaginationControls'
import { toQueryParams } from './lib'

type PaginationProps = {
  pageSize: number
  total: number
  currentPage: number
  singular: string
  plural: string
}

export function Pagination(props: PaginationProps) {
  const { currentPage, total, pageSize } = props

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = Object.fromEntries(searchParams.entries())

  useEffect(() => {
    // Check if the current page is larger than
    // the maximal page given the total and associated page size value.
    // (This could happen due to a deletion event, in which case we want to reroute the user to a previous page).
    if (currentPage > Math.ceil(total / pageSize)) {
      router.push(
        `${pathname}${toQueryParams({ ...query, page: Math.ceil(total / pageSize).toString() })}`
      )
    }
  }, [total, pageSize, currentPage, router, pathname, query])

  // Don't render the pagination component if the pageSize is greater than the
  // total number of items in the list.
  // if (total <= pageSize) {
  //   return null
  // }

  const onChangePage = (page: Key) => {
    router.push(
      `${pathname}${toQueryParams({
        ...query,
        page: page.toString(),
      })}`
    )
  }
  const onChangePageSize = (pageSize: Key) => {
    router.push(
      `${pathname}${toQueryParams({
        ...query,
        pageSize: pageSize.toString(),
      })}`
    )
  }

  return (
    <PaginationControls
      onChangePageSize={onChangePageSize}
      onChangePage={onChangePage}
      {...props}
    />
  )
}

export function usePaginationParams({ defaultPageSize }: { defaultPageSize: number }) {
  const searchParams = useSearchParams()
  const query = Object.fromEntries(searchParams.entries())
  const currentPage = Math.max(
    typeof query.page === 'string' && !Number.isNaN(parseInt(query.page)) ? Number(query.page) : 1,
    1
  )
  const pageSize = snapValueToClosest(
    typeof query.pageSize === 'string' && !Number.isNaN(parseInt(query.pageSize))
      ? parseInt(query.pageSize)
      : defaultPageSize
  )

  return { currentPage, pageSize }
}
