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
import { assertCreateIsNonNullAllowed, assertReadIsNonNullAllowed } from '../../non-null-graphql';
import { resolveView } from '../../resolve-view';

export type TextFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    isIndexed?: true | 'unique';
    ui?: {
      displayMode?: 'input' | 'textarea';
    };
    validation?: {
      isRequired?: boolean;
      match?: { regex: RegExp; explanation?: string };
      length?: { min?: number; max?: number };
    };
    defaultValue?: string;
    graphql?: { create?: { isNonNull?: boolean } };
  } & ({ isNullable?: false; graphql?: { read?: { isNonNull?: boolean } } } | { isNullable: true });

export const text =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    defaultValue: _defaultValue,
    validation,
    ...config
  }: TextFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    const { isNullable = false } = config;

    const fieldLabel = config.label ?? humanize(meta.fieldKey);

    if (!config.isNullable) {
      assertReadIsNonNullAllowed(meta, config);
    }
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
        },
        update: { arg: graphql.arg({ type: graphql.String }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type:
          config.isNullable !== true && config.graphql?.read?.isNonNull
            ? graphql.nonNull(graphql.String)
            : graphql.String,
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
