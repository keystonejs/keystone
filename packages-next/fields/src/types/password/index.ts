import { Password } from '@keystonejs/fields';
import type { FieldType, BaseGeneratedListTypes } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';

type PasswordFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> = FieldConfig<
  TGeneratedListTypes
> & {
  minLength?: number;
  isRequired?: boolean;
};

export const password = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: PasswordFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: Password,
  config,
  views: resolveView('password/views'),
  getAdminMeta: () => ({ minLength: config.minLength !== undefined ? config.minLength : 8 }),
});
