import path from 'path';
import { validate } from 'uuid';
import { isCuid } from 'cuid';
import {
  fieldType,
  FieldTypeFunc,
  IdFieldConfig,
  orderDirectionEnum,
  ScalarDBField,
  graphql,
} from '../types';
import { packagePath } from '../package-path';
import { userInputError } from './core/graphql-errors';

const views = path.join(
  packagePath,
  '___internal-do-not-use-will-break-in-patch/admin-ui/id-field-view'
);

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
  kind: IdFieldConfig['kind']
): any {
  if (input === null) {
    throw userInputError('id filter cannot be null');
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
        throw userInputError(`${key} id filter cannot be null`);
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
      ...config,
      // The ID field is always filterable and orderable.
      isFilterable: true,
      isOrderable: true,
      input: {
        where: {
          arg: filterArg,
          resolve(val) {
            return resolveVal(val, config.kind);
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
