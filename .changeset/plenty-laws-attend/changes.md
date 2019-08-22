Makes the password auth strategy its own package.
Previously: `const { Keystone, PasswordAuthStrategy } = require('@keystone-alpha/keystone');`
After change: `const { PasswordAuthStrategy } = require('@keystone-alpha/auth-password');`
