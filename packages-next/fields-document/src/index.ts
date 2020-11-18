// @ts-ignore
import { DocumentFieldType } from './base-field-type';
import type { FieldType, BaseGeneratedListTypes, FieldConfig } from '@keystone-next/types';
import path from 'path';

export type DocumentFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> = FieldConfig<
  TGeneratedListTypes
> & {
  isRequired?: boolean;
};

const views = path.join(
  path.dirname(require.resolve('@keystone-next/fields-document/package.json')),
  'views'
);

export const document = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: DocumentFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: DocumentFieldType,
  config,
  views,
});
