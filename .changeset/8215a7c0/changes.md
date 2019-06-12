- `PasswordAuthStrategy#validate()` now accepts an object of `{ [identityField], [secretField] }` (was `{ identity, secret }`).
- Auth Strategies can now add AdminMeta via a `#getAdminMeta()` method which will be attached to the `authStrategy` key of `adminMeta` in the Admin UI.
- Added (un)authentication GraphQL mutations:
    - ```graphql
      mutation {
        authenticate<List>With<Strategy>(<strategy-args) {
          token # Add this token as a header: { Authorization: 'Bearer <token>' }
          item # The authenticated item from <List>
        }
      }
      ```
      For the `PasswordAuthStrategy`, that is:
      ```javascript
      const authStrategy = keystone.createAuthStrategy({
        type: PasswordAuthStrategy,
        list: 'User',
        config: {
          identityField: 'username',
          secretField: 'pass'
        }
      });
      ```
      ```graphql
      mutation {
        authenticateUserWithPassword(username: "jesstelford", pass: "abc123") {
          token
          item {
            username
          }
        }
      }
      ```
    - ```graphql
      mutation {
        unauthenticate<List> {
          success
        }
      }
      ```
