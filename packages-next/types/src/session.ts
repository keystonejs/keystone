import type { JSONValue } from './utils';
import type { ServerResponse, IncomingMessage } from 'http';
import { CreateContext } from '.';

export type SessionStrategy<StoredSessionData, StartSessionData = never> = {
  connect?: () => Promise<void>;
  disconnect?: () => Promise<void>;
  // -- these two are invoked from mutations
  // creates token from data, sets the cookie with token via res, returns token
  start: (args: {
    res: ServerResponse;
    data: StoredSessionData | StartSessionData;
    createContext: CreateContext;
  }) => Promise<string>;
  // resets the cookie via res
  end: (args: {
    req: IncomingMessage;
    res: ServerResponse;
    createContext: CreateContext;
  }) => Promise<void>;
  // -- this one is invoked at the start of every request
  // reads the token, gets the data, returns it
  get: (args: {
    req: IncomingMessage;
    createContext: CreateContext;
  }) => Promise<StoredSessionData | undefined>;
};

export type SessionStore = {
  connect?: () => Promise<void>;
  disconnect?: () => Promise<void>;
  get(key: string): undefined | JSONValue | Promise<JSONValue | undefined>;
  set(
    key: string,
    value: JSONValue
  ): // 😞 using any here rather than void to be compatible with Map. note that `| Promise<void>` doesn't actually do anything type wise because it just turns into any, it's just to show intent here
  any | Promise<void>;
  delete(
    key: string
  ): // 😞 | boolean is for compatibility with Map
  void | boolean | Promise<void>;
};

export type SessionStoreFunction = (args: {
  /**
   * The number of seconds that a cookie session be valid for
   */
  maxAge: number;
}) => SessionStore;
