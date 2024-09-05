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

export function getDBFieldKeyForFieldOnMultiField (fieldKey: string, subField: string) {
  return `${fieldKey}_${subField}`
}

export function areArraysEqual (a: readonly unknown[], b: readonly unknown[]) {
  return a.length === b.length && a.every((x, i) => x === b[i])
}
