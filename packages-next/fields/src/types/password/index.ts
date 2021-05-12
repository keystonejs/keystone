import type { FieldType, BaseGeneratedListTypes } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';
// @ts-ignore
import { Password, PrismaPasswordInterface } from './Implementation';

type PasswordFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  FieldConfig<TGeneratedListTypes> & {
    minLength?: number;
    isRequired?: boolean;
    isIndexed?: boolean;
    bcrypt?: Pick<typeof import('bcryptjs'), 'compare' | 'compareSync' | 'hash' | 'hashSync'>;
  };

export const password = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: PasswordFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: {
    type: 'Password',
    implementation: Password,
    adapter: PrismaPasswordInterface,
  },
  config,
  views: resolveView('password/views'),
  getAdminMeta: () => ({ minLength: config.minLength !== undefined ? config.minLength : 8 }),
});
