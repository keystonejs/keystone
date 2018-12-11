# @voussoir/fields

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
