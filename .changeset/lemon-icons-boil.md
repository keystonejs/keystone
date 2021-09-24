---
'@keystone-next/auth': major
---

Removed unused return types, and unused values from enum definitions.
 * `sendUserPasswordResetLink` and `sendUserMagicAuthLink` only ever return `null`, so now have return types of `Boolean`.
 * `UserAuthenticationWithPasswordFailure` no longer has a `code` value.
 * `MagicLinkRedemptionErrorCode` and `PasswordResetRedemptionErrorCode` no longer have the values `IDENTITY_NOT_FOUND`, `MULTIPLE_IDENTITY_MATCHES`, `TOKEN_NOT_SET`, or `TOKEN_MISMATCH`.
