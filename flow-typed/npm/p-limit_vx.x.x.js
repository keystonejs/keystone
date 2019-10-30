// flow-typed signature: 375bd9e884de49de21ffed99c7e577dc
// flow-typed version: p-limit_v1/flow_v0.85.0

/**
 * Once filled out, we encourage you to share your work with the
 * community by sending a pull request to:
 * https://github.com/flowtype/flow-typed
 */

declare module 'p-limit' {
  declare interface Limit {
    <Arguments: mixed[], ReturnType>(
      fn: (...arguments: Arguments) => PromiseLike<ReturnType> | ReturnType,
      ...arguments: Arguments
    ): Promise<ReturnType>;
    /* The number of promises that are currently running. */
    +activeCount: number;

    /*  The number of promises that are waiting to run (i.e. their internal `fn` was not called yet). */
    +pendingCount: number;
  }

  /* Run multiple promise-returning & async functions with limited concurrency. */
  declare export default function pLimit(concurrency: number): Limit;
}
