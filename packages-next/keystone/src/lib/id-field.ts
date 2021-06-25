import path from 'path';
import {
  fieldType,
  FieldTypeFunc,
  IdFieldConfig,
  legacyFilters,
  orderDirectionEnum,
  ScalarDBField,
  schema,
} from '@keystone-next/types';
import { validate } from 'uuid';
import { isCuid } from 'cuid';

const views = path.join(
  path.dirname(require.resolve('@keystone-next/keystone/package.json')),
  '___internal-do-not-use-will-break-in-patch/admin-ui/id-field-view'
);

const idParsers = {
  autoincrement(val: string | null) {
    if (val === null) {
      throw new Error('Only an integer can be passed to id filters');
    }
    const parsed = parseInt(val);
    if (Number.isInteger(parsed)) {
      return parsed;
    }
    throw new Error('Only an integer can be passed to id filters');
  },
  cuid(val: string | null) {
    // isCuid is just "it's a string and it starts with c"
    // https://github.com/ericelliott/cuid/blob/215b27bdb78d3400d4225a4eeecb3b71891a5f6f/index.js#L69-L73
    if (typeof val === 'string' && isCuid(val)) {
      return val.toLowerCase();
    }
    throw new Error('Only a cuid can be passed to id filters');
  },
  uuid(val: string | null) {
    if (typeof val === 'string' && validate(val)) {
      return val.toLowerCase();
    }
    throw new Error('Only a uuid can be passed to id filters');
  },
};

export const idFieldType =
  (config: IdFieldConfig): FieldTypeFunc =>
  meta => {
    const parseVal = idParsers[config.kind];
    return fieldType<ScalarDBField<'String' | 'Int', 'required'>>({
      kind: 'scalar',
      mode: 'required',
      scalar: config.kind === 'autoincrement' ? 'Int' : 'String',
      nativeType: meta.provider === 'postgresql' && config.kind === 'uuid' ? 'Uuid' : undefined,
      default: { kind: config.kind },
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
      views,
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
      },
      __legacy: {
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
      },
    });
  };

function equalityConditions(fieldKey: string, f: (a: string | null) => any) {
  return {
    [fieldKey]: (value: string | null) => ({ [fieldKey]: f(value) }),
    [`${fieldKey}_not`]: (value: string | null) => ({ NOT: { [fieldKey]: f(value) } }),
  };
}

function inConditions(fieldKey: string, f: (a: string | null) => any) {
  return {
    [`${fieldKey}_in`]: (value: (string | null)[] | null) => {
      if (value === null) {
        throw new Error(`null cannot be passed to ${fieldKey}_in filters`);
      }
      return {
        [fieldKey]: { in: value.map(x => f(x)) },
      };
    },
    [`${fieldKey}_not_in`]: (value: (string | null)[] | null) => {
      if (value === null) {
        throw new Error(`null cannot be passed to ${fieldKey}_not_in filters`);
      }
      return {
        NOT: { [fieldKey]: { in: value.map(x => f(x)) } },
      };
    },
  };
}
