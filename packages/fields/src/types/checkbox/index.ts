import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  CommonFieldConfig,
  fieldType,
  FieldTypeFunc,
  legacyFilters,
  orderDirectionEnum,
  schema,
  filters,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';

export type CheckboxFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<boolean, TGeneratedListTypes>;
    isRequired?: boolean;
  };

function resolveBooleanFilter(
  filter: Exclude<
    Partial<
      schema.InferValueFromArg<
        schema.Arg<typeof filters[keyof typeof filters]['Boolean']['optional']>
      >
    >,
    undefined
  >
): any {
  if (filter === null) {
    return null;
  }
  if (filter.equals != null) {
    const { equals, ...rest } = filter;
    return {
      AND: [{ equals: filter.equals }, { not: null }, resolveBooleanFilter(rest)],
    };
  }
  if (filter.not != null) {
    const { not, ...rest } = filter;
    return {
      AND: [{ NOT: [resolveBooleanFilter(not)] }, resolveBooleanFilter(rest)],
    };
  }
  return filter;
}

export const checkbox =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isRequired,
    defaultValue,
    ...config
  }: CheckboxFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    if ((config as any).isUnique) {
      throw Error('isUnique is not a supported option for field type checkbox');
    }

    return fieldType({ kind: 'scalar', mode: 'optional', scalar: 'Boolean' })({
      ...config,
      input: {
        where: {
          arg: schema.arg({ type: filters[meta.provider].Boolean.optional }),
          resolve: resolveBooleanFilter,
        },
        create: { arg: schema.arg({ type: schema.Boolean }) },
        update: { arg: schema.arg({ type: schema.Boolean }) },
        orderBy: { arg: schema.arg({ type: orderDirectionEnum }) },
      },
      output: schema.field({
        type: schema.Boolean,
      }),
      views: resolveView('checkbox/views'),
      __legacy: {
        filters: {
          fields: legacyFilters.fields.equalityInputFields(meta.fieldKey, schema.Boolean),
          impls: legacyFilters.impls.equalityConditions(meta.fieldKey),
        },
        isRequired,
        defaultValue,
      },
    });
  };
