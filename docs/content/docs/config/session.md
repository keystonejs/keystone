---
title: 'Session'
description: 'Reference docs for the getSession configuration option.'
---

The `getSession` property of the [system configuration](./config) object determines the session for each request. It receives a context containing the request headers and returns a non-null application-specific session object or `undefined`.

```typescript
import { config } from '@keystone-6/core'
import type { TypeInfo } from './generated/keystone/types'

declare module './generated/keystone/types' {
  interface Session {
    user: {
      id: string
      name: string
    }
  }
}

export default config<TypeInfo>({
  async getSession({ context }) {
    const authorization = context.req?.get('authorization')
    if (!authorization?.startsWith('Bearer ')) return undefined
    const token = authorization.slice('Bearer '.length)
    const user = await getUserFromToken(token)
    if (!user) return undefined
    return { user }
  },
  // ...
})
```

Use declaration merging to describe the object returned by `getSession`. Keystone's generated `Session` interface propagates this type to `context.session` in access control, hooks, schema extensions, and other context APIs. 

When `getSession` returns a value, the [`KeystoneContext`](../context/overview) exposes it as `context.session`. Returning `undefined` means there is no session for the request.

`context.withHeaders(req, res?)` also invokes `getSession`. Read incoming headers from `context.req` and, when needed, write outgoing headers to `context.res` for example to set cookies.

For cookie-based sessions, JWT and stored session strategies, and using sessions with `createAuth`, see the [Authentication API](./auth#sessions).

## Related resources

{% related-content %}
{% well
heading="Config API Reference"
href="/docs/config/config" %}
The API to configure all the parts of your Keystone system.
{% /well %}
{% well
heading="Authentication API"
href="/docs/config/auth#sessions" %}
Configure authentication and its session strategy.
{% /well %}
{% /related-content %}
