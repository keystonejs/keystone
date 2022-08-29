import { userInputError } from '../../../lib/core/graphql-errors';
import {
  BaseModelTypeInfo,
  CommonFieldConfig,
  fieldType,
  FieldTypeFunc,
  orderDirectionEnum,
  filters,
} from '../../../types';
import { graphql } from '../../..';
import { assertCreateIsNonNullAllowed, assertReadIsNonNullAllowed } from '../../non-null-graphql';

export type CheckboxFieldConfig<ModelTypeInfo extends BaseModelTypeInfo> =
  CommonFieldConfig<ModelTypeInfo> & {
    defaultValue?: boolean;
    graphql?: {
      read?: { isNonNull?: boolean };
      create?: { isNonNull?: boolean };
    };
    db?: { map?: string };
  };

export const checkbox =
  <ModelTypeInfo extends BaseModelTypeInfo>({
    defaultValue = false,
    ...config
  }: CheckboxFieldConfig<ModelTypeInfo> = {}): FieldTypeFunc<ModelTypeInfo> =>
  meta => {
    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type checkbox");
    }

    assertReadIsNonNullAllowed(meta, config, false);
    assertCreateIsNonNullAllowed(meta, config);

    return fieldType({
      kind: 'scalar',
      mode: 'required',
      scalar: 'Boolean',
      default: { kind: 'literal', value: defaultValue },
      map: config.db?.map,
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
              throw userInputError('Checkbox fields cannot be set to null');
            }
            return val ?? defaultValue;
          },
        },
        update: {
          arg: graphql.arg({ type: graphql.Boolean }),
          resolve(val) {
            if (val === null) {
              throw userInputError('Checkbox fields cannot be set to null');
            }
            return val;
          },
        },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: config.graphql?.read?.isNonNull ? graphql.nonNull(graphql.Boolean) : graphql.Boolean,
      }),
      views: '@keystone-6/core/fields/types/checkbox/views',
      getAdminMeta: () => ({ defaultValue }),
    });
  };
