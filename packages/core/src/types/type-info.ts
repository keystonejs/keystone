import { KeystoneContext } from './context';
import { BaseItem } from './next-fields';

type GraphQLInput = Record<string, any>;

type CommonBaseModelTypeInfo = {
  key: string;
  fields: string;
  item: BaseItem;
  inputs: {
    create: GraphQLInput;
    update: GraphQLInput;
    where: GraphQLInput;
  };
  /**
   * WARNING: may be renamed in patch
   */
  prisma: {
    create: Record<string, any>;
    update: Record<string, any>;
  };
  all: BaseKeystoneTypeInfo;
};

export type BaseListTypeInfo = CommonBaseModelTypeInfo & {
  inputs: {
    uniqueWhere: { readonly id?: string | null } & GraphQLInput;
    orderBy: Record<string, 'asc' | 'desc' | null>;
  };
};

export type BaseSingletonTypeInfo = CommonBaseModelTypeInfo;

export type BaseModelTypeInfo = BaseListTypeInfo | BaseSingletonTypeInfo;

export type KeystoneContextFromModelTypeInfo<ModelTypeInfo extends BaseModelTypeInfo> =
  KeystoneContext<ModelTypeInfo['all']>;

export type BaseKeystoneTypeInfo = {
  models: Record<string, BaseModelTypeInfo>;
  prisma: any;
};
