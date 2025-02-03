export * from './Fields'
export * from './utils'
export * from './useCreateItem'

export type DeepNullable<T> =
  | null
  | (T extends Array<infer Item>
      ? Array<DeepNullable<Item>>
      : { [Key in keyof T]: DeepNullable<T[Key]> })
