import pluralize from 'pluralize'
import { type KeystoneConfig } from '../../types'
import { getGqlNames } from '../../types/utils'
import { humanize } from '../utils'

// this is wrong
// all the things should be generic over the id type
// i don't want to deal with that right now though
declare const idTypeSymbol: unique symbol

export type IdType = { ___keystoneIdType: typeof idTypeSymbol, toString(): string }

// these aren't here out of thinking this is better syntax(i do not think it is),
// it's just because TS won't infer the arg is X bit
export const isFulfilled = <T>(arg: PromiseSettledResult<T>): arg is PromiseFulfilledResult<T> =>
  arg.status === 'fulfilled'
export const isRejected = (arg: PromiseSettledResult<any>): arg is PromiseRejectedResult =>
  arg.status === 'rejected'

export async function promiseAllRejectWithAllErrors<T extends unknown[]> (
  promises: readonly [...T]
): Promise<{ [P in keyof T]: Awaited<T[P]> }> {
  const results = await Promise.allSettled(promises)
  if (!results.every(isFulfilled)) {
    const errors = results.filter(isRejected).map(x => x.reason)
    // AggregateError would be ideal here but it's not in Node 12 or 14
    // (also all of our error stuff is just meh. this whole thing is just to align with previous behaviour)
    const error = new Error(errors[0].message || errors[0].toString());
    (error as any).errors = errors
    throw error
  }

  return results.map((x: any) => x.value) as any
}

export function getNamesFromList (
  listKey: string,
  { graphql, ui, isSingleton }: KeystoneConfig['lists'][string]
) {
  if (ui?.path !== undefined && !/^[a-z-_][a-z0-9-_]*$/.test(ui.path)) {
    throw new Error(
      `ui.path for ${listKey} is ${ui.path} but it must only contain lowercase letters, numbers, dashes, and underscores and not start with a number`
    )
  }

  const computedSingular = humanize(listKey)
  const computedPlural = pluralize.plural(computedSingular)
  const computedLabel = isSingleton ? computedSingular : computedPlural
  const path = ui?.path || labelToPath(computedLabel)

  const pluralGraphQLName = graphql?.plural || labelToClass(computedPlural)
  if (pluralGraphQLName === listKey) {
    throw new Error(
      `The list key and the plural name used in GraphQL must be different but the list key ${listKey} is the same as the plural GraphQL name, please specify graphql.plural`
    )
  }

  return {
    graphql: {
      names: getGqlNames({ listKey, pluralGraphQLName }),
      namePlural: pluralGraphQLName,
    },
    ui: {
      labels: {
        label: ui?.label || computedLabel,
        singular: ui?.singular || computedSingular,
        plural: ui?.plural || computedPlural,
        path,
      },
    },
  }
}

const labelToPath = (str: string) => str.split(' ').join('-').toLowerCase()
const labelToClass = (str: string) => str.replace(/\s+/g, '')

export function getDBFieldKeyForFieldOnMultiField (fieldKey: string, subField: string) {
  return `${fieldKey}_${subField}`
}

export function areArraysEqual (a: readonly unknown[], b: readonly unknown[]) {
  return a.length === b.length && a.every((x, i) => x === b[i])
}
