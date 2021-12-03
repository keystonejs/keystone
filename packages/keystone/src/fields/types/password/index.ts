import bcryptjs from 'bcryptjs';
// @ts-ignore
import dumbPasswords from 'dumb-passwords';
import { userInputError } from '../../../lib/core/graphql-errors';
import { humanize } from '../../../lib/utils';
import { BaseListTypeInfo, fieldType, FieldTypeFunc, CommonFieldConfig } from '../../../types';
import { graphql } from '../../..';
import { resolveView } from '../../resolve-view';
import { getResolvedIsNullable } from '../../non-null-graphql';
import { PasswordFieldMeta } from './views';

export type PasswordFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    /**
     * @default 10
     */
    workFactor?: number;
    validation?: {
      isRequired?: boolean;
      rejectCommon?: boolean;
      match?: { regex: RegExp; explanation?: string };
      length?: {
        /** @default 8 */
        min?: number;
        max?: number;
      };
    };
    db?: {
      isNullable?: boolean;
      map?: string;
    };
    bcrypt?: Pick<typeof import('bcryptjs'), 'compare' | 'hash'>;
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
  <ListTypeInfo extends BaseListTypeInfo>({
    bcrypt = bcryptjs,
    workFactor = 10,
    validation: _validation,
    ...config
  }: PasswordFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> =>
  meta => {
    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type password");
    }

    const fieldLabel = config.label ?? humanize(meta.fieldKey);

    const validation = {
      isRequired: _validation?.isRequired ?? false,
      rejectCommon: _validation?.rejectCommon ?? false,
      match: _validation?.match
        ? {
            regex: _validation.match.regex,
            explanation:
              _validation.match.explanation ??
              `${fieldLabel} must match ${_validation.match.regex}`,
          }
        : null,
      length: {
        min: _validation?.length?.min ?? 8,
        max: _validation?.length?.max ?? null,
      },
    };

    const isNullable = getResolvedIsNullable(validation, config.db);

    for (const type of ['min', 'max'] as const) {
      const val = validation.length[type];
      if (val !== null && (!Number.isInteger(val) || val < 1)) {
        throw new Error(
          `The password field at ${meta.listKey}.${meta.fieldKey} specifies validation.length.${type}: ${val} but it must be a positive integer >= 1`
        );
      }
    }

    if (validation.length.max !== null && validation.length.min > validation.length.max) {
      throw new Error(
        `The password field at ${meta.listKey}.${meta.fieldKey} specifies a validation.length.max that is less than the validation.length.min, and therefore has no valid options`
      );
    }

    if (workFactor < 6 || workFactor > 31 || !Number.isInteger(workFactor)) {
      throw new Error(
        `The password field at ${meta.listKey}.${meta.fieldKey} specifies workFactor: ${workFactor} but it must be an integer between 6 and 31`
      );
    }

    function inputResolver(val: string | null | undefined) {
      if (val == null) {
        return val;
      }
      return bcrypt.hash(val, workFactor);
    }

    return fieldType({
      kind: 'scalar',
      scalar: 'String',
      mode: isNullable === false ? 'required' : 'optional',
      map: config.db?.map,
    })({
      ...config,
      hooks: {
        ...config.hooks,
        async validateInput(args) {
          const val = args.inputData[meta.fieldKey];
          if (
            args.resolvedData[meta.fieldKey] === null &&
            (validation?.isRequired || isNullable === false)
          ) {
            args.addValidationError(`${fieldLabel} is required`);
          }
          if (val != null) {
            if (val.length < validation.length.min) {
              if (validation.length.min === 1) {
                args.addValidationError(`${fieldLabel} must not be empty`);
              } else {
                args.addValidationError(
                  `${fieldLabel} must be at least ${validation.length.min} characters long`
                );
              }
            }
            if (validation.length.max !== null && val.length > validation.length.max) {
              args.addValidationError(
                `${fieldLabel} must be no longer than ${validation.length.min} characters`
              );
            }
            if (validation.match && !validation.match.regex.test(val)) {
              args.addValidationError(validation.match.explanation);
            }
            if (validation.rejectCommon && dumbPasswords.check(val)) {
              args.addValidationError(`${fieldLabel} is too common and is not allowed`);
            }
          }

          await config.hooks?.validateInput?.(args);
        },
      },
      input: {
        where:
          isNullable === false
            ? undefined
            : {
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
          resolve(val) {
            if (val === undefined) {
              return null;
            }
            return inputResolver(val);
          },
        },
        update: {
          arg: graphql.arg({ type: graphql.String }),
          resolve: inputResolver,
        },
      },
      views: resolveView('password/views'),
      getAdminMeta: (): PasswordFieldMeta => ({
        isNullable,
        validation: {
          ...validation,
          match: validation.match
            ? {
                regex: {
                  source: validation.match.regex.source,
                  flags: validation.match.regex.flags,
                },
                explanation: validation.match.explanation,
              }
            : null,
        },
      }),
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
    });
  };
