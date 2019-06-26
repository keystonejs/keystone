Convert GraphQL SDL to AST before passing to Apollo

Apollo released a breaking change in a semver-minor which causes it to
stop understanding the SDL (string) GraphQL typeDefs we were passing it.
This fix ensures we're converting to an AST to avoid the error being
thrown.

See https://github.com/keystonejs/keystone-5/issues/1340
