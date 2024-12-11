export * from './Fields'
export * from './getRootGraphQLFieldsFromFieldController'
export * from './useInvalidFields'

export type DeepNullable<T> =
  | null
  | (T extends Array<infer Item>
      ? Array<DeepNullable<Item>>
      : { [Key in keyof T]: DeepNullable<T[Key]> })
