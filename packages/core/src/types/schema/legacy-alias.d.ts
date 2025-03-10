import { g as _graphql } from './g'

/**
 * The `graphql` export has been renamed to `g`.
 *
 * To quickly update usages of `graphql` in your project to `g`:
 *
 * 1. Navigate to
 *    `node_modules/@keystone-6/core/dist/declarations/src/types/schema/legacy-alias.d.ts`
 *    in your editor ("Go to Definition" will not take you to the correct file)
 * 2. Use "Rename Symbol" to rename `graphql` to `g`, this will update usages of
 *    `graphql` to `g`
 * 3. Change this deprecated alias back from `g` to `graphql` using normal text
 *    editing (avoid using "Rename Symbol" again because you want to preserve
 *    the updates you made in step 2)
 *
 * You can also use "Rename Symbol" to quickly rename your own custom defined
 * `graphql` export to `g`.
 *
 * @deprecated
 */
// this is what you should run "Rename Symbol" on
// when that is done, you should change it back to `export import graphql = _graphql;`
// avoid using "Rename Symbol" to revert it because you want to
// preserve the updates you made to the usages of `graphql`
//            |||||||
//            vvvvvvv
export import graphql = _graphql
