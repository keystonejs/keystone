export * from './Fields.tsx'
export * from './filters.ts'
export * from './utils.tsx'
export * from './useCreateItem.ts'

export type DeepNullable<T> =
  | null
  | (T extends Array<infer Item>
      ? Array<DeepNullable<Item>>
      : { [Key in keyof T]: DeepNullable<T[Key]> })
