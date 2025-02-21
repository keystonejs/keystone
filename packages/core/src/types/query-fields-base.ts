// this is intentionally never exported publicly, it's just to allow conditionally supporting gql.tada

export interface ResolveFieldsQueryOptions<Result, ListKey extends string> {
  string: string
}

export type ResolveFieldsQuery<Result, ListKey extends string> = Values<
  ResolveFieldsQueryOptions<Result, ListKey>
>

type Values<T> = T[keyof T]
