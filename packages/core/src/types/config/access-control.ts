import type { MaybePromise } from '../utils';
import type { KeystoneContextFromListTypeInfo } from '..';
import { BaseListTypeInfo } from '../type-info';

export type BaseAccessArgs<ListTypeInfo extends BaseListTypeInfo> = {
  session: any;
  listKey: string;
  context: KeystoneContextFromListTypeInfo<ListTypeInfo>;
};

// List Filter Access

type FilterOutput<ListTypeInfo extends BaseListTypeInfo> =
  | boolean
  | ListTypeInfo['inputs']['where'];

export type ListFilterAccessControl<
  Operation extends 'query' | 'update' | 'delete',
  ListTypeInfo extends BaseListTypeInfo
> = (
  args: BaseAccessArgs<ListTypeInfo> & { operation: Operation }
) => MaybePromise<FilterOutput<ListTypeInfo>>;

// List Item Access

type CreateItemAccessArgs<ListTypeInfo extends BaseListTypeInfo> = BaseAccessArgs<ListTypeInfo> & {
  operation: 'create';
  /**
   * The input passed in from the GraphQL API
   */
  inputData: ListTypeInfo['inputs']['create'];
};

export type CreateListItemAccessControl<ListTypeInfo extends BaseListTypeInfo> = (
  args: CreateItemAccessArgs<ListTypeInfo>
) => MaybePromise<boolean>;

type UpdateItemAccessArgs<ListTypeInfo extends BaseListTypeInfo> = BaseAccessArgs<ListTypeInfo> & {
  operation: 'update';
  /**
   * The item being updated
   */
  item: ListTypeInfo['item'];
  /**
   * The input passed in from the GraphQL API
   */
  inputData: ListTypeInfo['inputs']['update'];
};

export type UpdateListItemAccessControl<ListTypeInfo extends BaseListTypeInfo> = (
  args: UpdateItemAccessArgs<ListTypeInfo>
) => MaybePromise<boolean>;

type DeleteItemAccessArgs<ListTypeInfo extends BaseListTypeInfo> = BaseAccessArgs<ListTypeInfo> & {
  operation: 'delete';
  /**
   * The item being deleted
   */
  item: ListTypeInfo['item'];
};

export type DeleteListItemAccessControl<ListTypeInfo extends BaseListTypeInfo> = (
  args: DeleteItemAccessArgs<ListTypeInfo>
) => MaybePromise<boolean>;

export type AccessOperation = 'create' | 'query' | 'update' | 'delete';

export type ListOperationAccessControl<
  Operation extends AccessOperation,
  ListTypeInfo extends BaseListTypeInfo
> = (args: BaseAccessArgs<ListTypeInfo> & { operation: Operation }) => MaybePromise<boolean>;

type ListAccessControlFunction<ListTypeInfo extends BaseListTypeInfo> = (
  args: BaseAccessArgs<ListTypeInfo> & { operation: AccessOperation }
) => MaybePromise<boolean>;

type ListAccessControlObject<ListTypeInfo extends BaseListTypeInfo> = {
  // These functions should return `true` if access is allowed or `false` if access is denied.
  operation:
    | ListOperationAccessControl<any, ListTypeInfo>
    | {
        query: ListOperationAccessControl<'query', ListTypeInfo>;
        create: ListOperationAccessControl<'create', ListTypeInfo>;
        update: ListOperationAccessControl<'update', ListTypeInfo>;
        delete: ListOperationAccessControl<'delete', ListTypeInfo>;
      };

  // The 'filter' rules can return either:
  // - a filter. In this case, the operation can proceed, but the filter will be additionally applied when updating/reading/deleting
  //   which may make it appear that some of the items don't exist.
  // - boolean true/false. If false, treated as a filter that never matches.
  filter?: {
    query?: ListFilterAccessControl<'query', ListTypeInfo>;
    update?: ListFilterAccessControl<'update', ListTypeInfo>;
    delete?: ListFilterAccessControl<'delete', ListTypeInfo>;
    // create: not supported: FIXME: Add explicit check that people don't try this.
    // FIXME: Write tests for parseAccessControl.
  };

  // These rules are applied to each item being operated on individually. They return `true` or `false`,
  // and if false, an access denied error will be returned for the individual operation.
  item?: {
    // query: not supported
    create?: CreateListItemAccessControl<ListTypeInfo>;
    update?: UpdateListItemAccessControl<ListTypeInfo>;
    delete?: DeleteListItemAccessControl<ListTypeInfo>;
  };
};

// List level access control lets you set permissions on the autogenerated CRUD API for each list.
//
// * `operation` access lets you check the information in the `context` and `session` objects to decide if the
// user is allow to access the list.
// * `filter` access lets you provide a GraphQL filter which defines the items the user is allowed to access.
// * `item` access lets you write a function which inspects the provided input data and the existing object (if it exists)
// and make a decision based on this extra data.
//
// If access is denied due to any of the access control methods then the following response will be returned from the GraphQL API:
//   Mutations:
//     - Single operations will return `null` and return an access denied error
//     - Multi operations will return a data array with `null` values for the items which have access denied.
//       Access denied errors will be return for each `null` items.
//   Queries:
//     - Single item queries will return `null` with no errors.
//     - Many item queries will filter out those items which have access denied, with no errors.
//     - Count queries will only count those items for which access is not denied, with no errors.
//
export type ListAccessControl<ListTypeInfo extends BaseListTypeInfo> =
  | ListAccessControlFunction<ListTypeInfo>
  | ListAccessControlObject<ListTypeInfo>;

// Field Access
export type IndividualFieldAccessControl<Args> = (args: Args) => MaybePromise<boolean>;

export type FieldCreateItemAccessArgs<ListTypeInfo extends BaseListTypeInfo> =
  CreateItemAccessArgs<ListTypeInfo> & { fieldKey: string };

export type FieldReadItemAccessArgs<ListTypeInfo extends BaseListTypeInfo> =
  BaseAccessArgs<ListTypeInfo> & {
    operation: 'read';
    fieldKey: string;
    item: ListTypeInfo['item'];
  };

export type FieldUpdateItemAccessArgs<ListTypeInfo extends BaseListTypeInfo> =
  UpdateItemAccessArgs<ListTypeInfo> & { fieldKey: string };

export type FieldAccessControl<ListTypeInfo extends BaseListTypeInfo> =
  | {
      read?: IndividualFieldAccessControl<FieldReadItemAccessArgs<ListTypeInfo>>;
      create?: IndividualFieldAccessControl<FieldCreateItemAccessArgs<ListTypeInfo>>;
      update?: IndividualFieldAccessControl<FieldUpdateItemAccessArgs<ListTypeInfo>>;
      // filter?: COMING SOON
      // orderBy?: COMING SOON
    }
  | IndividualFieldAccessControl<
      | FieldCreateItemAccessArgs<ListTypeInfo>
      | FieldReadItemAccessArgs<ListTypeInfo>
      | FieldUpdateItemAccessArgs<ListTypeInfo>
    >;
