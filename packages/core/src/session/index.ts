import * as cookie from 'cookie';
import Iron from '@hapi/iron';
import { sync as uid } from 'uid-safe';
import { SessionStrategy, JSONValue, SessionStoreFunction } from '../types';

function generateSessionId() {
  return uid(24);
}

// should we also accept httpOnly?
type StatelessSessionsOptions = {
  /**
   * Secret used by https://github.com/hapijs/iron for encapsulating data. Must be at least 32 characters long
   */
  secret: string;
  /**
   * Iron seal options for customizing the key derivation algorithm used to generate encryption and integrity verification keys as well as the algorithms and salt sizes used.
   * See https://hapi.dev/module/iron/api/?v=6.0.0#options for available options.
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
   * The name of the cookie used by `Set-Cookie`.
   *
   * @default keystonejs-session
   */
  cookieName?: string;
  /**
   * Specifies the boolean value for the [`Secure` `Set-Cookie` attribute](https://tools.ietf.org/html/rfc6265#section-5.2.5).
   *
   * *Note* be careful when setting this to `true`, as compliant clients will
   * not send the cookie back to the server in the future if the browser does
   * not have an HTTPS connection.
   *
   * @default process.env.NODE_ENV === 'production'
   */
  secure?: boolean;
  /**
   * Specifies the value for the [`Path` `Set-Cookie` attribute](https://tools.ietf.org/html/rfc6265#section-5.2.4).
   *
   * @default '/'
   */
  path?: string;
  /**
   * Specifies the domain for the [`Domain` `Set-Cookie` attribute](https://tools.ietf.org/html/rfc6265#section-5.2.3)
   *
   * @default current domain
   */
  domain?: string;
  /**
   * Specifies the boolean or string to be the value for the [`SameSite` `Set-Cookie` attribute](https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-03#section-4.1.2.7).
   *
   * @default 'lax'
   */
  sameSite?: true | false | 'lax' | 'strict' | 'none';
};

const MAX_AGE = 60 * 60 * 8; // 8 hours

export function statelessSessions<T>({
  secret,
  maxAge = MAX_AGE,
  cookieName = 'keystonejs-session',
  path = '/',
  secure = process.env.NODE_ENV === 'production',
  ironOptions = Iron.defaults,
  domain,
  sameSite = 'lax',
}: StatelessSessionsOptions): SessionStrategy<T> {
  if (!secret) {
    throw new Error('You must specify a session secret to use sessions');
  }
  if (secret.length < 32) {
    throw new Error('The session secret must be at least 32 characters long');
  }
  return {
    async get({ context }) {
      if (!context?.req) return;

      const cookies = cookie.parse(context.req.headers.cookie || '');
      const bearer = context.req.headers.authorization?.replace('Bearer ', '');
      const token = bearer || cookies[cookieName];
      if (!token) return;
      try {
        return await Iron.unseal(token, secret, ironOptions);
      } catch (err) {}
    },
    async end({ context }) {
      if (!context?.res) return;

      context.res.setHeader(
        'Set-Cookie',
        cookie.serialize(cookieName, '', {
          maxAge: 0,
          expires: new Date(),
          httpOnly: true,
          secure,
          path,
          sameSite,
          domain,
        })
      );
    },
    async start({ context, data }) {
      if (!context?.res) return;

      const sealedData = await Iron.seal(data, secret, { ...ironOptions, ttl: maxAge * 1000 });
      context.res.setHeader(
        'Set-Cookie',
        cookie.serialize(cookieName, sealedData, {
          maxAge,
          expires: new Date(Date.now() + maxAge * 1000),
          httpOnly: true,
          secure,
          path,
          sameSite,
          domain,
        })
      );

      return sealedData;
    },
  };
}

export function storedSessions({
  store: storeOption,
  maxAge = MAX_AGE,
  ...statelessSessionsOptions
}: { store: SessionStoreFunction } & StatelessSessionsOptions): SessionStrategy<JSONValue> {
  let { get, start, end } = statelessSessions({ ...statelessSessionsOptions, maxAge });
  let store = storeOption({ maxAge });
  return {
    async get({ context }) {
      const data = (await get({ context })) as { sessionId: string } | undefined;
      const sessionId = data?.sessionId;
      if (typeof sessionId === 'string') {
        return store.get(sessionId);
      }
    },
    async start({ data, context }) {
      let sessionId = generateSessionId();
      await store.set(sessionId, data);
      return start?.({ data: { sessionId }, context }) || '';
    },
    async end({ context }) {
      const data = (await get({ context })) as { sessionId: string } | undefined;
      const sessionId = data?.sessionId;
      if (typeof sessionId === 'string') {
        await store.delete(sessionId);
      }
      await end?.({ context });
    },
  };
}
