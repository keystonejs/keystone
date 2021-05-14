import { IdType } from '@keystone-next/keystone/src/lib/core/utils';
import {
  tsgql,
  JSONValue,
  ItemRootValue,
  KeystoneContext,
  types,
  UpdateFieldInputArg,
  ScalarDBField,
  CreateFieldInputArg,
  DatabaseProvider,
  FieldTypeWithoutDBField,
  fieldType,
} from '.';

function mapOutputFieldToSQLite(
  field: tsgql.OutputField<
    { id: IdType; value: JSONValue; item: ItemRootValue },
    any,
    any,
    'value',
    KeystoneContext
  >
) {
  const innerResolver = field.resolve || (({ value }) => value);
  return types.field<
    { value: string | null; item: ItemRootValue; id: IdType },
    any,
    any,
    'value',
    KeystoneContext
  >({
    type: field.type,
    args: field.args,
    deprecationReason: field.deprecationReason,
    description: field.description,
    extensions: field.extensions,
    resolve(rootVal, ...extra) {
      if (rootVal.value === null) {
        return innerResolver(rootVal, ...extra);
      }
      let value: JSONValue = null;
      try {
        value = JSON.parse(rootVal.value);
      } catch (err) {}
      return innerResolver({ id: rootVal.id, item: rootVal.item, value }, ...extra);
    },
  });
}

function mapUpdateInputArgToSQLite<Arg extends tsgql.Arg<tsgql.InputType, any>>(
  arg: UpdateFieldInputArg<ScalarDBField<'Json', 'optional'>, Arg> | undefined
): UpdateFieldInputArg<ScalarDBField<'String', 'optional'>, Arg> | undefined {
  if (arg === undefined) {
    return undefined;
  }
  return {
    arg: arg.arg,
    async resolve(
      input: tsgql.InferValueFromArg<Arg>,
      context: KeystoneContext,
      relationshipInputResolver: any
    ) {
      const resolvedInput =
        arg.resolve === undefined
          ? input
          : await arg.resolve(input, context, relationshipInputResolver);
      if (resolvedInput === undefined || resolvedInput === null) {
        return resolvedInput;
      }
      return JSON.stringify(resolvedInput);
    },
  } as any;
}

function mapCreateInputArgToSQLite<Arg extends tsgql.Arg<tsgql.InputType, any>>(
  arg: CreateFieldInputArg<ScalarDBField<'Json', 'optional'>, Arg> | undefined
): CreateFieldInputArg<ScalarDBField<'String', 'optional'>, Arg> | undefined {
  if (arg === undefined) {
    return undefined;
  }
  return {
    arg: arg.arg,
    async resolve(
      input: tsgql.InferValueFromArg<Arg>,
      context: KeystoneContext,
      relationshipInputResolver: any
    ) {
      const resolvedInput =
        arg.resolve === undefined
          ? input
          : await arg.resolve(input, context, relationshipInputResolver);
      if (resolvedInput === undefined || resolvedInput === null) {
        return resolvedInput;
      }
      return JSON.stringify(resolvedInput);
    },
  } as any;
}

export function jsonFieldTypePolyfilledForSQLite<
  CreateArg extends tsgql.Arg<tsgql.InputType, any>,
  UpdateArg extends tsgql.Arg<tsgql.InputType, any>,
  FilterArg extends tsgql.Arg<tsgql.InputType, any>,
  UniqueFilterArg extends tsgql.Arg<tsgql.InputType, any>
>(
  provider: DatabaseProvider,
  config: FieldTypeWithoutDBField<
    ScalarDBField<'Json', 'optional'>,
    CreateArg,
    UpdateArg,
    FilterArg,
    UniqueFilterArg
  > & {
    input?: {
      uniqueWhere?: undefined;
      where?: undefined;
      orderBy?: undefined;
    };
  }
) {
  if (provider === 'sqlite') {
    return fieldType({ kind: 'scalar', mode: 'optional', scalar: 'String' })({
      ...config,
      input: {
        create: mapCreateInputArgToSQLite(config.input?.create),
        update: mapUpdateInputArgToSQLite(config.input?.update),
      },
      output: mapOutputFieldToSQLite(config.output),
      extraOutputFields: Object.fromEntries(
        Object.entries(config.extraOutputFields || {}).map(([key, field]) => [
          key,
          mapOutputFieldToSQLite(field),
        ])
      ),
    });
  }
  return fieldType({ kind: 'scalar', mode: 'optional', scalar: 'Json' })(config);
}
