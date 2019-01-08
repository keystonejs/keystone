# @voussoir/core

## 1.1.0

- [patch] 8d8666ad:

  - Dependency upgrade: graphql -> 14.0.3, graphql-tools -> 4.0.3

- [minor] 6d8ce0fc:

  - Add createMany and updateMany mutations

## 1.0.0

- [patch] a95e0c69:

  - Report correct gqlName when reporting errors in deleteMutation

- [patch] 21626b66:

  - preSave/postRead item hooks run consistently

- [patch] 84b62eaa:

  - Decouple access of items in the database from operations of them provide room for pre/post hooks

- [patch] cd885800:

  - Update the field hooks API to use the officially sanctioned hook names.

- [patch] c6fff24c:

  - Call field hooks when deleting many items at once.

- [major] c83c9ed5:

  - Add Keystone.getAccessContext and remove List.getAccessControl, List.getFieldAccessControl, and Field.validateAccessControl.

- [patch] ffc98ac4:

  - Rename the access control function parameter `item` to `existingItem`

- [minor] c3ebd9e6:

  - Update resolver code to make all list access checks explicit

- [minor] ebae2d6f:

  - Minor tweaks to the graphQL schema behaviour

- [major] 78fd9555:

  - Field configuration now tasks isRequired and isUnique, rather than required and unique

- [patch] 3801e040:

  - Separate out the pre-hooks for resolving relationship fields from the field.resolveInput hooks

- [major] d22820b1:

  - Rename keystone.session to keystone.sessionManager
    - Rename keystone.session.validate to keystone.sessionManager.populateAuthedItemMiddleware
    - Rename keystone.session.create to keystone.sessionManager.startAuthedSession
    - Rename keystone.session.destroy to keystone.sessionManager.endAuthedSession

- Updated dependencies [01718870]:
  - @voussoir/fields@2.0.0

## 0.7.0

- [patch] d1777cc1:

  - Consolidate logging and error handling mechanisms within core/List/index.js

- [minor] 45d4c379:

  - Update the functional API for Keystone List objects for consistency

- [patch] 9c383fe8:

  - Always use \$set and { new: true } in the mongoose adapter update() method

- Updated dependencies [3ae588b7]:
  - @voussoir/access-control@0.3.0
  - @voussoir/fields@1.4.0

## 0.6.0

- [minor] d94b517:

  Add \_ksListsMeta query to gather type and relationship information

- [minor] a3b995c:

  Add \_ksListsMeta query to gather type and relationship information

- [patch] ca7ce46:

  Correctly hide fields from Relationships when not readable

## 0.5.0

- [minor] d94b517:

  Add \_ksListsMeta query to gather type and relationship information

- [minor] a3b995c:

  Add \_ksListsMeta query to gather type and relationship information

- [patch] ca7ce46:

  Correctly hide fields from Relationships when not readable

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

## 0.4.0

- [minor] d94b517:

  Add \_ksListsMeta query to gather type and relationship information

- [minor] a3b995c:

  Add \_ksListsMeta query to gather type and relationship information

- [patch] ca7ce46:

  Correctly hide fields from Relationships when not readable

## 0.3.0

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
- [minor] Support unique field constraint for mongoose adapter [750a83e](750a83e)
- [patch] Surface errors that occur at the adapter level during a create mutation. [81641b2](81641b2)
- [patch] Updated dependencies [445b699](445b699)
- [patch] Updated dependencies [9c75136](9c75136)
  - @voussoir/fields@1.0.0
  - @voussoir/access-control@0.1.3
  - @voussoir/utils@0.2.0

## 0.2.0

- [minor] Add missing dependencies for which the mono-repo was hiding that they were missing [fed0cdc](fed0cdc)

## 0.1.2

- [patch] Rename readme files [a8b995e](a8b995e)

## 0.1.1

- [patch] Remove tests and markdown from npm [dc3ee7d](dc3ee7d)
