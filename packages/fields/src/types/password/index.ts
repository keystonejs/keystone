import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  schema,
} from '@keystone-next/types';
import bcryptjs from 'bcryptjs';
// @ts-ignore
import dumbPasswords from 'dumb-passwords';
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
    rejectCommon?: boolean;
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

const PasswordFilter = schema.inputObject({
  name: 'PasswordFilter',
  fields: {
    isSet: schema.arg({ type: schema.nonNull(schema.Boolean) }),
  },
});

const bcryptHashRegex = /^\$2[aby]?\$\d{1,2}\$[.\/A-Za-z0-9]{53}$/;

export const password =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    bcrypt = bcryptjs,
    minLength = 8,
    workFactor = 10,
    rejectCommon = false,
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
        if (rejectCommon && dumbPasswords.check(val)) {
          throw new Error(
            `[password:rejectCommon:${meta.listKey}:${meta.fieldKey}] Common and frequently-used passwords are not allowed.`
          );
        }
        if (val.length < minLength) {
          throw new Error(
            `[password:minLength:${meta.listKey}:${meta.fieldKey}] Value must be at least ${minLength} characters long.`
          );
        }

        return bcrypt.hash(val, workFactor);
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
        where: {
          arg: schema.arg({ type: PasswordFilter }),
          resolve(val) {
            if (val === null) {
              throw new Error('Password filters cannot be set to null');
            }
            if (val.isSet) {
              return {
                not: null,
              };
            }
            return null;
          },
        },
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
