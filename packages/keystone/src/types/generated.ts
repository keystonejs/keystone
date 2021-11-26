import { KeystoneContext } from './context';
import { ItemRootValue } from './next-fields';

type GraphQLInput = Record<string, any>;

export type BaseGeneratedListTypes = {
  key: string;
  fields: string;
  backing: ItemRootValue;
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
  all: KeystoneGeneratedTypes;
};

export type KeystoneContextFromListTypes<GeneratedListTypes extends BaseGeneratedListTypes> =
  KeystoneContextFromKSTypes<GeneratedListTypes['all']>;

export type KeystoneGeneratedTypes = { lists: Record<string, BaseGeneratedListTypes>; prisma: any };

export type KeystoneContextFromKSTypes<KSTypes extends KeystoneGeneratedTypes> =
  KeystoneContext<KSTypes>;
