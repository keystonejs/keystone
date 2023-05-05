import { CacheHint } from '@apollo/cache-control-types';
import { GraphQLString, isInputObjectType } from 'graphql';
import { getGqlNames, QueryMode } from '../../types';
import type {
  BaseItem,
  GraphQLTypesForList,
  NextFieldType,
  BaseListTypeInfo,
  ListGraphQLTypes,
  KeystoneConfig,
  FindManyArgs,
  ListHooks,
  CacheHintArgs,
  MaybePromise,
} from '../../types';
import { graphql } from '../..';
import { FieldHooks, ResolvedListHooks, ResolvedFieldHooks } from '../../types/config/hooks';
import { FilterOrderArgs } from '../../types/config/fields';
import {
  ResolvedFieldAccessControl,
  ResolvedListAccessControl,
  parseListAccessControl,
  parseFieldAccessControl,
} from './access-control';
import { areArraysEqual, getNamesFromList } from './utils';
import { ResolvedDBField, resolveRelationships } from './resolve-relationships';
import { outputTypeField } from './queries/output-field';
import { assertFieldsValid } from './field-assertions';

export type InitialisedField = Omit<NextFieldType, 'dbField' | 'access' | 'graphql'> & {
  dbField: ResolvedDBField;
  access: ResolvedFieldAccessControl;
  hooks: ResolvedFieldHooks<BaseListTypeInfo>;
  graphql: {
    isEnabled: {
      read: boolean;
      create: boolean;
      update: boolean;
      filter: boolean | ((args: FilterOrderArgs<BaseListTypeInfo>) => MaybePromise<boolean>);
      orderBy: boolean | ((args: FilterOrderArgs<BaseListTypeInfo>) => MaybePromise<boolean>);
    };
    isNonNull: {
      read: boolean;
      create: boolean;
      update: boolean;
    };
    cacheHint: CacheHint | undefined;
  };
};

export type FieldGroupConfig = {
  fields: string[];
  label: string;
  description: string | null;
};

export type InitialisedList = {
  access: ResolvedListAccessControl;

  fields: Record<string, InitialisedField>;
  groups: FieldGroupConfig[];

  hooks: ResolvedListHooks<BaseListTypeInfo>;

  /** This will include the opposites to one-sided relationships */
  resolvedDbFields: Record<string, ResolvedDBField>;
  lists: Record<string, InitialisedList>;

  cacheHint: ((args: CacheHintArgs) => CacheHint) | undefined;
  listKey: string;

  graphql: {
    types: GraphQLTypesForList;
    names: ReturnType<typeof getGqlNames>;
    namePlural: string; // TODO: remove
    isEnabled: IsEnabled;
  };

  prisma: {
    listKey: string;
    mapping: string | undefined;
    extendPrismaSchema: ((schema: string) => string) | undefined;
  };

  ui: {
    labels: { label: string; singular: string; plural: string; path: string };
    labelField: string;
    searchFields: Set<string>;
    searchableFields: Map<string, 'default' | 'insensitive' | null>;
  };

  isSingleton: boolean;
};

type IsEnabled = {
  type: boolean;
  query: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  filter: boolean | ((args: FilterOrderArgs<BaseListTypeInfo>) => MaybePromise<boolean>);
  orderBy: boolean | ((args: FilterOrderArgs<BaseListTypeInfo>) => MaybePromise<boolean>);
};

function throwIfNotAFilter(x: unknown, listKey: string, fieldKey: string) {
  if (['boolean', 'undefined', 'function'].includes(typeof x)) return;

  throw new Error(
    `Configuration option '${listKey}.${fieldKey}' must be either a boolean value or a function. Received '${x}'.`
  );
}

function getIsEnabled(listsConfig: KeystoneConfig['lists']) {
  const isEnabled: Record<string, IsEnabled> = {};

  for (const [listKey, listConfig] of Object.entries(listsConfig)) {
    const omit = listConfig.graphql?.omit;
    const { defaultIsFilterable, defaultIsOrderable } = listConfig;
    if (!omit) {
      // We explicity check for boolean/function values here to ensure the dev hasn't made a mistake
      // when defining these values. We avoid duck-typing here as this is security related
      // and we want to make it hard to write incorrect code.
      throwIfNotAFilter(defaultIsFilterable, listKey, 'defaultIsFilterable');
      throwIfNotAFilter(defaultIsOrderable, listKey, 'defaultIsOrderable');
    }
    if (omit === true) {
      isEnabled[listKey] = {
        type: false,
        query: false,
        create: false,
        update: false,
        delete: false,
        filter: false,
        orderBy: false,
      };
    } else {
      isEnabled[listKey] = {
        type: true,
        query: !omit?.query,
        create: !omit?.create,
        update: !omit?.update,
        delete: !omit?.delete,
        filter: defaultIsFilterable ?? true,
        orderBy: defaultIsOrderable ?? true,
      };
    }
  }

  return isEnabled;
}

function defaultListHooksResolveInput({ resolvedData }: { resolvedData: any }) {
  return resolvedData;
}

function parseListHooksResolveInput(f: ListHooks<BaseListTypeInfo>['resolveInput']) {
  if (typeof f === 'function') {
    return {
      create: f,
      update: f,
    };
  }

  const { create, update } = f ?? {};
  return {
    create: create ?? defaultListHooksResolveInput,
    update: update ?? defaultListHooksResolveInput,
  };
}

function parseListHooks(hooks: ListHooks<BaseListTypeInfo>): ResolvedListHooks<BaseListTypeInfo> {
  return {
    ...hooks,
    resolveInput: parseListHooksResolveInput(hooks.resolveInput),
  };
}

function defaultFieldHooksResolveInput({
  resolvedData,
  fieldKey,
}: {
  resolvedData: any;
  fieldKey: string;
}) {
  return resolvedData[fieldKey];
}

function parseFieldHooksResolveInput(f: FieldHooks<BaseListTypeInfo>['resolveInput']) {
  return f ?? defaultFieldHooksResolveInput;
  // TODO: one day
  //    if (typeof f === 'function') {
  //      return {
  //        create: f,
  //        update: f,
  //      };
  //    }
  //
  //    const { create, update } = f ?? {};
  //    return {
  //      create: create ?? defaultFieldHooksResolveInput,
  //      update: update ?? defaultFieldHooksResolveInput,
  //    };
}

function parseFieldHooks(
  hooks: FieldHooks<BaseListTypeInfo>
): ResolvedFieldHooks<BaseListTypeInfo> {
  return {
    ...hooks,
    resolveInput: parseFieldHooksResolveInput(hooks.resolveInput),
  };
}

type PartiallyInitialisedList = Omit<InitialisedList, 'lists' | 'resolvedDbFields'>;

function getListsWithInitialisedFields(
  { storage: configStorage, lists: listsConfig, db: { provider } }: KeystoneConfig,
  listGraphqlTypes: Record<string, ListGraphQLTypes>,
  intermediateLists: Record<string, { graphql: { isEnabled: IsEnabled } }>
) {
  const result: Record<string, PartiallyInitialisedList> = {};

  for (const [listKey, list] of Object.entries(listsConfig)) {
    const intermediateList = intermediateLists[listKey];
    const resultFields: Record<string, InitialisedField> = {};
    const groups: FieldGroupConfig[] = [];
    const fieldKeys = Object.keys(list.fields);

    for (const [idx, [fieldKey, fieldFunc]] of Object.entries(list.fields).entries()) {
      if (fieldKey.startsWith('__group')) {
        const group = fieldFunc as any;
        if (
          typeof group === 'object' &&
          group !== null &&
          typeof group.label === 'string' &&
          (group.description === null || typeof group.description === 'string') &&
          Array.isArray(group.fields) &&
          areArraysEqual(group.fields, fieldKeys.slice(idx + 1, idx + 1 + group.fields.length))
        ) {
          groups.push(group);
          continue;
        }
        throw new Error(`unexpected value for a group at ${listKey}.${fieldKey}`);
      }

      if (typeof fieldFunc !== 'function') {
        throw new Error(`The field at ${listKey}.${fieldKey} does not provide a function`);
      }

      const f = fieldFunc({
        fieldKey,
        listKey,
        lists: listGraphqlTypes,
        provider,
        getStorage: storage => configStorage?.[storage],
      });

      // We explicity check for boolean values here to ensure the dev hasn't made a mistake
      // when defining these values. We avoid duck-typing here as this is security related
      // and we want to make it hard to write incorrect code.
      throwIfNotAFilter(f.isFilterable, listKey, 'isFilterable');
      throwIfNotAFilter(f.isOrderable, listKey, 'isOrderable');

      const omit = f.graphql?.omit;
      const read = omit !== true && !omit?.read;
      const _isEnabled = {
        read,
        create: omit !== true && !omit?.create,
        update: omit !== true && !omit?.update,
        // Filter and orderBy can be defaulted at the list level, otherwise they
        // default to `false` if no value was set at the list level.
        filter: read && (f.isFilterable ?? intermediateList.graphql.isEnabled.filter),
        orderBy: read && (f.isOrderable ?? intermediateList.graphql.isEnabled.orderBy),
      };

      resultFields[fieldKey] = {
        ...f,
        dbField: f.dbField as ResolvedDBField,
        access: parseFieldAccessControl(f.access),
        hooks: parseFieldHooks(f.hooks ?? {}),
        graphql: {
          cacheHint: f.graphql?.cacheHint,
          isEnabled: _isEnabled,
          isNonNull: {
            read: f.graphql?.isNonNull?.read ?? false,
            create: f.graphql?.isNonNull?.create ?? false,
            update: f.graphql?.isNonNull?.update ?? false,
          },
        },
        input: { ...f.input }, // copy
      };
    }

    // Default the labelField to `name`, `label`, or `title` if they exist; otherwise fall back to `id`
    const labelField =
      list.ui?.labelField ??
      (list.fields.label
        ? 'label'
        : list.fields.name
        ? 'name'
        : list.fields.title
        ? 'title'
        : 'id');

    const searchFields = new Set(list.ui?.searchFields ?? []);
    if (searchFields.has('id')) {
      throw new Error(`${listKey}.ui.searchFields cannot include 'id'`);
    }

    const names = getNamesFromList(listKey, list);

    result[listKey] = {
      access: parseListAccessControl(list.access),

      fields: resultFields,
      groups,

      graphql: {
        types: listGraphqlTypes[listKey].types,
        names: names.graphql.names,
        namePlural: names.graphql.namePlural, // TODO: remove
        ...intermediateList.graphql,
      },

      prisma: {
        listKey: listKey[0].toLowerCase() + listKey.slice(1),
        mapping: list.db?.map,
        extendPrismaSchema: list.db?.extendPrismaSchema,
      },

      ui: {
        labels: names.ui.labels,
        labelField,
        searchFields,
        searchableFields: new Map<string, 'default' | 'insensitive' | null>(),
      },
      hooks: parseListHooks(list.hooks ?? {}),
      listKey,
      cacheHint: (() => {
        const cacheHint = list.graphql?.cacheHint;
        if (cacheHint === undefined) {
          return undefined;
        }
        return typeof cacheHint === 'function' ? cacheHint : () => cacheHint;
      })(),
      isSingleton: list.isSingleton ?? false,
    };
  }

  return result;
}

function introspectGraphQLTypes(lists: Record<string, InitialisedList>) {
  for (const [listKey, list] of Object.entries(lists)) {
    const {
      ui: { searchFields, searchableFields },
    } = list;

    if (searchFields.has('id')) {
      throw new Error(
        `The ui.searchFields option on the ${listKey} list includes 'id'. Lists can always be searched by an item's id so it must not be specified as a search field`
      );
    }

    const whereInputFields = list.graphql.types.where.graphQLType.getFields();
    for (const fieldKey of Object.keys(list.fields)) {
      const filterType = whereInputFields[fieldKey]?.type;
      const fieldFilterFields = isInputObjectType(filterType) ? filterType.getFields() : undefined;
      if (fieldFilterFields?.contains?.type === GraphQLString) {
        searchableFields.set(
          fieldKey,
          fieldFilterFields?.mode?.type === QueryMode.graphQLType ? 'insensitive' : 'default'
        );
      }
    }

    if (searchFields.size === 0) {
      if (searchableFields.has(list.ui.labelField)) {
        searchFields.add(list.ui.labelField);
      }
    }
  }
}

function stripDefaultValue(thing: graphql.Arg<graphql.InputType, boolean>) {
  return graphql.arg({
    ...thing,
    defaultValue: undefined,
  });
}

function graphqlArgForInputField(field: InitialisedField, operation: 'create' | 'update') {
  const input = field.input?.[operation];
  if (!input?.arg || !field.graphql.isEnabled[operation]) return;
  if (!field.graphql.isNonNull[operation]) return stripDefaultValue(input.arg);
  if (input.arg.type.kind === 'non-null') return;

  return graphql.arg({
    ...input.arg,
    type: graphql.nonNull(input.arg.type),
  });
}

function graphqlForOutputField(field: InitialisedField) {
  const output = field.output;
  if (!output || !field.graphql.isEnabled.read) return output;
  if (!field.graphql.isNonNull.read) return output;
  if (output.type.kind === 'non-null') return output;

  return graphql.field({
    ...(output as any),
    type: graphql.nonNull(output.type),
  });
}

function getListGraphqlTypes(
  listsConfig: KeystoneConfig['lists'],
  lists: Record<string, InitialisedList>,
  intermediateLists: Record<string, { graphql: { isEnabled: IsEnabled } }>
): Record<string, ListGraphQLTypes> {
  const graphQLTypes: Record<string, ListGraphQLTypes> = {};

  for (const [listKey, listConfig] of Object.entries(listsConfig)) {
    const {
      graphql: { names },
    } = getNamesFromList(listKey, listConfig);

    const output = graphql.object<BaseItem>()({
      name: names.outputTypeName,
      fields: () => {
        const { fields } = lists[listKey];
        return {
          ...Object.fromEntries(
            Object.entries(fields).flatMap(([fieldPath, field]) => {
              if (
                !field.output ||
                !field.graphql.isEnabled.read ||
                (field.dbField.kind === 'relation' &&
                  !intermediateLists[field.dbField.list].graphql.isEnabled.query)
              ) {
                return [];
              }

              const outputFieldRoot = graphqlForOutputField(field);
              return [
                [fieldPath, outputFieldRoot] as const,
                ...Object.entries(field.extraOutputFields || {}),
              ].map(([outputTypeFieldName, outputField]) => {
                return [
                  outputTypeFieldName,
                  outputTypeField(
                    outputField,
                    field.dbField,
                    field.graphql?.cacheHint,
                    field.access.read,
                    listKey,
                    fieldPath,
                    lists
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
        const { fields } = lists[listKey];
        return {
          ...Object.fromEntries(
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
          ),
          // this is exactly what the id field will add
          // but this does it more explicitly so that typescript understands
          id: graphql.arg({ type: graphql.ID }),
        };
      },
    });

    const where: GraphQLTypesForList['where'] = graphql.inputObject({
      name: names.whereInputName,
      fields: () => {
        const { fields } = lists[listKey];
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
        const { fields } = lists[listKey];
        const ret: Record<keyof typeof fields, graphql.Arg<graphql.InputType>> = {};

        for (const key in fields) {
          const arg = graphqlArgForInputField(fields[key], 'create');
          if (!arg) continue;
          ret[key] = arg;
        }

        return ret;
      },
    });

    const update = graphql.inputObject({
      name: names.updateInputName,
      fields: () => {
        const { fields } = lists[listKey];
        const ret: Record<keyof typeof fields, graphql.Arg<graphql.InputType>> = {};

        for (const key in fields) {
          const arg = graphqlArgForInputField(fields[key], 'update');
          if (!arg) continue;
          ret[key] = arg;
        }

        return ret;
      },
    });

    const orderBy = graphql.inputObject({
      name: names.listOrderName,
      fields: () => {
        const { fields } = lists[listKey];
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

    let take: any = graphql.arg({ type: graphql.Int });
    if (listConfig.graphql?.maxTake !== undefined) {
      take = graphql.arg({
        type: graphql.nonNull(graphql.Int),
        // warning: this is used by queries/resolvers.ts to enforce the limit
        defaultValue: listConfig.graphql.maxTake,
      });
    }

    const findManyArgs: FindManyArgs = {
      where: graphql.arg({
        type: graphql.nonNull(where),
        defaultValue: listConfig.isSingleton ? ({ id: { equals: '1' } } as {}) : {},
      }),
      orderBy: graphql.arg({
        type: graphql.nonNull(graphql.list(graphql.nonNull(orderBy))),
        defaultValue: [],
      }),
      take,
      skip: graphql.arg({ type: graphql.nonNull(graphql.Int), defaultValue: 0 }),
      cursor: graphql.arg({ type: uniqueWhere }),
    };

    const isEnabled = intermediateLists[listKey].graphql.isEnabled;
    let relateToManyForCreate, relateToManyForUpdate, relateToOneForCreate, relateToOneForUpdate;
    if (isEnabled.type) {
      relateToManyForCreate = graphql.inputObject({
        name: names.relateToManyForCreateInputName,
        fields: () => {
          return {
            // Create via a relationship is only supported if this list allows create
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
            // Create via a relationship is only supported if this list allows create
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
            // Create via a relationship is only supported if this list allows create
            ...(isEnabled.create && { create: graphql.arg({ type: create }) }),
            connect: graphql.arg({ type: uniqueWhere }),
          };
        },
      });

      relateToOneForUpdate = graphql.inputObject({
        name: names.relateToOneForUpdateInputName,
        fields: () => {
          return {
            // Create via a relationship is only supported if this list allows create
            ...(isEnabled.create && { create: graphql.arg({ type: create }) }),
            connect: graphql.arg({ type: uniqueWhere }),
            disconnect: graphql.arg({ type: graphql.Boolean }),
          };
        },
      });
    }

    graphQLTypes[listKey] = {
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
              name: `${listKey}ManyRelationFilter`,
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
 * 1. Get the `isEnabled` config object from the listConfig - the returned object will be modified later
 * 2. Instantiate `lists` object - it is done here as the object will be added to the listGraphqlTypes
 * 3. Get graphqlTypes
 * 4. Initialise fields - field functions are called
 * 5. Handle relationships - ensure correct linking between two sides of all relationships (including one-sided relationships)
 * 6.
 */
export function initialiseLists(config: KeystoneConfig): Record<string, InitialisedList> {
  const listsConfig = config.lists;

  let intermediateLists;
  intermediateLists = Object.fromEntries(
    Object.entries(getIsEnabled(listsConfig)).map(([key, isEnabled]) => [
      key,
      { graphql: { isEnabled } },
    ])
  );

  /**
   * Lists is instantiated here so that it can be passed into the `getListGraphqlTypes` function
   * This function binds the listsRef object to the various graphql functions
   *
   * The object will be populated at the end of this function, and the reference will be maintained
   */
  const listsRef: Record<string, InitialisedList> = {};

  {
    const listGraphqlTypes = getListGraphqlTypes(listsConfig, listsRef, intermediateLists);
    intermediateLists = getListsWithInitialisedFields(config, listGraphqlTypes, intermediateLists);
  }

  {
    const resolvedDBFieldsForLists = resolveRelationships(intermediateLists);
    intermediateLists = Object.fromEntries(
      Object.entries(intermediateLists).map(([listKey, list]) => [
        listKey,
        {
          ...list,
          resolvedDbFields: resolvedDBFieldsForLists[listKey],
        },
      ])
    );
  }

  intermediateLists = Object.fromEntries(
    Object.entries(intermediateLists).map(([listKey, list]) => {
      const fields: Record<string, InitialisedField> = {};

      for (const [fieldKey, field] of Object.entries(list.fields)) {
        fields[fieldKey] = {
          ...field,
          dbField: list.resolvedDbFields[fieldKey],
        };
      }

      return [listKey, { ...list, fields }];
    })
  );

  for (const list of Object.values(intermediateLists)) {
    let hasAnEnabledCreateField = false;
    let hasAnEnabledUpdateField = false;

    for (const field of Object.values(list.fields)) {
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
      list.graphql.isEnabled.create = false;
    }
    if (!hasAnEnabledUpdateField) {
      list.graphql.isEnabled.update = false;
    }
  }

  // Error checking
  for (const [listKey, { fields }] of Object.entries(intermediateLists)) {
    assertFieldsValid({ listKey, fields });
  }

  // Fixup the GraphQL refs
  for (const [listKey, intermediateList] of Object.entries(intermediateLists)) {
    listsRef[listKey] = {
      ...intermediateList,
      lists: listsRef,
    };
  }

  // Do some introspection
  introspectGraphQLTypes(listsRef);

  return listsRef;
}
