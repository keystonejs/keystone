# @voussoir/fields

## 3.1.0
- [patch] 6fa810f7:

  - Rename package core -> keystone

- [patch] 113e16d4:

  - Remove unused dependencies

- [minor] eaab547c:

  - Allow adding related items from the Relationship field

- [patch] b155d942:

  - Update mongo/mongoose dependencies

- [patch] d035c199:

  - Re-enable check for bcrypt regex in <password>\_is_set

- Updated dependencies [23c3fee5]:
  - @arch-ui/button@0.0.2
  - @arch-ui/controls@0.0.2
  - @arch-ui/day-picker@0.0.2
  - @arch-ui/drawer@0.0.2
  - @arch-ui/fields@0.0.2
  - @arch-ui/filters@0.0.2
  - @arch-ui/icons@0.0.2
  - @arch-ui/input@0.0.2
  - @arch-ui/layout@0.0.2
  - @arch-ui/lozenge@0.0.2
  - @arch-ui/options@0.0.2
  - @arch-ui/popout@0.0.2
  - @arch-ui/select@0.0.2
  - @arch-ui/theme@0.0.2
  - @arch-ui/tooltip@0.0.2
  - @arch-ui/typography@0.0.2

## 3.0.0

- [patch] 513c7b63:

  - Rename MongoSelectInterface to MongoRelationshipInterface in the relationship field type

- [minor] 5f891cff:

  - Add a setupHooks method to BaseFieldAdapter

- [patch] 723371a0:

  - Correctly surface nested errors from GraphQL

- [major] 53e27d75:

  - Removes methods from Mongoose adapter classes: getFieldAdapterByQueryConditionKey, getSimpleQueryConditions, getRelationshipQueryConditions, getQueryConditions, getRelationshipQueryConditions, getRefListAdapter, hasQueryCondition.

- [minor] 4faf5cfd:

  - Add withMeta flag to Relationship field for disabling meta queries

- [patch] 306f0b7e:

  - Remove recalcHeight prop from Filter props

- [patch] 266b5733:

  - Don't try to resolve nested mutations which will be later backfilled

- [minor] dc53492c:

  - Add support for the Knex adapter

- [patch] 7ce811ab:

  - Converts mongoose ObjectIds to string in File field types

- [major] 5f8043b5:

  - Simplify Field component api
    - Replace item prop with value prop which is equal to item[field.path]
    - Replace itemErrors prop with error prop which is equal to itemErrors[field.path]
    - Change onChange prop so that it only accepts the value rather than the field and the value
    - Remove initialData prop which wasn't used in a Field component and was only pass to the Field components in one the places where the Field component is used

- [minor] f37a8086:

  - Can now dump the GraphQL schema with keystone.dumpSchema(filePath)

- [patch] 9f2ee393:

  - Add adapter parameter to setupServer() and add multiAdapterRunners()

- [patch] 860c3b80:

  - Add a postConnect method to list adapters to capture all the work which needs to be done after the database has been connected to

- Updated dependencies [aca26f71]:
- Updated dependencies [6471fc4a]:
- Updated dependencies [6471fc4a]:
- Updated dependencies [48773907]:
- Updated dependencies [a3d5454d]:
  - @voussoir/access-control@0.4.1
  - @voussoir/adapter-mongoose@2.0.0
  - @voussoir/test-utils@1.0.0
  - @voussoir/utils@1.0.0
  - @voussoir/adapter-knex@0.0.2

## 2.0.1

- [patch] 3aede2f5:

  - Make relationship select work for large lists

- [patch] c3dd4295:

  - Don't clobber DateTime fields during update mutation

- [patch] 8d8666ad:

  - Dependency upgrade: graphql -> 14.0.3, graphql-tools -> 4.0.3

## 2.0.0

- [patch] 21626b66:

  - preSave/postRead item hooks run consistently

- [patch] 8145619f:

  - update to selecting and managing items in the list view

- [minor] cd885800:

  - Update the field hooks API to use the officially sanctioned hook names.

- [major] c83c9ed5:

  - Add Keystone.getAccessContext and remove List.getAccessControl, List.getFieldAccessControl, and Field.validateAccessControl.

- [patch] c3ebd9e6:

  - Update resolver code to make all list access checks explicit

- [patch] 8ab899dd:

  - Internal refactor of nested mutation handling for relationships

- [patch] 929b177c:

  - Enable sorting on DateTime fields

- [minor] 33843c9e:

  - Update the backlink queue API

- [major] 01718870:

  - Field configuration now tasks isRequired and isUnique, rather than required and unique

- [minor] 3801e040:

  - Separate out the pre-hooks for resolving relationship fields from the field.resolveInput hooks

- [patch] 023a5c72:

  - Enable setting DateTime to null

- [patch] d22820b1:

  - Rename keystone.session to keystone.sessionManager
    - Rename keystone.session.validate to keystone.sessionManager.populateAuthedItemMiddleware
    - Rename keystone.session.create to keystone.sessionManager.startAuthedSession
    - Rename keystone.session.destroy to keystone.sessionManager.endAuthedSession

- [patch] 8fc0abb3:

  - Make DayPicker scrollable

- [patch] fc1a9055:

  - Update dependencies to latest patch versions

- Updated dependencies [ffc98ac4]:
  - @voussoir/access-control@0.4.0

## 1.4.0

- [minor] 3ae588b7:

  - Rename test*AccessControl functions to validate*AccessControl

- [patch] ff4b98c5:

  - Consolidate mongoose schema pre/post hooks for field types

- [patch] 45d4c379:

  - Update the functional API for Keystone List objects for consistency

- [minor] 589dbc02:

  - navigation improvements and paper cut fixes

- [minor] b0d19c24:

  - Use consistent query condition builders across all field types

- Updated dependencies [9c383fe8]:
  - @voussoir/adapter-mongoose@0.5.0
  - @voussoir/test-utils@0.1.2

## 1.3.0

- [minor] d94b517:

  Add \_ksListsMeta query to gather type and relationship information

- [minor] a3b995c:

  Add \_ksListsMeta query to gather type and relationship information

- [patch] ca7ce46:

  Correctly hide fields from Relationships when not readable

- Updated dependencies [1d30a329"
  ]:
  - @voussoir/ui@0.4.0

## 1.2.0

- [minor] d94b517:

  Add \_ksListsMeta query to gather type and relationship information

- [minor] a3b995c:

  Add \_ksListsMeta query to gather type and relationship information

- [patch] ca7ce46:

  Correctly hide fields from Relationships when not readable

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

## 1.1.0

- [minor] d94b517:

  Add \_ksListsMeta query to gather type and relationship information

- [minor] a3b995c:

  Add \_ksListsMeta query to gather type and relationship information

- [patch] ca7ce46:

  Correctly hide fields from Relationships when not readable

## 1.0.1

- [patch] Avoid recreating indexes on every app boot (https://github.com/keystonejs/keystone-5/pull/459) [b84dd80](b84dd80)

## 1.0.0

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
- [major] `Text` fields now default to case sensitive filtering. Insensitive filters available via the `_i` suffix (eg. `name: "Jane"` -vs- `name_i: "jane"`). This replaces the `${path}_case_sensitive` boolean that could previously be specified when using `Text` field filters. This is all covered in more detail in #359. [445b699](445b699)
- [minor] Support unique field constraint for mongoose adapter [750a83e](750a83e)
- [patch] Updated dependencies [9c75136](9c75136)
  - @voussoir/access-control@0.1.3
  - @voussoir/adapter-mongoose@0.3.0
  - @voussoir/utils@0.2.0

## 0.2.0

- [minor] Add missing dependencies for which the mono-repo was hiding that they were missing [fed0cdc](fed0cdc)

## 0.1.2

- [patch] Rename readme files [a8b995e](a8b995e)

## 0.1.1

- [patch] Remove tests and markdown from npm [dc3ee7d](dc3ee7d)
