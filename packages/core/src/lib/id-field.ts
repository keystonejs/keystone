import { createId as createCuid2 } from '@paralleldrive/cuid2';
import {
  BaseListTypeInfo,
  fieldType,
  FieldTypeFunc,
  IdFieldConfig,
  orderDirectionEnum,
} from '../types';
import { graphql } from '..';
import { userInputError } from './core/graphql-errors';

type IDType = string | number | null;

function isInt(x: IDType) {
  if (x === null) return;
  if (x === '') return;
  const nom = typeof x === 'string' ? Number(x) : x;
  if (Number.isInteger(nom)) return nom;
}

function isBigInt(x: IDType) {
  if (x === null) return;
  if (x === '') return;
  try {
    return BigInt(x);
  } catch {}
}

function isString(x: IDType) {
  if (typeof x !== 'string') return;
  return x;
}

// TODO: remove, this should be on the user
function isUuid(x: IDType) {
  if (typeof x !== 'string') return;
  return x.toLowerCase();
}

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

function resolveInput(
  input: Exclude<graphql.InferValueFromArg<typeof filterArg>, undefined>,
  parseId: (x: IDType) => unknown
) {
  const where: any = {};
  if (input === null) return where;

  for (const key of ['equals', 'gt', 'gte', 'lt', 'lte'] as const) {
    const value = input[key];
    if (value === undefined) continue;
    where[key] = parseId(value);
  }

  for (const key of ['in', 'notIn'] as const) {
    const value = input[key];
    if (!Array.isArray(value)) continue;

    where[key] = value.map(x => parseId(x));
  }

  if (input.not !== undefined) {
    where.not = resolveInput(input.not, parseId);
  }

  return where;
}

export function idFieldType(
  config: Required<IdFieldConfig>,
  isSingleton: boolean
): FieldTypeFunc<BaseListTypeInfo> {
  const { kind, type } = config;
  const parseTypeFn = {
    Int: isInt,
    BigInt: isBigInt,
    String: isString,
    UUID: isUuid, // TODO: remove
  }[kind === 'uuid' ? 'UUID' : type];

  function parse(value: IDType) {
    const result = parseTypeFn(value);
    if (result === undefined) {
      throw userInputError(`Only a ${type.toLowerCase()} can be passed to id filters`);
    }
    return result;
  }

  const defaultValue = isSingleton || kind === 'string' ? undefined : { kind };

  return meta => {
    return fieldType({
      kind: 'scalar',
      mode: 'required',
      scalar: type,
      nativeType: meta.provider === 'postgresql' && kind === 'uuid' ? 'Uuid' : undefined,

      default: defaultValue,
    })({
      ...config,

      ...(defaultValue?.kind === 'cuid2'
        ? {
            hooks: {
              resolveInput({ operation }) {
                if (operation !== 'create') return undefined;
                return createCuid2();
              },
            },
          }
        : {}),

      // the ID field is always filterable and orderable
      isFilterable: true, // TODO: should it be?
      isOrderable: true, // TODO: should it be?

      input: {
        where: {
          arg: filterArg,
          resolve(val) {
            return resolveInput(val, parse);
          },
        },
        uniqueWhere: { arg: graphql.arg({ type: graphql.ID }), resolve: parse },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: graphql.nonNull(graphql.ID),
        resolve({ value }) {
          return value.toString();
        },
      }),
      views: '@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/id-field-view',
      getAdminMeta: () => ({ kind }),
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
}
