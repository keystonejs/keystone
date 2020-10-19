// @ts-ignore
import { Virtual } from '@keystonejs/fields';
import type { FieldConfig } from '../../interfaces';
import type { FieldType } from '@keystone-spike/types';
import type { BaseGeneratedListTypes } from '@keystone-spike/types';
import { resolveView } from '../../resolve-view';

export type VirtualFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> = FieldConfig<
  TGeneratedListTypes
> & {
  resolver: (rootVal: any, args: any, ctx: any, info: any) => any;
  graphQLReturnType?: string;
  graphQLReturnFragment?: string;
  extendGraphQLTypes?: string[];
  args?: { name: string; type: string }[];
};

const views = resolveView('virtual/views');

export const virtual = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: VirtualFieldConfig<TGeneratedListTypes>
): FieldType<TGeneratedListTypes> => ({
  type: Virtual,
  config: config,
  views,
  getBackingType() {
    return {};
  },
});
