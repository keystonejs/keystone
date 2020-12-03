import { IncomingMessage, ServerResponse } from 'http';
import * as cookie from 'cookie';
import Iron from '@hapi/iron';
import { execute, parse } from 'graphql';
import {
  SessionStrategy,
  JSONValue,
  SessionStoreFunction,
  SessionContext,
  KeystoneSystem,
} from '@keystone-next/types';

// uid-safe is what express-session uses so let's just use it
import { sync as uid } from 'uid-safe';

function generateSessionId() {
  return uid(24);
}

function asSessionStrategy<TSessionStrategy extends SessionStrategy<any>>(
  sessionStrategy: TSessionStrategy
): TSessionStrategy {
  return sessionStrategy;
}

const TOKEN_NAME = 'keystonejs-session';
const MAX_AGE = 60 * 60 * 8; // 8 hours

// should we also accept httpOnly?
type StatelessSessionsOptions = {
  /**
   * Secret used by https://github.com/hapijs/iron for encapsulating data. Must be at least 32 characters long
   */
  secret: string;
  /**
   * Iron seal options for customizing the key derivation algorithm used to generate encryption and integrity verification keys as well as the algorithms and salt sizes used.
   *
   * @default Iron.defaults
   */
  ironOptions?: Iron.SealOptions;
  /**
   * Specifies the number (in seconds) to be the value for the `Max-Age`
   * `Set-Cookie` attribute.
   *
   * @default 60 * 60 * 8 // 8 hours
   */
  maxAge?: number;
  /**
   * Specifies the boolean value for the {@link https://tools.ietf.org/html/rfc6265#section-5.2.5|`Secure` `Set-Cookie` attribute}.
   *
   * *Note* be careful when setting this to `true`, as compliant clients will
   * not send the cookie back to the server in the future if the browser does
   * not have an HTTPS connection.
   *
   * @default process.env.NODE_ENV === 'production'
   */
  secure?: boolean;
  /**
   * Specifies the value for the {@link https://tools.ietf.org/html/rfc6265#section-5.2.4|`Path` `Set-Cookie` attribute}.
   *
   * @default '/'
   */
  path?: string;
};

type FieldSelections = {
  [listKey: string]: string;
};

type CreateSession = ReturnType<typeof statelessSessions>;

/* TODO:
  - [ ] We could support additional where input to validate item sessions (e.g an isEnabled boolean)
*/

export function withItemData(createSession: CreateSession, fieldSelections: FieldSelections = {}) {
  return (): SessionStrategy<any> => {
    const { get, ...sessionStrategy } = createSession();
    return {
      ...sessionStrategy,
      get: async ({ req, system }) => {
        const session = await get({ req, system });
        if (
          !session ||
          !session.listKey ||
          !session.itemId ||
          !system.adminMeta.lists[session.listKey]
        ) {
          return;
        }
        const context = system.createContext({ skipAccessControl: true });
        const { gqlNames } = system.adminMeta.lists[session.listKey];
        // If no field selection is specified, just load the id. We still load the item,
        // because doing so validates that it exists in the database
        const fields = fieldSelections[session.listKey] || 'id';
        const query = parse(`query($id: ID!) {
          item: ${gqlNames.itemQueryName}(where: { id: $id }) {
            ${fields}
          }
        }`);
        const args = { id: session.itemId };
        const result = await execute(system.graphQLSchema, query, null, context, args);
        // TODO: This causes "not found" errors to throw, which is not what we want
        // TODO: Also, why is this coming back as an access denied error instead of "not found" with an invalid session?
        // if (result.errors?.length) {
        //   throw result.errors[0];
        // }
        // If there is no matching item found, return no session
        if (!result?.data?.item) {
          return;
        }
        return { ...session, data: result.data.item };
      },
    };
  };
}

export function statelessSessions({
  secret,
  maxAge = MAX_AGE,
  path = '/',
  secure = process.env.NODE_ENV === 'production',
  ironOptions = Iron.defaults,
}: StatelessSessionsOptions): () => SessionStrategy<Record<string, any>> {
  return () => {
    if (!secret) {
      throw new Error('You must specify a session secret to use sessions');
    }
    if (secret.length < 32) {
      throw new Error('The session secret must be at least 32 characters long');
    }
    return asSessionStrategy({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async get({ req, system }) {
        if (!req.headers.cookie) return;
        let cookies = cookie.parse(req.headers.cookie);
        if (!cookies[TOKEN_NAME]) return;
        try {
          return await Iron.unseal(cookies[TOKEN_NAME], secret, ironOptions);
        } catch (err) {}
      },
      async end({ res }) {
        res.setHeader(
          'Set-Cookie',
          cookie.serialize(TOKEN_NAME, '', {
            maxAge: 0,
            expires: new Date(),
            httpOnly: true,
            secure,
            path,
            sameSite: 'lax',
          })
        );
      },
      async start({ res, data }) {
        let sealedData = await Iron.seal(data, secret, { ...ironOptions, ttl: maxAge * 1000 });

        res.setHeader(
          'Set-Cookie',
          cookie.serialize(TOKEN_NAME, sealedData, {
            maxAge,
            expires: new Date(Date.now() + maxAge * 1000),
            httpOnly: true,
            secure,
            path,
            sameSite: 'lax',
          })
        );

        return sealedData;
      },
    });
  };
}

export function storedSessions({
  store: storeOption,
  maxAge = MAX_AGE,
  ...statelessSessionsOptions
}: {
  store: SessionStoreFunction;
} & StatelessSessionsOptions): () => SessionStrategy<JSONValue> {
  return () => {
    let { get, start, end } = statelessSessions({ ...statelessSessionsOptions, maxAge })();
    let store = typeof storeOption === 'function' ? storeOption({ maxAge }) : storeOption;
    return {
      connect: store.connect,
      disconnect: store.disconnect,
      async get({ req, system }) {
        let sessionId = await get({ req, system });
        if (typeof sessionId === 'string') {
          return store.get(sessionId);
        }
      },
      async start({ res, data, system }) {
        let sessionId = generateSessionId();
        await store.set(sessionId, data);
        return start?.({ res, data: { sessionId }, system }) || '';
      },
      async end({ req, res, system }) {
        let sessionId = await get({ req, system });
        if (typeof sessionId === 'string') {
          await store.delete(sessionId);
        }
        await end?.({ req, res, system });
      },
    };
  };
}

/**
 * This is the function createSystem uses to implement the session strategy provided
 */
export function implementSession<T>(sessionStrategy: SessionStrategy<T>) {
  let isConnected = false;
  return {
    async createContext(
      req: IncomingMessage,
      res: ServerResponse,
      system: KeystoneSystem
    ): Promise<SessionContext<T>> {
      if (!isConnected) {
        await sessionStrategy.connect?.();
        isConnected = true;
      }
      const session = await sessionStrategy.get({ req, system });
      const startSession = sessionStrategy.start;
      const endSession = sessionStrategy.end;
      return {
        session,
        startSession: (data: T) => startSession({ res, data, system }),
        endSession: () => endSession({ req, res, system }),
      };
    },
  };
}
