export { list, config, group, action } from './schema.ts'
export { selectFields, wrapItemCallback } from './types/item-callback.ts'
export { getSelectionFromInfo } from './lib/core/queries/select.ts'
export type { ListConfig, BaseFields } from './types/index.ts'
// this re-exports `g` and `graphql`
// note the usage of export * over explicitly listing the exports
// is intentional here so that users can use "Rename Symbol" to
// change their usage of `graphql` to `g` in their project
// if this was an explicit list, it would change the re-export here
// rather than the usage in their project
export * from './types/schema/index.ts'
