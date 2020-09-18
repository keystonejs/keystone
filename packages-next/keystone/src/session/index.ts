import { IncomingMessage, ServerResponse } from 'http';
import * as cookie from 'cookie';
import Iron from '@hapi/iron';
import {
  SessionStrategy,
  JSONValue,
  SessionStoreFunction,
  SessionContext,
} from '@keystone-spike/types';

// uid-safe is what express-session uses so let's just use it
import { sync as uid } from 'uid-safe';

function generateSessionId() {
  return uid(24);
}

function sessionStrategy<TSessionStrategy extends SessionStrategy<any>>(
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

export function statelessSessions({
  secret,
  maxAge = MAX_AGE,
  path = '/',
  secure = process.env.NODE_ENV === 'production',
  ironOptions = Iron.defaults,
}: StatelessSessionsOptions) {
  return () => {
    if (secret.length < 32) {
      throw new Error('The session secret must be at least 32 characters long');
    }
    return sessionStrategy({
      async get(req) {
        if (!req.headers.cookie) return;
        let cookies = cookie.parse(req.headers.cookie);
        if (!cookies[TOKEN_NAME]) return;
        try {
          return await Iron.unseal(cookies[TOKEN_NAME], secret, ironOptions);
        } catch (err) {}
      },
      async end(req, res) {
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
      async start(res, data) {
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
      async get(req) {
        let sessionId = await get(req);
        if (typeof sessionId === 'string') {
          return store.get(sessionId);
        }
      },
      async start(res, data) {
        let sessionId = generateSessionId();
        await store.set(sessionId, data);
        return start(res, sessionId);
      },
      async end(req, res) {
        let sessionId = await get(req);
        if (typeof sessionId === 'string') {
          await store.delete(sessionId);
        }
        await end(req, res);
      },
    };
  };
}

export function sessionStuff(sessionStrategy: SessionStrategy<unknown>) {
  let isConnected = false;
  let connect = async () => {
    await sessionStrategy.connect?.();
    isConnected = true;
  };
  let disconnect = async () => {
    await sessionStrategy.disconnect?.();
    isConnected = false;
  };
  return {
    connect,
    disconnect,
    async createContext(req: IncomingMessage, res: ServerResponse): Promise<SessionContext> {
      if (!isConnected) {
        await connect();
      }
      const session = await sessionStrategy.get(req);
      const startSession = sessionStrategy.start;
      const endSession = sessionStrategy.end;
      return {
        session,
        startSession: startSession
          ? (data: unknown) => {
              return startSession(res, data);
            }
          : undefined,
        endSession: endSession
          ? () => {
              return endSession(req, res);
            }
          : undefined,
      };
    },
  };
}
