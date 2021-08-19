import type { MaybePromise } from '../utils';
import type { BaseGeneratedListTypes, KeystoneContext } from '..';

type BaseAccessArgs = {
  session: any;
  listKey: string;
  context: KeystoneContext;
};

type CreateAccessArgs<GeneratedListTypes extends BaseGeneratedListTypes> = BaseAccessArgs & {
  operation: 'create';
  /**
   * The input passed in from the GraphQL API
   */
  originalInput: GeneratedListTypes['inputs']['create'];
};

export type CreateAccessControl<GeneratedListTypes extends BaseGeneratedListTypes> =
  | boolean
  | ((args: CreateAccessArgs<GeneratedListTypes>) => MaybePromise<boolean>);

type ReadAccessArgs = BaseAccessArgs & { operation: 'read' };

export type ReadListAccessControl<GeneratedListTypes extends BaseGeneratedListTypes> =
  | boolean
  | GeneratedListTypes['inputs']['where']
  | ((args: ReadAccessArgs) => MaybePromise<GeneratedListTypes['inputs']['where'] | boolean>);

type UpdateAccessArgs<GeneratedListTypes extends BaseGeneratedListTypes> = BaseAccessArgs & {
  /**
   * The id being updated
   */
  itemId: string;
  operation: 'update';
  /**
   * The input passed in from the GraphQL API
   */
  originalInput: GeneratedListTypes['inputs']['update'];
};

export type UpdateListAccessControl<GeneratedListTypes extends BaseGeneratedListTypes> =
  | boolean
  | GeneratedListTypes['inputs']['where']
  | ((
      args: UpdateAccessArgs<GeneratedListTypes>
    ) => MaybePromise<GeneratedListTypes['inputs']['where'] | boolean>);

type DeleteAccessArgs = BaseAccessArgs & {
  /**
   * The id being deleted
   */
  itemId: string;
  operation: 'delete';
};

export type DeleteListAccessControl<GeneratedListTypes extends BaseGeneratedListTypes> =
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
    ) => MaybePromise<boolean>)
  | boolean;

export type IndividualFieldAccessControl<Args> = boolean | ((args: Args) => MaybePromise<boolean>);

type BaseFieldAccessArgs = {
  fieldKey: string;
};

export type FieldCreateAccessArgs<GeneratedListTypes extends BaseGeneratedListTypes> =
  CreateAccessArgs<GeneratedListTypes> & BaseFieldAccessArgs;

export type FieldReadAccessArgs<GeneratedListTypes extends BaseGeneratedListTypes> =
  ReadAccessArgs &
    BaseFieldAccessArgs & {
      item: GeneratedListTypes['backing'];
    };

export type FieldUpdateAccessArgs<GeneratedListTypes extends BaseGeneratedListTypes> =
  UpdateAccessArgs<GeneratedListTypes> &
    BaseFieldAccessArgs & {
      item: GeneratedListTypes['backing'];
    };

export type FieldAccessControl<GeneratedListTypes extends BaseGeneratedListTypes> =
  | {
      create?: IndividualFieldAccessControl<FieldCreateAccessArgs<GeneratedListTypes>>;
      read?: IndividualFieldAccessControl<FieldReadAccessArgs<GeneratedListTypes>>;
      update?: IndividualFieldAccessControl<FieldUpdateAccessArgs<GeneratedListTypes>>;
    }
  | IndividualFieldAccessControl<
      | FieldCreateAccessArgs<GeneratedListTypes>
      | FieldReadAccessArgs<GeneratedListTypes>
      | FieldUpdateAccessArgs<GeneratedListTypes>
    >;
