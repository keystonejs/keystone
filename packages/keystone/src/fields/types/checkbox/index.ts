import { userInputError } from '../../../lib/core/graphql-errors';
import {
  BaseGeneratedListTypes,
  CommonFieldConfig,
  fieldType,
  FieldTypeFunc,
  orderDirectionEnum,
  graphql,
  filters,
} from '../../../types';
import { assertCreateIsNonNullAllowed, assertReadIsNonNullAllowed } from '../../non-null-graphql';
import { resolveView } from '../../resolve-view';

export type CheckboxFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: boolean;
    graphql?: {
      read?: { isNonNull?: boolean };
      create?: { isNonNull?: boolean };
    };
  };

export const checkbox =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    defaultValue = false,
    ...config
  }: CheckboxFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type checkbox");
    }

    assertReadIsNonNullAllowed(meta, config);
    assertCreateIsNonNullAllowed(meta, config);

    return fieldType({
      kind: 'scalar',
      mode: 'required',
      scalar: 'Boolean',
      default: { kind: 'literal', value: defaultValue },
    })({
      ...config,
      input: {
        where: { arg: graphql.arg({ type: filters[meta.provider].Boolean.required }) },
        create: {
          arg: graphql.arg({
            type: config.graphql?.create?.isNonNull
              ? graphql.nonNull(graphql.Boolean)
              : graphql.Boolean,
            defaultValue: config.graphql?.create?.isNonNull ? defaultValue : undefined,
          }),
          resolve(val) {
            if (val === null) {
              throw userInputError('checkbox fields cannot be set to null');
            }
            return val ?? defaultValue;
          },
        },
        update: {
          arg: graphql.arg({ type: graphql.Boolean }),
          resolve(val) {
            if (val === null) {
              throw userInputError('checkbox fields cannot be set to null');
            }
            return val;
          },
        },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: config.graphql?.read?.isNonNull ? graphql.nonNull(graphql.Boolean) : graphql.Boolean,
      }),
      views: resolveView('checkbox/views'),
      getAdminMeta: () => ({ defaultValue }),
    });
  };
