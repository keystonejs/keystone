import { validate } from 'uuid';
import { isCuid } from 'cuid';
import {
  BaseListTypeInfo,
  fieldType,
  FieldTypeFunc,
  IdFieldConfig,
  orderDirectionEnum,
} from '../types';
import { graphql } from '..';
import { userInputError } from './core/graphql-errors';

const idParsers = {
  autoincrement(val: string | null) {
    if (val === null) {
      throw userInputError('Only an integer can be passed to id filters');
    }
    const parsed = parseInt(val);
    if (Number.isInteger(parsed)) {
      return parsed;
    }
    throw userInputError('Only an integer can be passed to id filters');
  },
  autoincrementBigInt(val: string | null) {
    if (val === null) {
      throw userInputError('Only a bigint can be passed to id filters');
    }
    try {
      return BigInt(val);
    } catch (err) {
      throw userInputError('Only a bigint can be passed to id filters');
    }
  },
  cuid(val: string | null) {
    // isCuid is just "it's a string and it starts with c"
    // https://github.com/ericelliott/cuid/blob/215b27bdb78d3400d4225a4eeecb3b71891a5f6f/index.js#L69-L73
    if (typeof val === 'string' && isCuid(val)) {
      return val;
    }
    throw userInputError('Only a cuid can be passed to id filters');
  },
  uuid(val: string | null) {
    if (typeof val === 'string' && validate(val)) {
      return val.toLowerCase();
    }
    throw userInputError('Only a uuid can be passed to id filters');
  },
};

const nonCircularFields = {
  equals: graphql.arg({ type: graphql.ID }),
  in: graphql.arg({ type: graphql.list(graphql.nonNull(graphql.ID)) }),
  notIn: graphql.arg({ type: graphql.list(graphql.nonNull(graphql.ID)) }),
  lt: graphql.arg({ type: graphql.ID }),
  lte: graphql.arg({ type: graphql.ID }),
  gt: graphql.arg({ type: graphql.ID }),
  gte: graphql.arg({ type: graphql.ID }),
};

type IDFilterType = graphql.InputObjectType<
  typeof nonCircularFields & {
    not: graphql.Arg<typeof IDFilter>;
  }
>;

const IDFilter: IDFilterType = graphql.inputObject({
  name: 'IDFilter',
  fields: () => ({
    ...nonCircularFields,
    not: graphql.arg({ type: IDFilter }),
  }),
});

const filterArg = graphql.arg({ type: IDFilter });

function resolveVal(
  input: Exclude<graphql.InferValueFromArg<typeof filterArg>, undefined>,
  parseId: (id: string | null) => unknown
): any {
  if (input === null) {
    throw userInputError('id filter cannot be null');
  }
  const obj: any = {};
  for (const key of ['equals', 'gt', 'gte', 'lt', 'lte'] as const) {
    const val = input[key];
    if (val !== undefined) {
      const parsed = parseId(val);
      obj[key] = parsed;
    }
  }
  for (const key of ['in', 'notIn'] as const) {
    const val = input[key];
    if (val !== undefined) {
      if (val === null) {
        throw userInputError(`${key} id filter cannot be null`);
      }
      obj[key] = val.map(x => parseId(x));
    }
  }
  if (input.not !== undefined) {
    obj.not = resolveVal(input.not, parseId);
  }
  return obj;
}

export const idFieldType =
  (config: IdFieldConfig): FieldTypeFunc<BaseListTypeInfo> =>
  meta => {
    const parseVal =
      config.kind === 'autoincrement' && config.type === 'BigInt'
        ? idParsers.autoincrementBigInt
        : idParsers[config.kind];
    return fieldType({
      kind: 'scalar',
      mode: 'required',
      scalar:
        config.kind === 'autoincrement' ? (config.type === 'BigInt' ? 'BigInt' : 'Int') : 'String',
      nativeType: meta.provider === 'postgresql' && config.kind === 'uuid' ? 'Uuid' : undefined,
      default: { kind: config.kind },
    })({
      ...config,
      // The ID field is always filterable and orderable.
      isFilterable: true,
      isOrderable: true,
      input: {
        where: {
          arg: filterArg,
          resolve(val) {
            return resolveVal(val, parseVal);
          },
        },
        uniqueWhere: { arg: graphql.arg({ type: graphql.ID }), resolve: parseVal },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: graphql.nonNull(graphql.ID),
        resolve({ value }) {
          return value.toString();
        },
      }),
      views: '@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/id-field-view',
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
