import { humanize } from '../../../lib/utils';
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
    isIndexed?: true | 'unique';
    ui?: {
      displayMode?: 'input' | 'textarea';
    };
    validation?: {
      match?: { regex: RegExp; explanation?: string };
      length?: { min?: number; max?: number };
    };
    defaultValue?: string;
  } & ({ isNullable?: false; graphql?: { isNonNull?: true } } | { isNullable: true });

function validateLen(num: number | undefined, kind: 'min' | 'max') {
  if (num !== undefined && (!Number.isInteger(num) || num < 0)) {
  }
}

export const text =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    defaultValue: _defaultValue,
    validation,
    ...config
  }: TextFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    const { isNullable = false } = config;
    if (
      (config.access === false ||
        typeof config.access === 'function' ||
        (typeof config.access === 'object' && config.access.read !== true)) &&
      !config.isNullable &&
      config.graphql?.isNonNull
    ) {
      throw new Error(
        `The text field at ${meta.listKey}.${meta.fieldKey} sets access.read and also sets graphql.isNonNull === true ` +
          `but graphql.isNonNull === true is only allowed when a field does not set access.read`
      );
    }

    const fieldLabel = config.label ?? humanize(meta.fieldKey);

    const defaultValue =
      isNullable === false || _defaultValue !== undefined ? _defaultValue || '' : undefined;
    return fieldType({
      kind: 'scalar',
      mode: isNullable ? 'optional' : 'required',
      scalar: 'String',
      default:
        defaultValue != null
          ? {
              kind: 'literal',
              value: defaultValue,
            }
          : undefined,
      index: isIndexed === true ? 'index' : isIndexed || undefined,
    })({
      ...config,
      hooks: {
        ...config.hooks,
        async validateInput(args) {
          const val = args.resolvedData[meta.fieldKey];
          if (val != null) {
            if (validation?.length?.min && val.length < validation.length.min) {
              if (validation.length.min === 1) {
                args.addValidationError(`${fieldLabel} must not be empty`);
              } else {
                args.addValidationError(
                  `${fieldLabel} must be at least ${validation.length.min} characters long`
                );
              }
            }
            if (validation?.length?.max && val.length > validation.length.max) {
              args.addValidationError(
                `${fieldLabel} must be no longer than ${validation.length.min} characters`
              );
            }
            if (validation?.match && !validation.match.regex.test(val)) {
              args.addValidationError(
                validation.match.explanation || `${fieldLabel} must match ${validation.match.regex}`
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
      output: graphql.field({
        type:
          config.isNullable !== true && config.graphql?.isNonNull
            ? graphql.nonNull(graphql.String)
            : graphql.String,
      }),
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
  };

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
