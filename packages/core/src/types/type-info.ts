import type { BaseItem } from './next-fields';

type GraphQLInput = Record<string, any>;

export type BaseListTypeInfo<Session = any> = {
  SchemaTypeInfo: BaseKeystoneTypeInfo<Session>;

  /**
   * the key of the list in TypeInfo['lists']
   */
  key: string;
  isSingleton: boolean;
  fields: string;
  item: BaseItem;
  inputs: {
    create: GraphQLInput;
    update: GraphQLInput;
    where: GraphQLInput;
    uniqueWhere: { readonly id?: string | number | null } & GraphQLInput;
    orderBy: Record<string, 'asc' | 'desc' | null>;
  };
  /**
   * WARNING: may be renamed in patch
   */
  prisma: {
    create: Record<string, any>;
    update: Record<string, any>;
  };
};

export type BaseKeystoneTypeInfo<Session = any> = {
  lists: Record<string, BaseListTypeInfo<Session>>;
  prisma: any;
  session: any;
};
