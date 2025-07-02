import pluralize from 'pluralize'
import { humanize } from '../lib/utils'
import type { BaseKeystoneTypeInfo, KeystoneConfig, KeystoneContext } from '../types'
import type { Readable } from 'node:stream'

export type JSONValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | readonly JSONValue[]
  | { [key: string]: JSONValue }

export type MaybePromise<T> = T | Promise<T>

// WARNING: may break in patch
export type GraphQLNames = ReturnType<typeof getGqlNames>

export function getGqlNames({
  singular,
  plural,
}: {
  singular: string
  plural: string
}) {
  const lowerSingularName = singular.charAt(0).toLowerCase() + singular.slice(1)
  const lowerPluralName = plural.charAt(0).toLowerCase() + plural.slice(1)
  return {
    outputTypeName: singular,
    whereInputName: `${singular}WhereInput`,
    whereUniqueInputName: `${singular}WhereUniqueInput`,

    // create
    createInputName: `${singular}CreateInput`,
    createMutationName: `create${singular}`,
    createManyMutationName: `create${plural}`,
    relateToOneForCreateInputName: `${singular}RelateToOneForCreateInput`,
    relateToManyForCreateInputName: `${singular}RelateToManyForCreateInput`,

    // read
    itemQueryName: lowerSingularName,
    listQueryName: lowerPluralName,
    listQueryCountName: `${lowerPluralName}Count`,
    listOrderName: `${singular}OrderByInput`,

    // update
    updateInputName: `${singular}UpdateInput`,
    updateMutationName: `update${singular}`,
    updateManyInputName: `${singular}UpdateArgs`,
    updateManyMutationName: `update${plural}`,
    relateToOneForUpdateInputName: `${singular}RelateToOneForUpdateInput`,
    relateToManyForUpdateInputName: `${singular}RelateToManyForUpdateInput`,

    // delete
    deleteMutationName: `delete${singular}`,
    deleteManyMutationName: `delete${plural}`,
  }
}

const labelToPath = (str: string) => str.split(' ').join('-').toLowerCase()
const labelToClass = (str: string) => str.replace(/\s+/g, '')

// WARNING: may break in patch
export function __getNames(listKey: string, list: KeystoneConfig['lists'][string]) {
  const { graphql, ui, isSingleton } = list
  if (ui?.path !== undefined && !/^[a-z-_][a-z0-9-_]*$/.test(ui.path)) {
    throw new Error(
      `ui.path for ${listKey} is ${ui.path} but it must only contain lowercase letters, numbers, dashes, and underscores and not start with a number`
    )
  }

  const singular = listKey // an assumption
  const plural = pluralize.plural(singular)

  const graphqlSingular = graphql?.singular || labelToClass(singular)
  const graphqlPlural = graphql?.plural || labelToClass(plural)
  if (graphqlSingular === graphqlPlural) {
    throw new Error(
      `The singular and plural name used by GraphQL must be different, but ${graphqlSingular} is the same as ${graphqlPlural}`
    )
  }

  return {
    graphql: {
      names: getGqlNames({
        singular: graphqlSingular,
        plural: graphqlPlural
      }),
    },
    ui: {
      labels: {
        label: ui?.label || humanize(isSingleton ? singular : plural),
        singular: ui?.singular || humanize(singular),
        plural: ui?.plural || humanize(plural),
        path: ui?.path || labelToPath(humanize(isSingleton ? singular : plural))
      },
    },
  }
}

export type StorageStrategy<TypeInfo extends BaseKeystoneTypeInfo> = {
  put(
    key: string,
    stream: Readable,
    meta: { contentType: string },
    context: KeystoneContext<TypeInfo>
  ): Promise<void>
  delete(key: string, context: KeystoneContext<TypeInfo>): Promise<void>
  url(key: string, context: KeystoneContext<TypeInfo>): MaybePromise<string>
}
