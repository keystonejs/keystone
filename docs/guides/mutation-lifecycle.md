<!--[meta]
section: guides
title: Mutation lifecycle
subSection: graphql
[meta]-->

# Mutation lifecycle

## Introduction

The Keystone GraphQL API implements a CRUD API with `create`, `update` and `delete` mutations for each `List`.
Each of these mutations can be applied to either a single item or many items at once.

For a `List` called `User` the GraphQL mutations would be:

- Single item
  - `createUser`
  - `updateUser`
  - `deleteUser`
- Multiple items
  - `createUsers`
  - `updateUsers`
  - `deleteUsers`

Each of these mutations is implemented within Keystone by a corresponding resolver, implemented as a method on the core `List` object.

- **GraphQL mutation** → **List resolver method**
- `createUser` → `createMutation`
- `updateUser` → `updateMutation`
- `deleteUser` → `deleteMutation`
- `createUsers` → `createManyMutation`
- `updateUsers` → `updateManyMutation`
- `deleteUsers` → `deleteManyMutation`

<!-- Dead links
Please refer to the [API documentation](LINK_TODO)) for full details on how to call these mutations either from [GraphQL](LINK_TODO)) or directly from [Keystone](LINK_TODO)).
-->

Keystone provides [access control](/docs/guides/access-control.md) mechanisms and a [hook system](/docs/guides/hooks.md) which allows the developer to customise the behaviour of each of these mutations.

This document details the lifecycle of each mutation, and how the different access control mechanisms and hooks interact.

## Mutation phases

Each mutation goes through two key phases: the _Access Control Phase_ and the _Operational Phase_.
During the Access Control Phase the developer defined access controls are evaluated, and the target items are retrieved from the database (`update` and `delete` only).

During the Operational Phase the developer defined hooks are invoked, the mutation operation (create/update/delete) is performed in the database, and any nested mutations are performed.

A new `execution transaction` is created at the beginning of the Operational Phase.

This transaction encapsulates a database transaction, as well as any state required to roll back the mutation operation in the event of an exception.

This transaction is used by all the nested mutations of the operation.

The Operational Phase for a `many` mutation consists of the the Operational Phase for the corresponding `single` mutation performed in parallel over each of the target items.

Each of these `single` mutations is executed within its own transaction.

As such, a `many` mutation maybe have partial success during this phase, as some of the the single mutations may succeed while others fail.

### Access control phase

During the Access Control Phase the target items are retrieved from the database, and access control is checked to ensure that the user has permission to perform the operation.

This phase will throw an `AccessDeniedError` if any of the access control checks fail. This error is returned in the `.errors` field of the GraphQL response. The Access Control Phase consists of three distinct steps.

#### 1. Check List Access (`create/update/delete`)

The first step in all mutations is to check that the user has access to perform the required operation on the `List`.

If access control has been defined statically or imperatively this check can be performed here. An `AccessDeniedError` is returned if the access control failed. If the access control mechanism for this list is defined declaratively (i.e using a GraphQL `where` statement), this check is deferred until the next step.

For more information on how to define access control, please consult the [access control documentation](/docs/guides/access-control.md).

#### 2. Get Item(s) (`update/delete`)

In this step the targeted items are retrieved from the database.

If declarative access control is defined for this list, it is applied at this stage.

If the mutation is a single item mutation, an `AccessDeniedError` is returned if access is denied or if the requested item does not exist.

If the mutation is a multi item mutation then only those items which exist and pass access control are returned.

No error is thrown if some items do not exist or do not pass access control.

#### 3. Check Field Access (`create/update`)

The field access permissions can now be checked.

Only those fields which are being set/updated have their permissions checked.

All relevant fields for all targeted items are checked in parallel and if any of them fail an `AccessDeniedError` is returned, listing all the fields which violated access control.

### Operational Phase

During the Operational Phase for a `single` mutation, the following steps are performed.

The Operational Phase for a `many` mutation will perform the Operational Phase for the corresponding `single` mutation across each item in parallel.

The Operational Phase consists of the following distinct steps.

#### 1. Resolve Defaults (`create`)

The first step when creating a new item is to resolve any default values.

Any fields which are not set on the provided item _and_ have a configured default value will be set to the default value.

The default value of a field can be configured at `List` definition time with the config attribute `defaultValue`.

The `defaultValue` may be a static value, or a function which returns either the value or a Promise.

Custom field types can override this behaviour by defining the method `getDefaultValue()`.

Relationship fields do not currently support default values.

#### 2. Resolve Relationship (`create/update`)

The create and update mutations specify the value of relationship fields using the [nested mutation] pattern.

The nested mutations need to be resolved down to specific item IDs which will be inserted into the database.

This step performs the necessary database queries to identify the appropriate item IDs.

In the case that a nested mutation specifies a `create` operation, this will trigger a full `createMutation` on the related `List`.

Any errors thrown by this nested `createMutation` will cause the current mutation to terminate, and the errors will be passed up the call stack.

As well as resolving the IDs and performing any nested create mutations, this step must also track.

#### 3. Resolve Input (`create/update`)

The `resolveInput` hook allows the developer to modify the incoming item before it is inserted/updated within the database.

For full details of how and when to use this hook, please consult the [API docs](/docs/api/hooks.md).

#### 4. Validate Data (`create/update/delete`)

The `validateInput` and `validateDelete` hooks allow the developer to specify validation rules which must be met before the data is inserted into the database.

These hooks can throw a `ValidationFailureError` when they encounter invalid data, which will terminate the operational phase.

For full details of how and when to use these hooks, please consult the [API docs](/docs/api/hooks.md).

#### 5. Before Operation (`create/update/delete`)

The `beforeChange` and `beforeDelete` hooks allows the developer to perform any operations which interact with external systems, such as external data stores, which depend on resolved and validated data.

For full details of how and when to use these hooks, please consult the [API docs](/docs/api/hooks.md).

#### 6. Database Operation (`create/update/delete`)

The database operation is where the keystone database adapter is used to make the requested changes in the database.

#### 7. After Operation (`create/update/delete`)

The `afterChange` and `afterDelete` hooks are only executed once all database operations for the mutation have been completed and the transaction has been finalised.
This means that the database is in a consistent state when this hook is executed.
It also means that if there is a failure of any kind during this hook, the operation will still be considered complete, and no roll back will be performed.

For full details of how and when to use these hooks, please consult the [API docs](/docs/api/hooks.md).

## Summary

![Mutation lifecycle master diagram](./MutationLifecycleMasterDiagram.svg)
