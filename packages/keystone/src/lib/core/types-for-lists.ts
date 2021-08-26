import {
  graphql,
  ItemRootValue,
  TypesForList,
  getGqlNames,
  NextFieldType,
  CacheHint,
  BaseGeneratedListTypes,
  ListInfo,
  ListHooks,
  KeystoneConfig,
  DatabaseProvider,
  FindManyArgs,
  CacheHintArgs,
} from '../../types';
import { FieldHooks } from '../../types/config/hooks';
import {
  ResolvedFieldAccessControl,
  ResolvedListAccessControl,
  parseListAccessControl,
  parseFieldAccessControl,
} from './access-control';
import { getNamesFromList } from './utils';
import { ResolvedDBField, resolveRelationships } from './resolve-relationships';
import { outputTypeField } from './queries/output-field';
import { assertFieldsValid } from './field-assertions';

export type InitialisedField = Omit<NextFieldType, 'dbField' | 'access' | 'graphql'> & {
  dbField: ResolvedDBField;
  access: ResolvedFieldAccessControl;
  hooks: FieldHooks<BaseGeneratedListTypes>;
  graphql: {
    isEnabled: {
      read: boolean;
      create: boolean;
      update: boolean;
      filter: boolean;
      orderBy: boolean;
    };
    cacheHint?: CacheHint | undefined;
  };
};

export type InitialisedList = {
  fields: Record<string, InitialisedField>;
  /** This will include the opposites to one-sided relationships */
  resolvedDbFields: Record<string, ResolvedDBField>;
  pluralGraphQLName: string;
  types: TypesForList;
  access: ResolvedListAccessControl;
  hooks: ListHooks<BaseGeneratedListTypes>;
  adminUILabels: { label: string; singular: string; plural: string; path: string };
  cacheHint: ((args: CacheHintArgs) => CacheHint) | undefined;
  maxResults: number;
  listKey: string;
  lists: Record<string, InitialisedList>;
  graphql: {
    isEnabled: {
      type: boolean;
      query: boolean;

      create: boolean;
      update: boolean;
      delete: boolean;
    };
  };
};

export function initialiseLists(
  listsConfig: KeystoneConfig['lists'],
  provider: DatabaseProvider
): Record<string, InitialisedList> {
  const listInfos: Record<string, ListInfo> = {};
  const isEnabled: Record<
    string,
    {
      type: boolean;
      query: boolean;
      create: boolean;
      update: boolean;
      delete: boolean;
      filter: boolean;
      orderBy: boolean;
    }
  > = {};

  for (const [listKey, listConfig] of Object.entries(listsConfig)) {
    const _isEnabled = listConfig.graphql?.isEnabled;
    if (_isEnabled === false) {
      isEnabled[listKey] = {
        type: false,
        query: false,
        create: false,
        update: false,
        delete: false,
        filter: false,
        orderBy: false,
      };
    } else if (_isEnabled === true || _isEnabled === undefined) {
      isEnabled[listKey] = {
        type: true,
        query: true,
        create: true,
        update: true,
        delete: true,
        filter: false,
        orderBy: false,
      };
    } else {
      isEnabled[listKey] = {
        type: true,
        query: _isEnabled.query ?? true,
        create: _isEnabled.create ?? true,
        update: _isEnabled.update ?? true,
        delete: _isEnabled.delete ?? true,
        filter: _isEnabled.filter ?? false,
        orderBy: _isEnabled.orderBy ?? false,
      };
    }
  }

  for (const [listKey, listConfig] of Object.entries(listsConfig)) {
    const names = getGqlNames({
      listKey,
      pluralGraphQLName: getNamesFromList(listKey, listConfig).pluralGraphQLName,
    });

    let output = graphql.object<ItemRootValue>()({
      name: names.outputTypeName,
      fields: () => {
        const { fields } = lists[listKey];
        return {
          ...Object.fromEntries(
            Object.entries(fields).flatMap(([fieldPath, field]) => {
              if (
                !field.output ||
                !field.graphql.isEnabled.read ||
                (field.dbField.kind === 'relation' && !isEnabled[field.dbField.list].query)
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

    const where: TypesForList['where'] = graphql.inputObject({
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
        return Object.fromEntries(
          Object.entries(fields).flatMap(([key, field]) => {
            if (
              // We're going to skip this field if...
              !field.input?.create?.arg || // The field type doesn't support create, or
              !field.graphql.isEnabled.create // Create has been disabled on this field, or
            ) {
              return [];
            }
            return [[key, field.input.create.arg]] as const;
          })
        );
      },
    });

    const update = graphql.inputObject({
      name: names.updateInputName,
      fields: () => {
        const { fields } = lists[listKey];
        return Object.fromEntries(
          Object.entries(fields).flatMap(([key, field]) => {
            if (
              // We're going to skip this field if...
              !field.input?.update?.arg || /// The field type doesn't support update, or
              !field.graphql.isEnabled.update // Update has been disabled on this field, or
            ) {
              return [];
            }
            return [[key, field.input.update.arg]] as const;
          })
        );
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

    const findManyArgs: FindManyArgs = {
      where: graphql.arg({ type: graphql.nonNull(where), defaultValue: {} }),
      orderBy: graphql.arg({
        type: graphql.nonNull(graphql.list(graphql.nonNull(orderBy))),
        defaultValue: [],
      }),
      // TODO: non-nullable when max results is specified in the list with the default of max results
      take: graphql.arg({ type: graphql.Int }),
      skip: graphql.arg({ type: graphql.nonNull(graphql.Int), defaultValue: 0 }),
    };

    const _isEnabled = isEnabled[listKey];
    let relateToManyForCreate, relateToManyForUpdate, relateToOneForCreate, relateToOneForUpdate;
    if (_isEnabled.create || _isEnabled.query || _isEnabled.update || _isEnabled.delete) {
      relateToManyForCreate = graphql.inputObject({
        name: names.relateToManyForCreateInputName,
        fields: () => {
          return {
            // Create via a relationship is only supported if this list allows create
            ...(_isEnabled.create && {
              create: graphql.arg({ type: graphql.list(graphql.nonNull(create)) }),
            }),
            // Connecting to this list (via a uniqueWhere) is only supported if uniqueWhere already exists
            ...((_isEnabled.query || _isEnabled.update || _isEnabled.delete) && {
              connect: graphql.arg({ type: graphql.list(graphql.nonNull(uniqueWhere)) }),
            }),
          };
        },
      });

      relateToManyForUpdate = graphql.inputObject({
        name: names.relateToManyForUpdateInputName,
        fields: () => {
          return {
            // The order of these fields reflects the order in which they are applied
            // in the mutation.
            // Connecting/disconnecting/setting to this list (via a uniqueWhere) is only supported if uniqueWhere already exists
            ...((_isEnabled.query || _isEnabled.update || _isEnabled.delete) && {
              disconnect: graphql.arg({ type: graphql.list(graphql.nonNull(uniqueWhere)) }),
              set: graphql.arg({ type: graphql.list(graphql.nonNull(uniqueWhere)) }),
            }),
            // Create via a relationship is only supported if this list allows create
            ...(_isEnabled.create && {
              create: graphql.arg({ type: graphql.list(graphql.nonNull(create)) }),
            }),
            ...((_isEnabled.query || _isEnabled.update || _isEnabled.delete) && {
              connect: graphql.arg({ type: graphql.list(graphql.nonNull(uniqueWhere)) }),
            }),
          };
        },
      });

      relateToOneForCreate = graphql.inputObject({
        name: names.relateToOneForCreateInputName,
        fields: () => {
          return {
            // Create via a relationship is only supported if this list allows create
            ...(_isEnabled.create && { create: graphql.arg({ type: create }) }),
            // Connecting to this list (via a uniqueWhere) is only supported if uniqueWhere already exists
            ...((_isEnabled.query || _isEnabled.update || _isEnabled.delete) && {
              connect: graphql.arg({ type: uniqueWhere }),
            }),
          };
        },
      });

      relateToOneForUpdate = graphql.inputObject({
        name: names.relateToOneForUpdateInputName,
        fields: () => {
          return {
            // Create via a relationship is only supported if this list allows create
            ...(_isEnabled.create && { create: graphql.arg({ type: create }) }),
            // Connecting/disconnecting/setting to this list (via a uniqueWhere) is only supported if uniqueWhere already exists
            ...((_isEnabled.query || _isEnabled.update || _isEnabled.delete) && {
              connect: graphql.arg({ type: uniqueWhere }),
              disconnect: graphql.arg({ type: graphql.Boolean }),
            }),
          };
        },
      });
    }
    listInfos[listKey] = {
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

  const listsWithInitialisedFields = Object.fromEntries(
    Object.entries(listsConfig).map(([listKey, list]) => [
      listKey,
      {
        fields: Object.fromEntries(
          Object.entries(list.fields).map(([fieldKey, fieldFunc]) => {
            if (typeof fieldFunc !== 'function') {
              throw new Error(`The field at ${listKey}.${fieldKey} does not provide a function`);
            }
            let f = fieldFunc({ fieldKey, listKey, lists: listInfos, provider });

            const _isEnabled = {
              read: f.graphql?.isEnabled?.read ?? true,
              update: f.graphql?.isEnabled?.update ?? true,
              create: f.graphql?.isEnabled?.create ?? true,
              // Filter and orderBy can be set at the list level, and default to `false`
              // if no value was set at the list level.
              filter: f.graphql?.isEnabled?.filter ?? isEnabled[listKey].filter,
              orderBy: f.graphql?.isEnabled?.orderBy ?? isEnabled[listKey].orderBy,
            };
            const field = {
              ...f,
              graphql: { ...f.graphql, isEnabled: _isEnabled },
              input: { ...f.input },
            };

            return [fieldKey, field];
          })
        ),
        ...getNamesFromList(listKey, list),
        hooks: list.hooks,
        access: list.access,
      },
    ])
  );

  const listsWithResolvedDBFields = resolveRelationships(listsWithInitialisedFields);

  const listsWithInitialisedFieldsAndResolvedDbFields = Object.fromEntries(
    Object.entries(listsWithInitialisedFields).map(([listKey, list]) => {
      let hasAnEnabledCreateField = false;
      let hasAnEnabledUpdateField = false;
      const fields = Object.fromEntries(
        Object.entries(list.fields).map(([fieldKey, field]) => {
          if (field.input?.create?.arg && field.graphql.isEnabled.create) {
            hasAnEnabledCreateField = true;
          }
          if (field.input?.update && field.graphql.isEnabled.update) {
            hasAnEnabledUpdateField = true;
          }
          const access = parseFieldAccessControl(field.access);
          const dbField = listsWithResolvedDBFields[listKey].resolvedDbFields[fieldKey];
          return [
            fieldKey,
            { ...field, access, dbField, hooks: field.hooks ?? {}, graphql: field.graphql },
          ];
        })
      );
      const access = parseListAccessControl(list.access);
      // You can't have a graphQL type with no fields, so
      // if they're all disabled, we have to disable the whole operation.
      if (!hasAnEnabledCreateField) {
        isEnabled[listKey].create = false;
      }
      if (!hasAnEnabledUpdateField) {
        isEnabled[listKey].update = false;
      }
      return [listKey, { ...list, access, fields, graphql: { isEnabled: isEnabled[listKey] } }];
    })
  );

  for (const [listKey, { fields }] of Object.entries(
    listsWithInitialisedFieldsAndResolvedDbFields
  )) {
    assertFieldsValid({ listKey, fields });
  }

  const lists: Record<string, InitialisedList> = {};

  for (const [listKey, list] of Object.entries(listsWithInitialisedFieldsAndResolvedDbFields)) {
    lists[listKey] = {
      ...list,
      ...listInfos[listKey],
      ...listsWithResolvedDBFields[listKey],
      hooks: list.hooks || {},
      cacheHint: (() => {
        const cacheHint = listsConfig[listKey].graphql?.cacheHint;
        if (cacheHint === undefined) {
          return undefined;
        }
        return typeof cacheHint === 'function' ? cacheHint : () => cacheHint;
      })(),
      maxResults: listsConfig[listKey].graphql?.queryLimits?.maxResults ?? Infinity,
      listKey,
      lists,
    };
  }

  return lists;
}
