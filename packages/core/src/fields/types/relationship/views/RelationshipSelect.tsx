import { type ListMeta } from '../../../../types'

/**
 * @deprecated Use `ComboboxSingle` or `ComboboxMany` instead
 */
export const RelationshipSelect = (props: RelationshipSelectProps) => {
  console.error(
    'RelationshipSelect has been deprecated. Use ComboboxSingle or ComboboxMany instead.'
  )

  return null
}

type RelationshipSelectProps = {
  autoFocus?: boolean
  description?: string
  extraSelection?: string
  isDisabled?: boolean
  isLoading?: boolean
  isReadOnly?: boolean
  label?: string
  labelField: string
  list: ListMeta
  placeholder?: string
  searchFields: string[]
  state:
    | {
        kind: 'many'
        value: {
          label: string
          id: string
          data?: Record<string, any>
        }[]
        onChange(
          value: {
            label: string
            id: string
            data: Record<string, any>
          }[]
        ): void
      }
    | {
        kind: 'one'
        value: {
          label: string
          id: string
          data?: Record<string, any>
        } | null
        onChange(
          value: {
            label: string
            id: string
            data: Record<string, any>
          } | null
        ): void
      }
}
