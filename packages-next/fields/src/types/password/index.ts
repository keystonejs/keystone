import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  schema,
} from '@keystone-next/types';
import bcryptjs from 'bcryptjs';
import { resolveView } from '../../resolve-view';

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

const PasswordState = schema.object<{ isSet: boolean }>()({
  name: 'PasswordState',
  fields: {
    isSet: schema.field({ type: schema.nonNull(schema.Boolean) }),
  },
});

const bcryptHashRegex = /^\$2[aby]?\$\d{1,2}\$[.\/A-Za-z0-9]{53}$/;

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
          arg: schema.arg({ type: schema.String }),
          resolve: inputResolver,
        },
        update: {
          arg: schema.arg({ type: schema.String }),
          resolve: inputResolver,
        },
      },
      views: resolveView('password/views'),
      getAdminMeta: () => ({ minLength: minLength }),
      output: schema.field({
        type: PasswordState,
        resolve(val) {
          return { isSet: val.value !== null && bcryptHashRegex.test(val.value) };
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
            [`${meta.fieldKey}_is_set`]: schema.arg({ type: schema.Boolean }),
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
