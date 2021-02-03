# Auth Hooks Spec'ing

See:

- The current [hooks API ref](https://www.keystonejs.com/api/hooks#authentication-hooks)
- The current [hooks guide](https://www.keystonejs.com/guides/hooks)
- The [PR that added auth hooks](https://github.com/keystonejs/keystone/pull/2039) (I thought there'd be more relevant discussion in here but there isn't really)

Currently:

```js
keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  hooks: {
    resolveAuthInput: async (...) => {...},
    validateAuthInput: async (...) => {...},
    beforeAuth: async (...) => {...},
    afterAuth: async (...) => {...},

    beforeUnauth: async (...) => {...},
    afterUnauth: async (...) => {...},
  },
});
```

## New Operations

We now have **more potential auth-related operations**:

- `authenticate` (existing)
- `unauthenticate` (existing)
- `createInitialItem`
- `sendPasswordResetLink`
- `redeemPasswordResetLink`
- `sendMagicAuthLink`
- `redeemMagicAuthLink`

(See [existing operations](https://www.keystonejs.com/guides/hooks#operation).)

## Opinions

- We don't need hooks for the `createInitialItem` operation, it's once off
  - Or.. is this how we collect metrics from the demo projects?
- We should maintain the separation between "resolve" (can modify `resolvedData`) AND "validate" (can add validation errors) for auth hooks
- We should _reuse_ the existing `resolveAuthInput` and `validateAuthInput` functions for the new auth operations (as we do with update/create)

## Usage

So usage becomes something like...?

```js
keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  hooks: {
    resolveAuthInput: async (...) => {...},
    validateAuthInput: async (...) => {...},

    beforeAuth: async (...) => {...},
    afterAuth: async (...) => {...},

    beforeUnauth: async (...) => {...},
    afterUnauth: async (...) => {...},

    beforeSendPasswordResetLink: async (...) => {...},
    afterSendPasswordResetLink: async (...) => {...},

    beforeRedeemPasswordResetLink: async (...) => {...},
    afterRedeemPasswordResetLink: async (...) => {...},

    beforeSendMagicAuthLink: async (...) => {...},
    afterSendMagicAuthLink: async (...) => {...},

    beforeRedeemMagicAuthLink: async (...) => {...},
    afterRedeemMagicAuthLink: async (...) => {...},
  },
});
```
