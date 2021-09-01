import {
  BaseGeneratedListTypes,
  CommonFieldConfig,
  fieldType,
  FieldTypeFunc,
  orderDirectionEnum,
  graphql,
  filters,
} from '../../../types';
import { resolveView } from '../../resolve-view';

export type CheckboxFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: boolean;
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

    return fieldType({
      kind: 'scalar',
      mode: 'required',
      scalar: 'Boolean',
      default: { kind: 'literal', value: defaultValue },
    })({
      ...config,
      input: {
        where: {
          arg: graphql.arg({ type: filters[meta.provider].Boolean.required }),
          resolve: filters.resolveCommon,
        },
        create: { arg: graphql.arg({ type: graphql.nonNull(graphql.Boolean), defaultValue }) },
        update: {
          arg: graphql.arg({ type: graphql.Boolean }),
          resolve(val) {
            if (val === null) {
              throw new Error('checkbox fields cannot be set to null');
            }
            return val;
          },
        },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({ type: graphql.Boolean }),
      views: resolveView('checkbox/views'),
      getAdminMeta: () => ({ defaultValue }),
    });
  };
