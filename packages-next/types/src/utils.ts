export type BaseGeneratedListTypes = {
  key: string;
  fields: string;
  backing: BackingTypeForItem;
  inputs: {
    create: GraphQLInput;
    update: GraphQLInput;
    where: GraphQLInput;
    uniqueWhere: { readonly id?: string | null } & GraphQLInput;
  };
  args: {
    listQuery: {
      readonly where?: GraphQLInput | null;
      readonly search?: string | null;
      readonly first?: number | null;
      readonly skip?: number | null;
      readonly orderBy?:
        | Record<string, 'asc' | 'desc' | null>
        | readonly Record<string, 'asc' | 'desc' | null>[];
      readonly sortBy?: string | ReadonlyArray<string> | null;
    };
  };
};

type BackingTypeForItem = any;

type GraphQLInput = Record<string, any>;

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | Array<JSONValue>
  | { [key: string]: JSONValue };

export type GqlNames = {
  outputTypeName: string;
  itemQueryName: string;
  listQueryName: string;
  listQueryCountName: string;
  listOrderName: string;
  deleteMutationName: string;
  updateMutationName: string;
  createMutationName: string;
  deleteManyMutationName: string;
  updateManyMutationName: string;
  createManyMutationName: string;
  whereInputName: string;
  whereUniqueInputName: string;
  updateInputName: string;
  createInputName: string;
  updateManyInputName: string;
  createManyInputName: string;
  relateToManyForCreateInputName: string;
  relateToManyForUpdateInputName: string;
  relateToOneInputName: string;
};

export type MaybePromise<T> = T | Promise<T>;
