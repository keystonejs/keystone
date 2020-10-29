import type { GraphQLContext, MaybePromise } from '../utils';
import type { BaseGeneratedListTypes } from '..';

type BaseAccessArgs = {
  session: any;
  listKey: string;
  context: GraphQLContext;
  // idk if this is optional or not
  gqlName?: string;
};

type CreateAccessArgs<GeneratedListTypes extends BaseGeneratedListTypes> = BaseAccessArgs & {
  operation: 'create';
  /**
   * The input passed in from the GraphQL API
   */
  originalInput?:
    | GeneratedListTypes['inputs']['create']
    | readonly { readonly data: GeneratedListTypes['inputs']['create'] }[];
};

type CreateAccessControl<GeneratedListTypes extends BaseGeneratedListTypes> =
  | boolean
  | ((args: CreateAccessArgs<GeneratedListTypes>) => MaybePromise<boolean>);

type ReadAccessArgs = BaseAccessArgs & { operation: 'read' };

type ReadListAccessControl<GeneratedListTypes extends BaseGeneratedListTypes> =
  | boolean
  | GeneratedListTypes['inputs']['where']
  | ((args: ReadAccessArgs) => MaybePromise<GeneratedListTypes['inputs']['where'] | boolean>);

type UpdateAccessArgs<GeneratedListTypes extends BaseGeneratedListTypes> = BaseAccessArgs & {
  /**
   * The id being updated if a single item is being updated
   */
  itemId?: string;
  /**
   * The ids being updated if many items are being updated
   */
  itemIds?: string[];
  operation: 'update';
  /**
   * The input passed in from the GraphQL API
   */
  originalInput?:
    | GeneratedListTypes['inputs']['update']
    | readonly { readonly id: string; readonly data: GeneratedListTypes['inputs']['update'] }[];
};

type UpdateListAccessControl<GeneratedListTypes extends BaseGeneratedListTypes> =
  | boolean
  | GeneratedListTypes['inputs']['where']
  | ((
      args: UpdateAccessArgs<GeneratedListTypes>
    ) => MaybePromise<GeneratedListTypes['inputs']['where'] | boolean>);

type DeleteAccessArgs = BaseAccessArgs & {
  /**
   * The id being deleted if a single item is being deleted
   */
  itemId?: string;
  /**
   * The ids being deleted if many items are being deleted
   */
  itemIds?: string[];
  operation: 'delete';
};

type DeleteListAccessControl<GeneratedListTypes extends BaseGeneratedListTypes> =
  | boolean
  | GeneratedListTypes['inputs']['where']
  | ((args: DeleteAccessArgs) => MaybePromise<GeneratedListTypes['inputs']['where'] | boolean>);

export type ListAccessControl<GeneratedListTypes extends BaseGeneratedListTypes> =
  | {
      create?: CreateAccessControl<GeneratedListTypes>;
      read?: ReadListAccessControl<GeneratedListTypes>;
      update?: UpdateListAccessControl<GeneratedListTypes>;
      delete?: DeleteListAccessControl<GeneratedListTypes>;
    }
  | ((
      args:
        | ReadAccessArgs
        | CreateAccessArgs<GeneratedListTypes>
        | UpdateAccessArgs<GeneratedListTypes>
        | DeleteAccessArgs
    ) => MaybePromise<GeneratedListTypes['inputs']['where'] | boolean>);

type IndividualFieldAccessControl<Args> = boolean | ((args: Args) => MaybePromise<boolean>);

type BaseFieldAccessArgs = {
  fieldKey: string;
};

type FieldCreateAccessArgs<GeneratedListTypes extends BaseGeneratedListTypes> = CreateAccessArgs<
  GeneratedListTypes
> &
  BaseFieldAccessArgs;

type FieldReadAccessArgs<GeneratedListTypes extends BaseGeneratedListTypes> = ReadAccessArgs &
  BaseFieldAccessArgs & {
    item: GeneratedListTypes['backing'];
  };

type FieldUpdateAccessArgs<GeneratedListTypes extends BaseGeneratedListTypes> = UpdateAccessArgs<
  GeneratedListTypes
> &
  BaseFieldAccessArgs & {
    item: GeneratedListTypes['backing'];
  };

type FieldDeleteAccessArgs = DeleteAccessArgs & BaseFieldAccessArgs;

export type FieldAccessControl<GeneratedListTypes extends BaseGeneratedListTypes> =
  | {
      create?: IndividualFieldAccessControl<FieldCreateAccessArgs<GeneratedListTypes>>;
      read?: IndividualFieldAccessControl<FieldReadAccessArgs<GeneratedListTypes>>;
      update?: IndividualFieldAccessControl<FieldUpdateAccessArgs<GeneratedListTypes>>;
      delete?: IndividualFieldAccessControl<FieldDeleteAccessArgs>;
    }
  | IndividualFieldAccessControl<
      | FieldCreateAccessArgs<GeneratedListTypes>
      | FieldReadAccessArgs<GeneratedListTypes>
      | FieldUpdateAccessArgs<GeneratedListTypes>
      | FieldDeleteAccessArgs
    >;
