import { CacheHint } from 'apollo-server-types';
import {
  BaseItem,
  GraphQLTypesForModel,
  getGqlNames,
  NextFieldType,
  BaseModelTypeInfo,
  ModelGraphQLTypes,
  ListHooks,
  KeystoneConfig,
  FindManyArgs,
  CacheHintArgs,
  MaybePromise,
  FieldTypeFunc,
  BaseListTypeInfo,
} from '../../types';
import { graphql, ListConfig } from '../..';
import { FieldHooks } from '../../types/config/hooks';
import { FilterOrderArgs } from '../../types/config/fields';
import { SingletonConfig } from '../../types/config/lists';
import {
  ResolvedFieldAccessControl,
  ResolvedListAccessControl,
  parseListAccessControl,
  parseFieldAccessControl,
} from './access-control';
import { getNamesFromModel } from './utils';
import { ResolvedDBField, resolveRelationships } from './resolve-relationships';
import { outputTypeField } from './queries/output-field';
import { assertFieldsValid } from './field-assertions';

export type InitialisedField = Omit<NextFieldType, 'dbField' | 'access' | 'graphql'> & {
  dbField: ResolvedDBField;
  access: ResolvedFieldAccessControl;
  hooks: FieldHooks<BaseModelTypeInfo>;
  graphql: {
    isEnabled: {
      read: boolean;
      create: boolean;
      update: boolean;
      filter: boolean | ((args: FilterOrderArgs<BaseModelTypeInfo>) => MaybePromise<boolean>);
      orderBy: boolean | ((args: FilterOrderArgs<BaseModelTypeInfo>) => MaybePromise<boolean>);
    };
    cacheHint: CacheHint | undefined;
  };
};

type CommonInitialisedModel = {
  fields: Record<string, InitialisedField>;
  /** This will include the opposites to one-sided relationships */
  resolvedDbFields: Record<string, ResolvedDBField>;
  pluralGraphQLName: string;
  types: GraphQLTypesForModel;
  access: ResolvedListAccessControl;
  hooks: ListHooks<BaseModelTypeInfo>;
  adminUILabels: { label: string; singular: string; plural: string; path: string };
  cacheHint: ((args: CacheHintArgs) => CacheHint) | undefined;
  maxResults: number;
  modelKey: string;
  models: Record<string, InitialisedModel>;
  dbMap: string | undefined;
  graphql: {
    isEnabled: IsEnabled;
  };
};

export type InitialisedSingleton = CommonInitialisedModel & {
  kind: 'singleton';
  config: SingletonConfig;
};

export type InitialisedList = CommonInitialisedModel & {
  kind: 'list';
  config: ListConfig<BaseListTypeInfo, any>;
};

export type InitialisedModel = InitialisedList | InitialisedSingleton;

type IsEnabled = {
  type: boolean;
  query: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  filter: boolean | ((args: FilterOrderArgs<BaseModelTypeInfo>) => MaybePromise<boolean>);
  orderBy: boolean | ((args: FilterOrderArgs<BaseModelTypeInfo>) => MaybePromise<boolean>);
};

function throwIfNotAFilter(x: unknown, modelKey: string, fieldKey: string) {
  if (['boolean', 'undefined', 'function'].includes(typeof x)) return;

  throw new Error(
    `Configuration option '${modelKey}.${fieldKey}' must be either a boolean value or a function. Received '${x}'.`
  );
}

function getIsEnabled(modelsConfig: KeystoneConfig['models']) {
  const isEnabled: Record<string, IsEnabled> = {};

  for (const [modelKey, modelConfig] of Object.entries(modelsConfig)) {
    const omit = modelConfig.graphql?.omit;
    if (modelConfig.kind === 'list') {
      const { defaultIsFilterable, defaultIsOrderable } = modelConfig;
      if (!omit) {
        // We explicity check for boolean/function values here to ensure the dev hasn't made a mistake
        // when defining these values. We avoid duck-typing here as this is security related
        // and we want to make it hard to write incorrect code.
        throwIfNotAFilter(defaultIsFilterable, modelKey, 'defaultIsFilterable');
        throwIfNotAFilter(defaultIsOrderable, modelKey, 'defaultIsOrderable');
      }
    }
    if (omit === true) {
      isEnabled[modelKey] = {
        type: false,
        query: false,
        create: false,
        update: false,
        delete: false,
        filter: false,
        orderBy: false,
      };
    } else if (omit === undefined) {
      isEnabled[modelKey] = {
        type: true,
        query: true,
        create: true,
        update: true,
        delete: true,
        filter: defaultIsFilterable ?? true,
        orderBy: defaultIsOrderable ?? true,
      };
    } else {
      isEnabled[modelKey] = {
        type: true,
        query: !omit.includes('query'),
        create: !omit.includes('create'),
        update: !omit.includes('update'),
        delete: !omit.includes('delete'),
        filter: defaultIsFilterable ?? true,
        orderBy: defaultIsOrderable ?? true,
      };
    }
  }

  return isEnabled;
}

type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

type PartiallyInitialisedModel = DistributiveOmit<InitialisedModel, 'models' | 'resolvedDbFields'>;

function getModelsWithInitialisedFields(
  { storage: configStorage, models: modelsConfig, db: { provider } }: KeystoneConfig,
  modelGraphqlTypes: Record<string, ModelGraphQLTypes>,
  intermediateModels: Record<string, { graphql: { isEnabled: IsEnabled } }>
) {
  const result: Record<string, PartiallyInitialisedModel> = {};

  for (const [modelKey, model] of Object.entries(modelsConfig)) {
    const intermediateModel = intermediateModels[modelKey];
    const resultFields: Record<string, InitialisedField> = {};

    for (const [fieldKey, fieldFunc] of Object.entries(model.fields)) {
      if (typeof fieldFunc !== 'function') {
        throw new Error(`The field at ${modelKey}.${fieldKey} does not provide a function`);
      }

      const f = (fieldFunc as FieldTypeFunc<BaseModelTypeInfo>)({
        fieldKey,
        modelKey,
        models: modelGraphqlTypes,
        provider,
        getStorage: storage => configStorage?.[storage],
      });

      // We explicity check for boolean values here to ensure the dev hasn't made a mistake
      // when defining these values. We avoid duck-typing here as this is security related
      // and we want to make it hard to write incorrect code.
      throwIfNotAFilter(f.isFilterable, modelKey, 'isFilterable');
      throwIfNotAFilter(f.isOrderable, modelKey, 'isOrderable');

      const omit = f.graphql?.omit;
      const read = omit !== true && !omit?.includes('read');
      const _isEnabled = {
        read,
        update: omit !== true && !omit?.includes('update'),
        create: omit !== true && !omit?.includes('create'),
        // Filter and orderBy can be defaulted at the list level, otherwise they
        // default to `false` if no value was set at the list level.
        filter: read && (f.isFilterable ?? intermediateModel.graphql.isEnabled.filter),
        orderBy: read && (f.isOrderable ?? intermediateModel.graphql.isEnabled.orderBy),
      };

      resultFields[fieldKey] = {
        ...f,
        dbField: f.dbField as ResolvedDBField,
        access: parseFieldAccessControl(f.access),
        hooks: f.hooks ?? {},
        graphql: {
          cacheHint: f.graphql?.cacheHint,
          isEnabled: _isEnabled,
        },
        input: { ...f.input },
      };
    }

    result[modelKey] = {
      fields: resultFields,
      ...intermediateModel,
      ...getNamesFromModel(modelKey, model),
      access: parseListAccessControl(model.access),
      dbMap: model.db?.map,
      types: modelGraphqlTypes[modelKey].types,

      hooks: model.hooks || {},

      /** These properties aren't related to any of the above actions but need to be here */
      maxResults: model.graphql?.queryLimits?.maxResults ?? Infinity,
      modelKey,
      cacheHint: (() => {
        const cacheHint = model.graphql?.cacheHint;
        if (cacheHint === undefined) {
          return undefined;
        }
        return typeof cacheHint === 'function' ? cacheHint : () => cacheHint;
      })(),
    };
  }

  return result;
}

function getModelGraphqlTypes(
  modelsConfig: KeystoneConfig['models'],
  models: Record<string, InitialisedModel>,
  intermediateModels: Record<string, { graphql: { isEnabled: IsEnabled } }>
): Record<string, ModelGraphQLTypes> {
  const graphQLTypes: Record<string, ModelGraphQLTypes> = {};

  for (const [modelKey, modelConfig] of Object.entries(modelsConfig)) {
    const names = getGqlNames({
      modelKey,
      pluralGraphQLName: getNamesFromModel(modelKey, modelConfig).pluralGraphQLName,
    });

    const output = graphql.object<BaseItem>()({
      name: names.outputTypeName,
      fields: () => {
        const { fields } = models[modelKey];
        return {
          ...Object.fromEntries(
            Object.entries(fields).flatMap(([fieldPath, field]) => {
              if (
                !field.output ||
                !field.graphql.isEnabled.read ||
                (field.dbField.kind === 'relation' &&
                  !intermediateModels[field.dbField.list].graphql.isEnabled.query)
              ) {
                return [];
              }
              return [
                [fieldPath, field.output] as const,
                ...Object.entries(field.extraOutputFields || {}),
              ].map(([outputTypeFieldName, outputField]) => {
                return [
                  outputTypeFieldName,
                  outputTypeField(
                    outputField,
                    field.dbField,
                    field.graphql?.cacheHint,
                    field.access.read,
                    modelKey,
                    fieldPath,
                    models
                  ),
                ];
              });
            })
          ),
        };
      },
    });

    const uniqueWhere = graphql.inputObject({
      name: names.whereUniqueInputName,
      fields: () => {
        const { fields } = models[modelKey];
        return Object.fromEntries(
          Object.entries(fields).flatMap(([key, field]) => {
            if (
              !field.input?.uniqueWhere?.arg ||
              !field.graphql.isEnabled.read ||
              !field.graphql.isEnabled.filter
            ) {
              return [];
            }
            return [[key, field.input.uniqueWhere.arg]] as const;
          })
        );
      },
    });

    const where: GraphQLTypesForModel['where'] = graphql.inputObject({
      name: names.whereInputName,
      fields: () => {
        const { fields } = models[modelKey];
        return Object.assign(
          {
            AND: graphql.arg({ type: graphql.list(graphql.nonNull(where)) }),
            OR: graphql.arg({ type: graphql.list(graphql.nonNull(where)) }),
            NOT: graphql.arg({ type: graphql.list(graphql.nonNull(where)) }),
          },
          ...Object.entries(fields).map(
            ([fieldKey, field]) =>
              field.input?.where?.arg &&
              field.graphql.isEnabled.read &&
              field.graphql.isEnabled.filter && { [fieldKey]: field.input?.where?.arg }
          )
        );
      },
    });

    const create = graphql.inputObject({
      name: names.createInputName,
      fields: () => {
        const { fields } = models[modelKey];
        return Object.fromEntries(
          Object.entries(fields).flatMap(([key, field]) => {
            if (!field.input?.create?.arg || !field.graphql.isEnabled.create) return [];
            return [[key, field.input.create.arg]] as const;
          })
        );
      },
    });

    const update = graphql.inputObject({
      name: names.updateInputName,
      fields: () => {
        const { fields } = models[modelKey];
        return Object.fromEntries(
          Object.entries(fields).flatMap(([key, field]) => {
            if (!field.input?.update?.arg || !field.graphql.isEnabled.update) return [];
            return [[key, field.input.update.arg]] as const;
          })
        );
      },
    });

    const orderBy = graphql.inputObject({
      name: names.listOrderName,
      fields: () => {
        const { fields } = models[modelKey];
        return Object.fromEntries(
          Object.entries(fields).flatMap(([key, field]) => {
            if (
              !field.input?.orderBy?.arg ||
              !field.graphql.isEnabled.read ||
              !field.graphql.isEnabled.orderBy
            ) {
              return [];
            }
            return [[key, field.input.orderBy.arg]] as const;
          })
        );
      },
    });

    const findManyArgs: FindManyArgs = {
      where: graphql.arg({ type: graphql.nonNull(where), defaultValue: {} }),
      orderBy: graphql.arg({
        type: graphql.nonNull(graphql.list(graphql.nonNull(orderBy))),
        defaultValue: [],
      }),
      // TODO: non-nullable when max results is specified in the model with the default of max results
      take: graphql.arg({ type: graphql.Int }),
      skip: graphql.arg({ type: graphql.nonNull(graphql.Int), defaultValue: 0 }),
    };

    const isEnabled = intermediateModels[modelKey].graphql.isEnabled;
    let relateToManyForCreate, relateToManyForUpdate, relateToOneForCreate, relateToOneForUpdate;
    if (isEnabled.type) {
      relateToManyForCreate = graphql.inputObject({
        name: names.relateToManyForCreateInputName,
        fields: () => {
          return {
            // Create via a relationship is only supported if this model allows create
            ...(isEnabled.create && {
              create: graphql.arg({ type: graphql.list(graphql.nonNull(create)) }),
            }),
            connect: graphql.arg({ type: graphql.list(graphql.nonNull(uniqueWhere)) }),
          };
        },
      });

      relateToManyForUpdate = graphql.inputObject({
        name: names.relateToManyForUpdateInputName,
        fields: () => {
          return {
            // The order of these fields reflects the order in which they are applied
            // in the mutation.
            disconnect: graphql.arg({ type: graphql.list(graphql.nonNull(uniqueWhere)) }),
            set: graphql.arg({ type: graphql.list(graphql.nonNull(uniqueWhere)) }),
            // Create via a relationship is only supported if this model allows create
            ...(isEnabled.create && {
              create: graphql.arg({ type: graphql.list(graphql.nonNull(create)) }),
            }),
            connect: graphql.arg({ type: graphql.list(graphql.nonNull(uniqueWhere)) }),
          };
        },
      });

      relateToOneForCreate = graphql.inputObject({
        name: names.relateToOneForCreateInputName,
        fields: () => {
          return {
            // Create via a relationship is only supported if this model allows create
            ...(isEnabled.create && { create: graphql.arg({ type: create }) }),
            connect: graphql.arg({ type: uniqueWhere }),
          };
        },
      });

      relateToOneForUpdate = graphql.inputObject({
        name: names.relateToOneForUpdateInputName,
        fields: () => {
          return {
            // Create via a relationship is only supported if this model allows create
            ...(isEnabled.create && { create: graphql.arg({ type: create }) }),
            connect: graphql.arg({ type: uniqueWhere }),
            disconnect: graphql.arg({ type: graphql.Boolean }),
          };
        },
      });
    }

    graphQLTypes[modelKey] = {
      types: {
        output,
        uniqueWhere,
        where,
        create,
        orderBy,
        update,
        findManyArgs,
        relateTo: {
          many: {
            where: graphql.inputObject({
              name: `${modelKey}ManyRelationFilter`,
              fields: {
                every: graphql.arg({ type: where }),
                some: graphql.arg({ type: where }),
                none: graphql.arg({ type: where }),
              },
            }),
            create: relateToManyForCreate,
            update: relateToManyForUpdate,
          },
          one: { create: relateToOneForCreate, update: relateToOneForUpdate },
        },
      },
    };
  }

  return graphQLTypes;
}

/**
 * 1. Get the `isEnabled` config object from the modelConfig - the returned object will be modified later
 * 2. Instantiate `models` object - it is done here as the object will be added to the modelGraphqlTypes
 * 3. Get graphqlTypes
 * 4. Initialise fields - field functions are called
 * 5. Handle relationships - ensure correct linking between two sides of all relationships (including one-sided relationships)
 * 6.
 */
export function initialiseModels(config: KeystoneConfig): Record<string, InitialisedModel> {
  const modelsConfig = config.models;

  let intermediateModels;
  intermediateModels = Object.fromEntries(
    Object.entries(getIsEnabled(modelsConfig)).map(([key, isEnabled]) => [
      key,
      { graphql: { isEnabled } },
    ])
  );

  /**
   * Models are instantiated here so that it can be passed into the `getModelGraphqlTypes` function
   * This function attaches this model object to the various graphql functions
   *
   * The object will be populated at the end of this function, and the reference will be maintained
   */
  const modelsRef: Record<string, InitialisedModel> = {};

  {
    const modelGraphqlTypes = getModelGraphqlTypes(modelsConfig, modelsRef, intermediateModels);
    intermediateModels = getModelsWithInitialisedFields(
      config,
      modelGraphqlTypes,
      intermediateModels
    );
  }

  {
    const resolvedDBFieldsForModel = resolveRelationships(intermediateModels);
    intermediateModels = Object.fromEntries(
      Object.entries(intermediateModels).map(([modelKey, model]) => [
        modelKey,
        { ...model, resolvedDbFields: resolvedDBFieldsForModel[modelKey] },
      ])
    );
  }

  intermediateModels = Object.fromEntries(
    Object.entries(intermediateModels).map(([modelKey, model]) => {
      const fields: Record<string, InitialisedField> = {};

      for (const [fieldKey, field] of Object.entries(model.fields)) {
        fields[fieldKey] = {
          ...field,
          dbField: model.resolvedDbFields[fieldKey],
        };
      }

      return [modelKey, { ...model, fields }];
    })
  );

  for (const model of Object.values(intermediateModels)) {
    let hasAnEnabledCreateField = false;
    let hasAnEnabledUpdateField = false;

    for (const field of Object.values(model.fields)) {
      if (field.input?.create?.arg && field.graphql.isEnabled.create) {
        hasAnEnabledCreateField = true;
      }
      if (field.input?.update && field.graphql.isEnabled.update) {
        hasAnEnabledUpdateField = true;
      }
    }
    // You can't have a graphQL type with no fields, so
    // if they're all disabled, we have to disable the whole operation.
    if (!hasAnEnabledCreateField) {
      model.graphql.isEnabled.create = false;
    }
    if (!hasAnEnabledUpdateField) {
      model.graphql.isEnabled.update = false;
    }
  }

  /*
    Error checking
    */
  for (const [modelKey, { fields }] of Object.entries(intermediateModels)) {
    assertFieldsValid({ modelKey, fields });
  }

  for (const [modelKey, intermediateModel] of Object.entries(intermediateModels)) {
    modelsRef[modelKey] = {
      ...intermediateModel,
      models: modelsRef,
    };
  }

  return modelsRef;
}
