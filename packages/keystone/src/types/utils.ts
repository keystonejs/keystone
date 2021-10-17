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
      readonly take?: number | null;
      readonly skip?: number;
      readonly orderBy?:
        | Record<string, 'asc' | 'desc' | null>
        | readonly Record<string, 'asc' | 'desc' | null>[];
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
  | readonly JSONValue[]
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
  relateToManyForCreateInputName: string;
  relateToManyForUpdateInputName: string;
  relateToOneForCreateInputName: string;
  relateToOneForUpdateInputName: string;
};

export type MaybePromise<T> = T | Promise<T>;
