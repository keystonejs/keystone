import path from 'path';
import { validate } from 'uuid';
import { isCuid } from 'cuid';
import {
  fieldType,
  FieldTypeFunc,
  IdFieldConfig,
  orderDirectionEnum,
  ScalarDBField,
  schema,
} from '../types';

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
      return val;
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

const nonCircularFields = {
  equals: schema.arg({ type: schema.ID }),
  in: schema.arg({ type: schema.list(schema.nonNull(schema.ID)) }),
  notIn: schema.arg({ type: schema.list(schema.nonNull(schema.ID)) }),
  lt: schema.arg({ type: schema.ID }),
  lte: schema.arg({ type: schema.ID }),
  gt: schema.arg({ type: schema.ID }),
  gte: schema.arg({ type: schema.ID }),
};

type IDFilterType = schema.InputObjectType<
  typeof nonCircularFields & {
    not: schema.Arg<typeof IDFilter>;
  }
>;

const IDFilter: IDFilterType = schema.inputObject({
  name: 'IDFilter',
  fields: () => ({
    ...nonCircularFields,
    not: schema.arg({ type: IDFilter }),
  }),
});

const filterArg = schema.arg({ type: IDFilter });

function resolveVal(
  input: Exclude<schema.InferValueFromArg<typeof filterArg>, undefined>,
  kind: IdFieldConfig['kind']
): any {
  if (input === null) {
    throw new Error('id filter cannot be null');
  }
  const idParser = idParsers[kind];
  const obj: any = {};
  for (const key of ['equals', 'gt', 'gte', 'lt', 'lte'] as const) {
    const val = input[key];
    if (val !== undefined) {
      const parsed = idParser(val);
      obj[key] = parsed;
    }
  }
  for (const key of ['in', 'notIn'] as const) {
    const val = input[key];
    if (val !== undefined) {
      if (val === null) {
        throw new Error(`${key} id filter cannot be null`);
      }
      obj[key] = val.map(x => idParser(x));
    }
  }
  if (input.not !== undefined) {
    obj.not = resolveVal(input.not, kind);
  }
  return obj;
}

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
        where: {
          arg: filterArg,
          resolve(val) {
            return resolveVal(val, config.kind);
          },
        },
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
      getAdminMeta: () => ({ kind: config.kind }),
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
      },
    });
  };
