Adds the ability to filter users before authentication. 

The `identityFilter` has been added to configurations options:

```javascript
const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  identityFilter: ({ identityField, identity }) => ({
    AND: [{ [identityField]: identity }, { isAdmin: true }],
  }),
});
```