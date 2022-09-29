import { humanize } from '../../../lib/utils';
import {
  BaseListTypeInfo,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  orderDirectionEnum,
} from '../../../types';
import { graphql } from '../../..';
import {
  assertCreateIsNonNullAllowed,
  assertReadIsNonNullAllowed,
  getResolvedIsNullable,
} from '../../non-null-graphql';
import { filters } from '../../filters';
import { CalendarDayFieldMeta } from './views';

export type CalendarDayFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    isIndexed?: boolean | 'unique';
    validation?: {
      isRequired?: boolean;
    };
    defaultValue?: string;
    graphql?: {
      create?: { isNonNull?: boolean };
      read?: { isNonNull?: boolean };
    };
    db?: {
      isNullable?: boolean;
      map?: string;
    };
  };

export const calendarDay =
  <ListTypeInfo extends BaseListTypeInfo>({
    isIndexed,
    validation,
    defaultValue,
    ...config
  }: CalendarDayFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> =>
  meta => {
    if (typeof defaultValue === 'string') {
      try {
        graphql.CalendarDay.graphQLType.parseValue(defaultValue);
      } catch (err) {
        throw new Error(
          `The calendarDay field at ${meta.listKey}.${meta.fieldKey} specifies defaultValue: ${defaultValue} but values must be provided as a full-date ISO8601 string such as 1970-01-01`
        );
      }
    }

    const resolvedIsNullable = getResolvedIsNullable(validation, config.db);

    assertReadIsNonNullAllowed(meta, config, resolvedIsNullable);

    assertCreateIsNonNullAllowed(meta, config);

    const mode = resolvedIsNullable === false ? 'required' : 'optional';

    const fieldLabel = config.label ?? humanize(meta.fieldKey);

    const usesNativeDateType = meta.provider === 'postgresql' || meta.provider === 'mysql';

    const resolveInput = (value: null | undefined | string) => {
      if (meta.provider === 'sqlite' || value == null) {
        return value;
      }
      return dateStringToDateObjectInUTC(value);
    };

    const commonResolveFilter = mode === 'optional' ? filters.resolveCommon : <T>(x: T) => x;

    return fieldType({
      kind: 'scalar',
      mode,
      scalar: usesNativeDateType ? 'DateTime' : 'String',
      index: isIndexed === true ? 'index' : isIndexed || undefined,
      default:
        typeof defaultValue === 'string'
          ? {
              kind: 'literal',
              value: defaultValue,
            }
          : undefined,
      map: config.db?.map,
      nativeType: usesNativeDateType ? 'Date' : undefined,
    })({
      ...config,
      hooks: {
        ...config.hooks,
        async validateInput(args) {
          const value = args.resolvedData[meta.fieldKey];
          if ((validation?.isRequired || resolvedIsNullable === false) && value === null) {
            args.addValidationError(`${fieldLabel} is required`);
          }

          await config.hooks?.validateInput?.(args);
        },
      },
      input: {
        uniqueWhere:
          isIndexed === 'unique'
            ? {
                arg: graphql.arg({ type: graphql.CalendarDay }),
                resolve: usesNativeDateType ? dateStringToDateObjectInUTC : undefined,
              }
            : undefined,
        where: {
          arg: graphql.arg({
            type: mode === 'optional' ? CalendarDayNullableFilter : CalendarDayFilter,
          }),
          resolve: usesNativeDateType
            ? value => commonResolveFilter(transformFilterDateStringsToDateObjects(value))
            : commonResolveFilter,
        },
        create: {
          arg: graphql.arg({
            type: config.graphql?.create?.isNonNull
              ? graphql.nonNull(graphql.CalendarDay)
              : graphql.CalendarDay,
            defaultValue: config.graphql?.create?.isNonNull ? defaultValue : undefined,
          }),
          resolve(val: string | null | undefined) {
            if (val === undefined) {
              val = defaultValue ?? null;
            }
            return resolveInput(val);
          },
        },
        update: { arg: graphql.arg({ type: graphql.CalendarDay }), resolve: resolveInput },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: config.graphql?.read?.isNonNull
          ? graphql.nonNull(graphql.CalendarDay)
          : graphql.CalendarDay,
        resolve({ value }) {
          if (value instanceof Date) {
            return value.toISOString().slice(0, 10);
          }
          return value;
        },
      }),
      views: '@keystone-6/core/fields/types/calendarDay/views',
      getAdminMeta(): CalendarDayFieldMeta {
        return {
          defaultValue: defaultValue ?? null,
          isRequired: validation?.isRequired ?? false,
        };
      },
    });
  };

const dateStringToDateObjectInUTC = (value: string) => new Date(`${value}T00:00Z`);

type CalendarDayFilterType = graphql.InputObjectType<{
  equals: graphql.Arg<typeof graphql.CalendarDay>;
  in: graphql.Arg<graphql.ListType<graphql.NonNullType<typeof graphql.CalendarDay>>>;
  notIn: graphql.Arg<graphql.ListType<graphql.NonNullType<typeof graphql.CalendarDay>>>;
  lt: graphql.Arg<typeof graphql.CalendarDay>;
  lte: graphql.Arg<typeof graphql.CalendarDay>;
  gt: graphql.Arg<typeof graphql.CalendarDay>;
  gte: graphql.Arg<typeof graphql.CalendarDay>;
  not: graphql.Arg<CalendarDayFilterType>;
}>;

function transformFilterDateStringsToDateObjects(
  filter: graphql.InferValueFromInputType<CalendarDayFilterType>
): Parameters<typeof filters.resolveCommon>[0] {
  if (filter === null) {
    return filter;
  }
  return Object.fromEntries(
    Object.entries(filter).map(([key, value]) => {
      if (value == null) {
        return [key, value];
      }
      if (Array.isArray(value)) {
        return [key, value.map(dateStringToDateObjectInUTC)];
      }
      if (typeof value === 'object') {
        return [key, transformFilterDateStringsToDateObjects(value)];
      }
      return [key, dateStringToDateObjectInUTC(value)];
    })
  );
}

const filterFields = (nestedType: CalendarDayFilterType) => ({
  equals: graphql.arg({ type: graphql.CalendarDay }),
  in: graphql.arg({ type: graphql.list(graphql.nonNull(graphql.CalendarDay)) }),
  notIn: graphql.arg({ type: graphql.list(graphql.nonNull(graphql.CalendarDay)) }),
  lt: graphql.arg({ type: graphql.CalendarDay }),
  lte: graphql.arg({ type: graphql.CalendarDay }),
  gt: graphql.arg({ type: graphql.CalendarDay }),
  gte: graphql.arg({ type: graphql.CalendarDay }),
  not: graphql.arg({ type: nestedType }),
});

const CalendarDayNullableFilter: CalendarDayFilterType = graphql.inputObject({
  name: 'CalendarDayNullableFilter',
  fields: () => filterFields(CalendarDayNullableFilter),
});

const CalendarDayFilter: CalendarDayFilterType = graphql.inputObject({
  name: 'CalendarDayFilter',
  fields: () => filterFields(CalendarDayFilter),
});
