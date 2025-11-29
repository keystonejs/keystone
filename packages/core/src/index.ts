export { list, config, group } from './schema'
export type { ListConfig, BaseFields } from './types'
// this re-exports `g` and `graphql`
// note the usage of export * over explicitly listing the exports
// is intentional here so that users can use "Rename Symbol" to
// change their usage of `graphql` to `g` in their project
// if this was an explicit list, it would change the re-export here
// rather than the usage in their project
export * from './types/schema'
// 导出RBAC功能
export * from './access-rbac'
