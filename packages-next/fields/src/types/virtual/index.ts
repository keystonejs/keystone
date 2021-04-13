import type { FieldType, BaseGeneratedListTypes, KeystoneContext } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';
import { Virtual, PrismaVirtualInterface } from './Implementation';

export type VirtualFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  resolver: (rootVal: any, args: any, context: KeystoneContext, info: any) => any;
  graphQLReturnType?: string;
  graphQLReturnFragment?: string;
  extendGraphQLTypes?: string[];
  args?: { name: string; type: string }[];
};

export const virtual = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: VirtualFieldConfig<TGeneratedListTypes>
): FieldType<TGeneratedListTypes> => ({
  type: {
    type: 'Virtual',
    implementation: Virtual,
    adapter: PrismaVirtualInterface,
  },
  config,
  views: resolveView('virtual/views'),
  getAdminMeta: () => ({ graphQLReturnFragment: config.graphQLReturnFragment ?? '' }),
});
