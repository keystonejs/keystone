----
'@keystone-6/core': patch
----

Fixes `createExpressApp` to use `context.graphql.schema` rather than the GraphQLSchema argument, removing ambiguity in downstream usage
