----
'@keystone-6/auth': patch
----

Fix `createInitial*` and `send*MagicAuthLink` to throw if the expected type from `sessionStrategy.start` is not a string
