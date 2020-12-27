import path from 'path';
// @ts-ignore
import { Wysiwyg } from '@keystonejs/fields-wysiwyg-tinymce';
import type { FieldType, FieldConfig, BaseGeneratedListTypes } from '@keystone-next/types';

type WysiwygFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  isRequired?: boolean;
  editorConfig: any;
};

export const wysiwyg = <TGeneratedListTypes extends BaseGeneratedListTypes>({
  editorConfig,
  ...config
}: WysiwygFieldConfig<TGeneratedListTypes>): FieldType<TGeneratedListTypes> => ({
  type: Wysiwyg,
  config: {
    editorConfig,
    ...config,
  },
  views: path.join(
    path.dirname(require.resolve('@keystone-next/wysiwyg/package.json')),
    'views'
  ),
});
