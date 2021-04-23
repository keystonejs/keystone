import type { FieldType, BaseGeneratedListTypes } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';
import { FileImplementation, PrismaFileInterface } from './Implementation';

export type FileFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  isRequired?: boolean;
};

export const file = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: FileFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: {
    type: 'File',
    implementation: FileImplementation,
    adapter: PrismaFileInterface,
  },
  config,
  views: resolveView('file/views'),
});
