import { IdType } from '@keystone-next/keystone/src/lib/core/utils';
import {
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
  field: types.Field<{ id: IdType; value: JSONValue; item: ItemRootValue }, {}, any, 'value'>
) {
  const innerResolver = field.resolve || (({ value }) => value);
  return types.fields<{
    id: IdType;
    value: string | null;
    item: ItemRootValue;
  }>()({
    value: types.field({
      type: field.type,
      args: field.args,
      deprecationReason: field.deprecationReason,
      description: field.description,
      extensions: field.extensions as any,
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
    }),
  }).value;
}

function mapUpdateInputArgToSQLite<Arg extends types.Arg<types.InputType, any>>(
  arg: UpdateFieldInputArg<ScalarDBField<'Json', 'optional'>, Arg> | undefined
): UpdateFieldInputArg<ScalarDBField<'String', 'optional'>, Arg> | undefined {
  if (arg === undefined) {
    return undefined;
  }
  return {
    arg: arg.arg,
    async resolve(
      input: types.InferValueFromArg<Arg>,
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

function mapCreateInputArgToSQLite<Arg extends types.Arg<types.InputType, any>>(
  arg: CreateFieldInputArg<ScalarDBField<'Json', 'optional'>, Arg> | undefined
): CreateFieldInputArg<ScalarDBField<'String', 'optional'>, Arg> | undefined {
  if (arg === undefined) {
    return undefined;
  }
  return {
    arg: arg.arg,
    async resolve(
      input: types.InferValueFromArg<Arg>,
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
  CreateArg extends types.Arg<types.InputType, any>,
  UpdateArg extends types.Arg<types.InputType, any>
>(
  provider: DatabaseProvider,
  config: FieldTypeWithoutDBField<
    ScalarDBField<'Json', 'optional'>,
    CreateArg,
    UpdateArg,
    types.Arg<types.NullableInputType, undefined>,
    types.Arg<types.NullableInputType, undefined>
  > & {
    input?: {
      uniqueWhere?: undefined;
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
