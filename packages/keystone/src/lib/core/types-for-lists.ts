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

export type InitialisedField = Omit<NextFieldType, 'dbField' | 'access'> & {
  dbField: ResolvedDBField;
  access: ResolvedFieldAccessControl;
  hooks: FieldHooks<BaseGeneratedListTypes>;
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
};

export function initialiseLists(
  listsConfig: KeystoneConfig['lists'],
  provider: DatabaseProvider
): Record<string, InitialisedList> {
  const listInfos: Record<string, ListInfo> = {};
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
              if (field.access.read === false) return [];
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
            if (!field.input?.uniqueWhere?.arg || field.access.read === false) return [];
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
              field.access.read !== false && { [fieldKey]: field.input?.where?.arg }
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
            if (!field.input?.create?.arg || field.access.create === false) return [];
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
            if (!field.input?.update?.arg || field.access.update === false) return [];
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
            if (!field.input?.orderBy?.arg || field.access.read === false) return [];
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

    const relateToManyForCreate = graphql.inputObject({
      name: names.relateToManyForCreateInputName,
      fields: () => {
        const list = lists[listKey];
        return {
          ...(list.access.create !== false && {
            create: graphql.arg({ type: graphql.list(graphql.nonNull(create)) }),
          }),
          connect: graphql.arg({ type: graphql.list(graphql.nonNull(uniqueWhere)) }),
        };
      },
    });

    const relateToManyForUpdate = graphql.inputObject({
      name: names.relateToManyForUpdateInputName,
      fields: () => {
        const list = lists[listKey];
        return {
          disconnect: graphql.arg({ type: graphql.list(graphql.nonNull(uniqueWhere)) }),
          set: graphql.arg({ type: graphql.list(graphql.nonNull(uniqueWhere)) }),
          ...(list.access.create !== false && {
            create: graphql.arg({ type: graphql.list(graphql.nonNull(create)) }),
          }),
          connect: graphql.arg({ type: graphql.list(graphql.nonNull(uniqueWhere)) }),
        };
      },
    });

    const relateToOneForCreate = graphql.inputObject({
      name: names.relateToOneForCreateInputName,
      fields: () => {
        const list = lists[listKey];
        return {
          ...(list.access.create !== false && {
            create: graphql.arg({ type: create }),
          }),
          connect: graphql.arg({ type: uniqueWhere }),
        };
      },
    });

    const relateToOneForUpdate = graphql.inputObject({
      name: names.relateToOneForUpdateInputName,
      fields: () => {
        const list = lists[listKey];
        return {
          ...(list.access.create !== false && {
            create: graphql.arg({ type: create }),
          }),
          connect: graphql.arg({ type: uniqueWhere }),
          disconnect: graphql.arg({ type: graphql.Boolean }),
        };
      },
    });

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
            return [fieldKey, fieldFunc({ fieldKey, listKey, lists: listInfos, provider })];
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
      let hasAnAccessibleCreateField = false;
      let hasAnAccessibleUpdateField = false;
      const fields = Object.fromEntries(
        Object.entries(list.fields).map(([fieldKey, field]) => {
          const access = parseFieldAccessControl(field.access);
          if (access.create && field.input?.create?.arg) {
            hasAnAccessibleCreateField = true;
          }
          if (access.update && field.input?.update) {
            hasAnAccessibleUpdateField = true;
          }
          const dbField = listsWithResolvedDBFields[listKey].resolvedDbFields[fieldKey];
          return [fieldKey, { ...field, access, dbField, hooks: field.hooks ?? {} }];
        })
      );
      const access = parseListAccessControl(list.access);
      if (!hasAnAccessibleCreateField) {
        access.create = false;
      }
      if (!hasAnAccessibleUpdateField) {
        access.update = false;
      }
      return [listKey, { ...list, access, fields }];
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
