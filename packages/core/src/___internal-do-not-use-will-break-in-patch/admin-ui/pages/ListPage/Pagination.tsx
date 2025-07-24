import { useRouter } from 'next/router'
import { PaginationControls, snapValueToClosest } from './PaginationControls'

type PaginationProps = {
  pageSize: number
  total: number
  currentPage: number
  singular: string
  plural: string
  onChange: (page: number, pageSize: number) => void
}

export function Pagination(props: PaginationProps) {
  const { currentPage, pageSize, onChange } = props
  const onChangePage = (page: number) => onChange(page, pageSize)
  const onChangePageSize = (pageSize: number) => onChange(currentPage, pageSize)
  return (
    <PaginationControls
      onChangePageSize={onChangePageSize}
      onChangePage={onChangePage}
      {...props}
    />
  )
}

export function usePaginationParams({ defaultPageSize }: { defaultPageSize: number }) {
  const { query } = useRouter()
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
