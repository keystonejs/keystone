import { IncomingMessage, ServerResponse } from 'http';
import * as cookie from 'cookie';
import Iron from '@hapi/iron';
import {
  SessionStrategy,
  JSONValue,
  SessionStoreFunction,
  SessionContext,
  CreateContext,
} from '@keystone-next/types';

// uid-safe is what express-session uses so let's just use it
import { sync as uid } from 'uid-safe';

function generateSessionId() {
  return uid(24);
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
   * See {@link https://hapi.dev/module/iron/api/?v=6.0.0#options} for available options.
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

/* TODO:
  - [ ] We could support additional where input to validate item sessions (e.g an isEnabled boolean)
*/

export function withItemData<T extends { listKey: string; itemId: string }>(
  createSession: () => SessionStrategy<T>,
  fieldSelections: FieldSelections = {}
): () => SessionStrategy<T & { data: any }> {
  return (): SessionStrategy<any> => {
    const { get, ...sessionStrategy } = createSession();
    return {
      ...sessionStrategy,
      get: async ({ req, createContext }) => {
        const session = await get({ req, createContext });
        const sudoContext = createContext({}).sudo();
        if (
          !session ||
          !session.listKey ||
          !session.itemId ||
          !sudoContext.lists[session.listKey]
        ) {
          return session;
        }

        // NOTE: This is wrapped in a try-catch block because a "not found" result will currently
        // throw; I think this needs to be reviewed, but for now this prevents a system crash when
        // the session item is invalid
        try {
          // If no field selection is specified, just load the id. We still load the item,
          // because doing so validates that it exists in the database
          const item = await sudoContext.lists[session.listKey].findOne({
            where: { id: session.itemId },
            resolveFields: fieldSelections[session.listKey] || 'id',
          });
          // If there is no matching item found, return the session without a `data value
          if (!item) {
            return session;
          }
          return { ...session, data: item };
        } catch (e) {
          // TODO: This swallows all errors, we need a way to differentiate between "not found" and
          // actual exceptions that should be thrown
          return session;
        }
      },
    };
  };
}

export function statelessSessions<T>({
  secret,
  maxAge = MAX_AGE,
  path = '/',
  secure = process.env.NODE_ENV === 'production',
  ironOptions = Iron.defaults,
}: StatelessSessionsOptions): () => SessionStrategy<T> {
  return () => {
    if (!secret) {
      throw new Error('You must specify a session secret to use sessions');
    }
    if (secret.length < 32) {
      throw new Error('The session secret must be at least 32 characters long');
    }
    return {
      async get({ req }) {
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
    };
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
    let isConnected = false;
    return {
      async get({ req, createContext }) {
        let sessionId = await get({ req, createContext });
        if (typeof sessionId === 'string') {
          if (!isConnected) {
            await store.connect?.();
            isConnected = true;
          }
          return store.get(sessionId);
        }
      },
      async start({ res, data, createContext }) {
        let sessionId = generateSessionId();
        if (!isConnected) {
          await store.connect?.();
          isConnected = true;
        }
        await store.set(sessionId, data);
        return start?.({ res, data: { sessionId }, createContext }) || '';
      },
      async end({ req, res, createContext }) {
        let sessionId = await get({ req, createContext });
        if (typeof sessionId === 'string') {
          if (!isConnected) {
            await store.connect?.();
            isConnected = true;
          }
          await store.delete(sessionId);
        }
        await end?.({ req, res, createContext });
      },
    };
  };
}

/**
 * This is the function createSystem uses to implement the session strategy provided
 */
export async function createSessionContext<T>(
  sessionStrategy: SessionStrategy<T>,
  req: IncomingMessage,
  res: ServerResponse,
  createContext: CreateContext
): Promise<SessionContext<T>> {
  return {
    session: await sessionStrategy.get({ req, createContext }),
    startSession: (data: T) => sessionStrategy.start({ res, data, createContext }),
    endSession: () => sessionStrategy.end({ req, res, createContext }),
  };
}
