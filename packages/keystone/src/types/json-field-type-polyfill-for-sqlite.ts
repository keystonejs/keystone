import {
  JSONValue,
  ItemRootValue,
  KeystoneContext,
  graphql,
  UpdateFieldInputArg,
  ScalarDBField,
  CreateFieldInputArg,
  DatabaseProvider,
  FieldTypeWithoutDBField,
  fieldType,
} from '.';

function mapOutputFieldToSQLite(
  field: graphql.Field<{ value: JSONValue; item: ItemRootValue }, {}, any, 'value'>
) {
  const innerResolver = field.resolve || (({ value }) => value);
  return graphql.fields<{
    value: string | null;
    item: ItemRootValue;
  }>()({
    value: graphql.field({
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
        return innerResolver({ item: rootVal.item, value }, ...extra);
      },
    }),
  }).value;
}

function mapUpdateInputArgToSQLite<Arg extends graphql.Arg<graphql.InputType, any>>(
  arg: UpdateFieldInputArg<ScalarDBField<'Json', 'optional'>, Arg> | undefined
): UpdateFieldInputArg<ScalarDBField<'String', 'optional'>, Arg> | undefined {
  if (arg === undefined) {
    return undefined;
  }
  return {
    arg: arg.arg,
    async resolve(
      input: graphql.InferValueFromArg<Arg>,
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

function mapCreateInputArgToSQLite<Arg extends graphql.Arg<graphql.InputType, any>>(
  arg: CreateFieldInputArg<ScalarDBField<'Json', 'optional'>, Arg> | undefined
): CreateFieldInputArg<ScalarDBField<'String', 'optional'>, Arg> | undefined {
  if (arg === undefined) {
    return undefined;
  }
  return {
    arg: arg.arg,
    async resolve(
      input: graphql.InferValueFromArg<Arg>,
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
  CreateArg extends graphql.Arg<graphql.InputType, any>,
  UpdateArg extends graphql.Arg<graphql.InputType, any>
>(
  provider: DatabaseProvider,
  config: FieldTypeWithoutDBField<
    ScalarDBField<'Json', 'optional'>,
    CreateArg,
    UpdateArg,
    graphql.Arg<graphql.NullableInputType, false>,
    graphql.Arg<graphql.NullableInputType, false>
  > & {
    input?: {
      uniqueWhere?: undefined;
      orderBy?: undefined;
    };
  },
  dbFieldConfig?: {
    mode?: 'required' | 'optional';
    default?: ScalarDBField<'Json', 'optional'>['default'];
  }
) {
  if (provider === 'sqlite') {
    return fieldType({
      kind: 'scalar',
      mode: dbFieldConfig?.mode ?? 'optional',
      scalar: 'String',
      default: dbFieldConfig?.default,
    })({
      ...config,
      input: {
        create: mapCreateInputArgToSQLite(config.input?.create) as any,
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
  return fieldType({
    kind: 'scalar',
    mode: (dbFieldConfig?.mode ?? 'optional') as 'optional',
    scalar: 'Json',
    default: dbFieldConfig?.default,
  })(config);
}
