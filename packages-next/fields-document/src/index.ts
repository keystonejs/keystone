import { DocumentFieldType } from './base-field-type';
import type { FieldType, BaseGeneratedListTypes, FieldConfig } from '@keystone-next/types';
import path from 'path';
import { Relationships } from './DocumentEditor/relationship';

export type DocumentFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  isRequired?: boolean;
  relationships?: Relationships;
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
  getAdminMeta() {
    return { relationships: config.relationships ? config.relationships : {} };
  },
  views,
});
