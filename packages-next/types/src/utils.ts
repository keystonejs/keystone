export type BaseGeneratedListTypes = {
  key: string;
  fields: string;
  backing: BackingTypeForItem;
  inputs: {
    create: GraphQLInput;
    update: GraphQLInput;
    where: GraphQLInput;
  };
  args: {
    listQuery: GraphQLInput;
  };
};

type BackingTypeForItem = any;

type GraphQLInput = Record<string, any>;

export type GraphQLContext = Record<string, any>;

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
  listQueryMetaName: string;
  listMetaName: string;
  listSortName: string;
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
  relateToManyInputName: string;
  relateToOneInputName: string;
};

export type MaybePromise<T> = T | Promise<T>;
