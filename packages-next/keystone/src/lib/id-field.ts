import {
  fieldType,
  FieldTypeFunc,
  IdFieldConfig,
  legacyFilters,
  orderDirectionEnum,
  ScalarDBField,
  schema,
} from '@keystone-next/types';

export const idFieldType =
  (config: IdFieldConfig): FieldTypeFunc =>
  meta => {
    const parseVal =
      config.kind === 'autoincrement' ? (x: any) => parseInt(x) || -1 : (x: any) => x;
    const __legacy = {
      filters: {
        fields: {
          ...legacyFilters.fields.equalityInputFields(meta.fieldKey, schema.ID),
          ...legacyFilters.fields.orderingInputFields(meta.fieldKey, schema.ID),
          ...legacyFilters.fields.inInputFields(meta.fieldKey, schema.ID),
        },
        impls: {
          ...equalityConditions(meta.fieldKey, parseVal),
          ...legacyFilters.impls.orderingConditions(meta.fieldKey, parseVal),
          ...inConditions(meta.fieldKey, parseVal),
        },
      },
    };
    if (meta.provider !== 'postgresql' && config.kind === 'uuid') {
      throw new Error('useNativeType for uuid id fields is only supported on postgresql');
    }
    return fieldType<ScalarDBField<'String' | 'Int', 'required'>>({
      kind: 'scalar',
      mode: 'required',
      scalar: config.kind === 'autoincrement' ? 'Int' : 'String',
      nativeType:
        meta.provider === 'postgresql' && config.kind === 'uuid' && config.useNativeType
          ? 'Uuid'
          : undefined,
      default:
        meta.provider === 'postgresql' && config.kind === 'uuid'
          ? { kind: 'dbgenerated', value: 'gen_random_uuid()' }
          : { kind: config.kind },
    })({
      input: {
        uniqueWhere: { arg: schema.arg({ type: schema.ID }), resolve: parseVal },
        orderBy: { arg: schema.arg({ type: orderDirectionEnum }) },
      },
      output: schema.field({
        type: schema.nonNull(schema.ID),
        resolve({ value }) {
          return value.toString();
        },
      }),
      views: '@keystone-next/fields/types/integer/views',
      __legacy,
    });
  };

function equalityConditions<T>(fieldKey: string, f: (a: any) => any = x => x) {
  return {
    [fieldKey]: (value: T) => ({ [fieldKey]: f(value) }),
    [`${fieldKey}_not`]: (value: T) => ({ NOT: { [fieldKey]: f(value) } }),
  };
}

function inConditions<T>(fieldKey: string, f: (a: any) => any = x => x) {
  return {
    [`${fieldKey}_in`]: (value: (T | null)[]) =>
      value.includes(null)
        ? { [fieldKey]: { in: f(value.filter(x => x !== null)) } }
        : { [fieldKey]: { in: f(value) } },
    [`${fieldKey}_not_in`]: (value: (T | null)[]) =>
      value.includes(null)
        ? { AND: [{ NOT: { [fieldKey]: { in: f(value.filter(x => x !== null)) } } }] }
        : { NOT: { [fieldKey]: { in: f(value) } } },
  };
}
