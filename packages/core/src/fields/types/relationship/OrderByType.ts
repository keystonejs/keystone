export type OrderByType =
  false |
  Array<
    { labelField:  'asc' | 'desc' } |
    { field: string, order: 'asc' | 'desc' }
  >;