import { type Key, useCallback, useEffect } from 'react'

import { PaginationControls, snapValueToClosest } from './PaginationControls'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

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

  const pushSearchParam = useCallback(
    (key: string, value: string) => {
      router.push(`/${pathname}?${new URLSearchParams([...searchParams.entries(), [key, value]])}`)
    },
    [pathname, router, searchParams]
  )
  useEffect(() => {
    // Check if the current page is larger than
    // the maximal page given the total and associated page size value.
    // (This could happen due to a deletion event, in which case we want to reroute the user to a previous page).
    if (currentPage > Math.ceil(total / pageSize)) {
      pushSearchParam('page', Math.ceil(total / pageSize).toString())
    }
  }, [currentPage, pageSize, pushSearchParam, total])

  // Don't render the pagination component if the pageSize is greater than the
  // total number of items in the list.
  // if (total <= pageSize) {
  //   return null
  // }

  const onChangePage = (page: Key) => {
    pushSearchParam('page', page.toString())
  }
  const onChangePageSize = (pageSize: Key) => {
    pushSearchParam('pageSize', pageSize.toString())
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
  const page = searchParams.get('page')
  const pageSizeParam = searchParams.get('pageSize')
  const currentPage = Math.max(
    typeof page === 'string' && !Number.isNaN(parseInt(page)) ? Number(page) : 1,
    1
  )
  const pageSize = snapValueToClosest(
    typeof pageSizeParam === 'string' && !Number.isNaN(parseInt(pageSizeParam))
      ? parseInt(pageSizeParam)
      : defaultPageSize
  )

  return { currentPage, pageSize }
}
