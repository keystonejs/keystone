import { validate } from 'uuid';
import { isCuid as _isCuid } from 'cuid';
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
  const parsed = typeof x === 'string' ? parseInt(x) : x;
  if (Number.isInteger(parsed)) return parsed;
}

function isBigInt(x: IDType) {
  if (x === null) return;
  try {
    return BigInt(x);
  } catch {}
}

function isCuid(x: IDType) {
  if (typeof x !== 'string') return;
  if (!_isCuid(x)) return;
  return x;
}

function isUuid(x: IDType) {
  if (typeof x !== 'string') return;
  if (!validate(x)) return;
  return x.toLowerCase();
}

function isString(x: IDType) {
  if (typeof x !== 'string') return;
  return x;
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

function resolveVal(
  input: Exclude<graphql.InferValueFromArg<typeof filterArg>, undefined>,
  parseId: (x: IDType) => unknown
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

export function idFieldType(
  config: Required<IdFieldConfig>,
  isSingleton: boolean
): FieldTypeFunc<BaseListTypeInfo> {
  const { kind, type } = config;
  const idType = type === 'String' ? kind : type;
  const parseIdFn = {
    Int: isInt,
    BigInt: isBigInt,
    cuid: isCuid,
    uuid: isUuid,
    string: isString,
  }[idType];

  function parse(value: IDType) {
    const result = parseIdFn(value);
    if (result === undefined) throw userInputError(`Expected ${idType} for ID filter`);
    return result;
  }

  const defaultValue = isSingleton ? undefined : { kind: kind === 'string' ? 'cuid' : kind };

  return meta => {
    return fieldType({
      kind: 'scalar',
      mode: 'required',
      scalar: type,
      nativeType: meta.provider === 'postgresql' && kind === 'uuid' ? 'Uuid' : undefined,

      // string types use cuids as their default value
      default: defaultValue,
    })({
      ...config,
      // The ID field is always filterable and orderable.
      isFilterable: true,
      isOrderable: true,
      input: {
        where: {
          arg: filterArg,
          resolve(val) {
            return resolveVal(val, parse);
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
