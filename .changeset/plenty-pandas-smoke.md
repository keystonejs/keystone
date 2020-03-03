---
'@keystonejs/keystone': major
---

Introduced `ListAuthProvider` to generate authentication mutations and queries. This introduces the following breaking changes:
 * `Keystone.createAuthStrategy()` must be called *after* the associated `List` has been created.
 * `List.hasAuth()` has been removed.
 * `List.getAuth()` has been removed.
 * `List.gqlNames.authenticatedQueryName` has been removed.
 * `List.gqlNames.authenticateMutationPrefix` has been removed.
 * `List.gqlNames.unauthenticateMutationName` has been removed.
 * `List.gqlNames.authenticateOutputName` has been removed.
 * `List.gqlNames.unauthenticateOutputName` has been removed.
 * `List.checkAuthAccess()` has been removed.
 * `List.authenticatedQuery()` has been removed.
 * `List.authenticateMutation()` has been removed.
 * `List.unauthenticateMutation()` has been removed.
