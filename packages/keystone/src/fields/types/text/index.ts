import {
  BaseGeneratedListTypes,
  CommonFieldConfig,
  fieldType,
  graphql,
  orderDirectionEnum,
  FieldTypeFunc,
  filters,
} from '../../../types';
import { resolveView } from '../../resolve-view';

export type TextFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    isIndexed?: boolean | 'unique';
    ui?: {
      displayMode?: 'input' | 'textarea';
    };
    validation?: {
      match?: { regex: RegExp; explanation?: string };
      length?: { min?: number; max?: number };
    };
  } & (
      | {
          defaultValue?: string;
          isNullable?: false;
        }
      | {
          defaultValue?: string | null;
          isNullable?: true;
        }
    );

export const text =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    defaultValue,
    isNullable = false,
    validation,
    ...config
  }: TextFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta =>
    fieldType({
      kind: 'scalar',
      mode: isNullable ? 'optional' : 'required',
      scalar: 'String',
      index: isIndexed === true ? 'index' : isIndexed === false ? undefined : isIndexed,
      default:
        isNullable === false || defaultValue !== undefined
          ? {
              kind: 'literal',
              value: defaultValue || '',
            }
          : undefined,
    })({
      ...config,
      hooks: {
        ...config.hooks,
        async validateInput(args) {
          const val = args.resolvedData[meta.fieldKey];
          if (val != null) {
            if (validation?.length?.min && val.length < validation.length.min) {
              args.addValidationError(`must be at least ${validation.length.min} characters long`);
            }
            if (validation?.length?.max && val.length > validation.length.max) {
              args.addValidationError(`must be no longer than ${validation.length.min} characters`);
            }
            if (validation?.match && !validation.match.regex.test(val)) {
              args.addValidationError(
                validation.match.explanation || `must match ${validation.match.regex}`
              );
            }
          }

          await config.hooks?.validateInput?.(args);
        },
      },
      input: {
        uniqueWhere:
          isIndexed === 'unique' ? { arg: graphql.arg({ type: graphql.String }) } : undefined,
        where: {
          arg: graphql.arg({
            type: filters[meta.provider].String[isNullable ? 'optional' : 'required'],
          }),
          resolve: filters.resolveString,
        },
        create: {
          arg: graphql.arg({
            type: isNullable ? graphql.String : graphql.nonNull(graphql.String),
            defaultValue,
          }),
        },
        update: { arg: graphql.arg({ type: graphql.String }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({ type: graphql.String }),
      views: resolveView('text/views'),
      getAdminMeta(): TextFieldMeta {
        return {
          displayMode: config.ui?.displayMode ?? 'input',
          shouldUseModeInsensitive: meta.provider === 'postgresql',
          validation: {
            match: validation?.match
              ? {
                  regex: {
                    source: validation.match.regex.source,
                    flags: validation.match.regex.flags,
                  },
                  explanation: validation.match.explanation ?? null,
                }
              : null,
            length: { max: validation?.length?.max ?? null, min: validation?.length?.min ?? null },
          },
          defaultValue: defaultValue ?? (isNullable ? null : ''),
          isNullable,
        };
      },
    });

export type TextFieldMeta = {
  displayMode: 'input' | 'textarea';
  shouldUseModeInsensitive: boolean;
  isNullable: boolean;
  validation: {
    match: { regex: { source: string; flags: string }; explanation: string | null } | null;
    length: { min: number | null; max: number | null };
  };
  defaultValue: string | null;
};
