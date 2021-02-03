// @ts-ignore
import { Virtual } from '@keystonejs/fields';
import type { FieldType, BaseGeneratedListTypes, KeystoneContext } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';

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
  type: Virtual,
  config,
  views: resolveView('virtual/views'),
  getAdminMeta: () => ({ graphQLReturnFragment: config.graphQLReturnFragment ?? '' }),
});
