import { humanize } from '../../../lib/utils';
import {
  BaseListTypeInfo,
  CommonFieldConfig,
  fieldType,
  orderDirectionEnum,
  FieldTypeFunc,
  filters,
} from '../../../types';
import { graphql } from '../../..';
import { assertCreateIsNonNullAllowed, assertReadIsNonNullAllowed } from '../../non-null-graphql';
import { resolveView } from '../../resolve-view';

export type TextFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    isIndexed?: true | 'unique';
    ui?: {
      displayMode?: 'input' | 'textarea';
    };
    validation?: {
      /**
       * Makes the field disallow null values and require a string at least 1 character long
       */
      isRequired?: boolean;
      match?: { regex: RegExp; explanation?: string };
      length?: { min?: number; max?: number };
    };
    defaultValue?: string;
    graphql?: { create?: { isNonNull?: boolean }; read?: { isNonNull?: boolean } };
    db?: { isNullable?: boolean; map?: string };
  };

export const text =
  <ListTypeInfo extends BaseListTypeInfo>({
    isIndexed,
    defaultValue: _defaultValue,
    validation: _validation,
    ...config
  }: TextFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> =>
  meta => {
    for (const type of ['min', 'max'] as const) {
      const val = _validation?.length?.[type];
      if (val !== undefined && (!Number.isInteger(val) || val < 0)) {
        throw new Error(
          `The text field at ${meta.listKey}.${meta.fieldKey} specifies validation.length.${type}: ${val} but it must be a positive integer`
        );
      }
      if (_validation?.isRequired && val !== undefined && val === 0) {
        throw new Error(
          `The text field at ${meta.listKey}.${meta.fieldKey} specifies validation.isRequired: true and validation.length.${type}: 0, this is not allowed because validation.isRequired implies at least a min length of 1`
        );
      }
    }

    if (
      _validation?.length?.min !== undefined &&
      _validation?.length?.max !== undefined &&
      _validation?.length?.min > _validation?.length?.max
    ) {
      throw new Error(
        `The text field at ${meta.listKey}.${meta.fieldKey} specifies a validation.length.max that is less than the validation.length.min, and therefore has no valid options`
      );
    }

    const validation = {
      ..._validation,
      length: {
        min: _validation?.isRequired ? _validation?.length?.min ?? 1 : _validation?.length?.min,
        max: _validation?.length?.max,
      },
    };

    // defaulted to false as a zero length string is preferred to null
    const isNullable = config.db?.isNullable ?? false;

    const fieldLabel = config.label ?? humanize(meta.fieldKey);

    assertReadIsNonNullAllowed(meta, config, isNullable);

    assertCreateIsNonNullAllowed(meta, config);

    const mode = isNullable ? 'optional' : 'required';

    const defaultValue =
      isNullable === false || _defaultValue !== undefined ? _defaultValue || '' : undefined;
    return fieldType({
      kind: 'scalar',
      mode,
      scalar: 'String',
      default: defaultValue === undefined ? undefined : { kind: 'literal', value: defaultValue },
      index: isIndexed === true ? 'index' : isIndexed || undefined,
      map: config.db?.map,
    })({
      ...config,
      hooks: {
        ...config.hooks,
        async validateInput(args) {
          const val = args.resolvedData[meta.fieldKey];
          if (val === null && (validation?.isRequired || isNullable === false)) {
            args.addValidationError(`${fieldLabel} is required`);
          }
          if (val != null) {
            if (validation?.length?.min !== undefined && val.length < validation.length.min) {
              if (validation.length.min === 1) {
                args.addValidationError(`${fieldLabel} must not be empty`);
              } else {
                args.addValidationError(
                  `${fieldLabel} must be at least ${validation.length.min} characters long`
                );
              }
            }
            if (validation?.length?.max !== undefined && val.length > validation.length.max) {
              args.addValidationError(
                `${fieldLabel} must be no longer than ${validation.length.max} characters`
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
            type: filters[meta.provider].String[mode],
          }),
          resolve: mode === 'required' ? undefined : filters.resolveString,
        },
        create: {
          arg: graphql.arg({
            type: config.graphql?.create?.isNonNull
              ? graphql.nonNull(graphql.String)
              : graphql.String,
            defaultValue: config.graphql?.create?.isNonNull ? defaultValue : undefined,
          }),
          resolve(val) {
            if (val === undefined) {
              return defaultValue ?? null;
            }
            return val;
          },
        },
        update: { arg: graphql.arg({ type: graphql.String }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: config.graphql?.read?.isNonNull ? graphql.nonNull(graphql.String) : graphql.String,
      }),
      views: resolveView('text/views'),
      getAdminMeta(): TextFieldMeta {
        return {
          displayMode: config.ui?.displayMode ?? 'input',
          shouldUseModeInsensitive: meta.provider === 'postgresql',
          validation: {
            isRequired: validation?.isRequired ?? false,
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
    isRequired: boolean;
    match: { regex: { source: string; flags: string }; explanation: string | null } | null;
    length: { min: number | null; max: number | null };
  };
  defaultValue: string | null;
};
