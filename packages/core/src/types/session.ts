import type { JSONValue } from './utils';
import { KeystoneContext } from '.';

export type SessionStrategy<StoredSessionData, StartSessionData = never, Context extends KeystoneContext = KeystoneContext> = {
  get: (args: { context: Context }) => Promise<StoredSessionData | undefined>;

  start: (args: {
    data: StoredSessionData | StartSessionData;
    context: Context;
  }) => Promise<unknown>;

  end: (args: { context: Context }) => Promise<unknown>;
};

export type SessionStore = {
  get(key: string): undefined | JSONValue | Promise<JSONValue | undefined>;
  // 😞 using any here rather than void to be compatible with Map. note that `| Promise<void>` doesn't actually do anything type wise because it just turns into any, it's just to show intent here
  set(key: string, value: JSONValue): any | Promise<void>;
  // 😞 | boolean is for compatibility with Map
  delete(key: string): void | boolean | Promise<void>;
};

export type SessionStoreFunction = (args: {
  /**
   * The number of seconds that a cookie session be valid for
   */
  maxAge: number;
}) => SessionStore;
