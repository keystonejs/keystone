---
'@keystone-6/core': major
---

Replaces Node.js HTTP `context.req` and `context.res` on `KeystoneContext` with WHATWG `Headers`, and replaces `context.withRequest(req, res)` with `context.withHeaders(req, res?)`. `context.req` now only carries request headers: the client IP address, method, URL and body of the request are no longer available on the context. If hooks or access control need any of these, add them as request headers in your own middleware in `server.extendExpressApp` before Keystone's GraphQL handler.

Headers set on `context.res` are copied to the response by Keystone's built-in server when the GraphQL response is sent. Custom integrations using `context.withHeaders` must copy the `res` headers to their own response, using `res.getSetCookie()` to preserve separate `Set-Cookie` values.
