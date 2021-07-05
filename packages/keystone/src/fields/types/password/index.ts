import bcryptjs from 'bcryptjs';
// @ts-ignore
import dumbPasswords from 'dumb-passwords';
import { userInputError } from '../../../lib/core/graphql-errors';
import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  graphql,
} from '../../../types';
import { resolveView } from '../../resolve-view';

export type PasswordFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
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

const PasswordState = graphql.object<{ isSet: boolean }>()({
  name: 'PasswordState',
  fields: {
    isSet: graphql.field({ type: graphql.nonNull(graphql.Boolean) }),
  },
});

const PasswordFilter = graphql.inputObject({
  name: 'PasswordFilter',
  fields: {
    isSet: graphql.arg({ type: graphql.nonNull(graphql.Boolean) }),
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

    function validateInput(args: any) {
      const { originalInput, fieldPath, addValidationError } = args;
      const val = originalInput[fieldPath];
      if (val === '') {
        return;
      }
      if (typeof val === 'string') {
        if (rejectCommon && dumbPasswords.check(val)) {
          const msg = `Common and frequently-used passwords are not allowed.`;
          addValidationError(msg);
        }
        if (val.length < minLength) {
          const msg = `Value must be at least ${minLength} characters long.`;
          addValidationError(msg);
        }
      }
    }

    function inputResolver(val: string | null | undefined) {
      if (val === '') {
        return null;
      } else if (typeof val === 'string') {
        return bcrypt.hash(val, workFactor);
      } else {
        return val;
      }
    }

    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type password");
    }

    return fieldType({
      kind: 'scalar',
      scalar: 'String',
      mode: 'optional',
    })({
      ...config,
      input: {
        where: {
          arg: graphql.arg({ type: PasswordFilter }),
          resolve(val) {
            if (val === null) {
              throw userInputError('Password filters cannot be set to null');
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
          arg: graphql.arg({ type: graphql.String }),
          resolve: inputResolver,
          validate: validateInput,
        },
        update: {
          arg: graphql.arg({ type: graphql.String }),
          resolve: inputResolver,
          validate: validateInput,
        },
      },
      views: resolveView('password/views'),
      getAdminMeta: () => ({ minLength: minLength }),
      output: graphql.field({
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
        isRequired,
        defaultValue,
      },
    });
  };
