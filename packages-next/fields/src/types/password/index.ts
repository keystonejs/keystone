import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  fieldType,
  FieldTypeFunc,
  types,
} from '@keystone-next/types';
import bcryptjs from 'bcryptjs';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

type PasswordFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    /**
     * @default 8
     */
    minLength?: number;
    /**
     * @default 10
     */
    workFactor?: number;
    bcrypt?: Pick<typeof import('bcryptjs'), 'compare' | 'compareSync' | 'hash' | 'hashSync'>;
    defaultValue?: FieldDefaultValue<string, TGeneratedListTypes>;
    isRequired?: boolean;
  };

const PasswordState = types.object<{ isSet: boolean }>()({
  name: 'PasswordState',
  fields: {
    isSet: types.field({ type: types.nonNull(types.Boolean) }),
  },
});

export const password =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    bcrypt = bcryptjs,
    minLength = 8,
    workFactor = 10,
    isRequired,
    defaultValue,
    ...config
  }: PasswordFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    // TODO: we should just throw not automatically fix it, yeah?
    workFactor = Math.min(Math.max(workFactor, 4), 31);

    if (workFactor < 6) {
      console.warn(
        `The workFactor for ${meta.listKey}.${meta.fieldKey} is very low! ` +
          `This will cause weak hashes!`
      );
    }

    function inputResolver(val: string | null | undefined) {
      if (val === '') {
        return null;
      }
      if (typeof val === 'string') {
        return bcrypt.hash(val, 10);
      }
      return val;
    }

    if ((config as any).isUnique) {
      throw Error('isUnique is not a supported option for field type password');
    }

    return fieldType({
      kind: 'scalar',
      scalar: 'String',
      mode: 'optional',
    })({
      ...config,
      input: {
        create: {
          arg: types.arg({ type: types.String }),
          resolve: inputResolver,
        },
        update: {
          arg: types.arg({ type: types.String }),
          resolve: inputResolver,
        },
      },
      views: resolveView('password/views'),
      getAdminMeta: () => ({ minLength: minLength }),
      output: types.field({
        type: PasswordState,
        resolve(val) {
          return { isSet: val.value !== null };
        },
        extensions: {
          keystoneSecretField: {
            generateHash: async (secret: string) => {
              return bcrypt.hash(secret, workFactor);
            },
            compare: (secret: string, hash: string) => {
              return bcrypt.compare(secret, hash);
            },
          },
        },
      }),
      __legacy: {
        filters: {
          fields: {
            [`${meta.fieldKey}_is_set`]: types.arg({ type: types.Boolean }),
          },
          impls: {
            [`${meta.fieldKey}_is_set`]: value =>
              value ? { NOT: { [meta.fieldKey]: null } } : { [meta.fieldKey]: null },
          },
        },
        isRequired,
        defaultValue,
      },
    });
  };
