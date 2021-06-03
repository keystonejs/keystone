import {
  types,
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
  orderDirectionEnum,
  CacheHintArgs,
} from '@keystone-next/types';
import { FieldHooks } from '@keystone-next/types/src/config/hooks';
import { GraphQLEnumType } from 'graphql';
import {
  ResolvedFieldAccessControl,
  ResolvedListAccessControl,
  parseListAccessControl,
  parseFieldAccessControl,
} from './access-control';
import { getNamesFromList } from './utils';
import { ListsWithResolvedRelations, ResolvedDBField, resolveRelationships } from './prisma-schema';
import { InputFilter, PrismaFilter, resolveWhereInput } from './where-inputs';
import { outputTypeField } from './queries/output-field';

export type InitialisedField = Omit<NextFieldType, 'dbField' | 'access'> & {
  dbField: ResolvedDBField;
  access: ResolvedFieldAccessControl;
  hooks: FieldHooks<BaseGeneratedListTypes>;
};

export type InitialisedList = {
  fields: Record<string, InitialisedField>;
  fieldsIncludingOppositesToOneSidedRelations: Record<string, ResolvedDBField>;
  pluralGraphQLName: string;
  filterImpls: Record<string, (input: InputFilter[string]) => PrismaFilter>;
  types: TypesForList;
  access: ResolvedListAccessControl;
  hooks: ListHooks<BaseGeneratedListTypes>;
  adminUILabels: { label: string; singular: string; plural: string; path: string };
  applySearchField: (filter: PrismaFilter, search: string | null | undefined) => PrismaFilter;
  cacheHint: ((args: CacheHintArgs) => CacheHint) | undefined;
  maxResults: number;
  listKey: string;
  lists: Record<string, InitialisedList>;
};

function assertNoConflictingExtraOutputFields(
  listKey: string,
  fields: Record<string, InitialisedField>
) {
  const fieldPaths = new Set(Object.keys(fields));
  const alreadyFoundFields: Record<string, string> = {};
  for (const [fieldPath, field] of Object.entries(fields)) {
    if (field.extraOutputFields) {
      for (const outputTypeFieldName of Object.keys(field.extraOutputFields)) {
        // note that this and the case handled below are fundamentally the same thing but i want different errors for each of them
        if (fieldPaths.has(outputTypeFieldName)) {
          throw new Error(
            `The field ${fieldPath} on the ${listKey} list defines an extra GraphQL output field named ${outputTypeFieldName} which conflicts with the Keystone field type named ${outputTypeFieldName} on the same list`
          );
        }
        const alreadyFoundField = alreadyFoundFields[outputTypeFieldName];
        if (alreadyFoundField !== undefined) {
          throw new Error(
            `The field ${fieldPath} on the ${listKey} list defines an extra GraphQL output field named ${outputTypeFieldName} which conflicts with the Keystone field type named ${alreadyFoundField} which also defines an extra GraphQL output field named ${outputTypeFieldName}`
          );
        }
        alreadyFoundFields[outputTypeFieldName] = fieldPath;
      }
    }
  }
}

function assertIdFieldGraphQLTypesCorrect(
  listKey: string,
  fields: Record<string, InitialisedField>
) {
  const idField = fields.id;
  if (idField.input?.uniqueWhere === undefined) {
    throw new Error(
      `The idField on a list must define a uniqueWhere GraphQL input with the ID GraphQL scalar type but the idField for ${listKey} does not define one`
    );
  }
  if (idField.input.uniqueWhere.arg.type !== types.ID) {
    throw new Error(
      `The idField on a list must define a uniqueWhere GraphQL input with the ID GraphQL scalar type but the idField for ${listKey} defines the type ${idField.input.uniqueWhere.arg.type.graphQLType.toString()}`
    );
  }
  // we may want to loosen these constraints in the future
  if (idField.input.create !== undefined) {
    throw new Error(
      `The idField on a list must not define a create GraphQL input but the idField for ${listKey} does define one`
    );
  }
  if (idField.input.update !== undefined) {
    throw new Error(
      `The idField on a list must not define an update GraphQL input but the idField for ${listKey} does define one`
    );
  }
  if (idField.access.read === false) {
    throw new Error(
      `The idField on a list must not have access.read be set to false but ${listKey} does`
    );
  }
  if (idField.output.type.kind !== 'non-null' || idField.output.type.of !== types.ID) {
    throw new Error(
      `The idField on a list must define a GraphQL output field with a non-nullable ID GraphQL scalar type but the idField for ${listKey} defines the type ${idField.output.type.graphQLType.toString()}`
    );
  }
}

export function initialiseLists(
  listsConfig: KeystoneConfig['lists'],
  provider: DatabaseProvider
): {
  lists: Record<string, InitialisedList>;
  listsWithResolvedRelations: ListsWithResolvedRelations;
} {
  const listInfos: Record<string, ListInfo> = {};
  for (const [listKey, listConfig] of Object.entries(listsConfig)) {
    const names = getGqlNames({
      listKey,
      pluralGraphQLName: getNamesFromList(listKey, listConfig).pluralGraphQLName,
    });

    let output = types.object<ItemRootValue>()({
      name: names.outputTypeName,
      description: ' A keystone list',
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

    const uniqueWhere = types.inputObject({
      name: names.whereUniqueInputName,
      fields: {
        id: types.arg({ type: types.nonNull(types.ID) }),
      },
    });

    // TODO: validate no fields are named AND, NOT, or OR
    const where: TypesForList['where'] = types.inputObject({
      name: names.whereInputName,
      fields: () => {
        const { fields } = lists[listKey];
        return Object.assign(
          {
            AND: types.arg({
              type: types.list(types.nonNull(where)),
            }),
            OR: types.arg({
              type: types.list(types.nonNull(where)),
            }),
          },
          ...Object.values(fields).map(field =>
            field.access.read === false ? {} : field.__legacy?.filters?.fields ?? {}
          )
        );
      },
    });

    const create = types.inputObject({
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

    const update = types.inputObject({
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

    const orderBy = types.inputObject({
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
      where: types.arg({
        type: types.nonNull(where),
        defaultValue: {},
      }),
      search: types.arg({
        type: types.String,
      }),
      sortBy: types.arg({
        type: types.list(
          types.nonNull(
            types.enum({
              name: names.listSortName,
              values: types.enumValues(['bad']),
            })
          )
        ),
        deprecationReason: 'sortBy has been deprecated in favour of orderBy',
      }),
      orderBy: types.arg({
        type: types.nonNull(types.list(types.nonNull(orderBy))),
        defaultValue: [],
      }),
      // TODO: non-nullable when max results is specified in the list with the default of max results
      first: types.arg({
        type: types.Int,
      }),
      skip: types.arg({
        type: types.nonNull(types.Int),
        defaultValue: 0,
      }),
    };

    const relateToMany = types.inputObject({
      name: names.relateToManyInputName,
      fields: () => {
        const list = lists[listKey];
        return {
          ...(list.access.create !== false && {
            create: types.arg({ type: types.list(create) }),
          }),
          connect: types.arg({ type: types.list(uniqueWhere) }),
          disconnect: types.arg({ type: types.list(uniqueWhere) }),
          disconnectAll: types.arg({ type: types.Boolean }),
        };
      },
    });

    const relateToOne = types.inputObject({
      name: names.relateToOneInputName,
      fields: () => {
        const list = lists[listKey];

        return {
          ...(list.access.create !== false && {
            create: types.arg({ type: create }),
          }),
          connect: types.arg({ type: uniqueWhere }),
          disconnect: types.arg({ type: uniqueWhere }),
          disconnectAll: types.arg({ type: types.Boolean }),
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
            create: relateToMany,
            update: relateToMany,
          },
          one: {
            create: relateToOne,
            update: relateToOne,
          },
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
          return [
            fieldKey,
            {
              ...field,
              access,
              dbField: listsWithResolvedDBFields[listKey].fields[fieldKey],
              hooks: field.hooks ?? {},
            },
          ];
        })
      );
      const access = parseListAccessControl(list.access);
      if (!hasAnAccessibleCreateField) {
        access.create = false;
      }
      if (!hasAnAccessibleUpdateField) {
        access.update = false;
      }
      return [
        listKey,
        {
          ...list,
          access,
          fields,
        },
      ];
    })
  );

  for (const [listKey, { fields, pluralGraphQLName }] of Object.entries(
    listsWithInitialisedFieldsAndResolvedDbFields
  )) {
    assertNoConflictingExtraOutputFields(listKey, fields);
    assertIdFieldGraphQLTypesCorrect(listKey, fields);

    for (const [fieldKey, { dbField, input }] of Object.entries(fields)) {
      if (input?.uniqueWhere) {
        if (
          dbField.kind !== 'scalar' ||
          (dbField.scalar !== 'String' && dbField.scalar !== 'Int')
        ) {
          throw new Error(
            `Only String and Int scalar db fields can provide a uniqueWhere input currently but the field at ${listKey}.${fieldKey} specifies a uniqueWhere input`
          );
        }

        if (dbField.index !== 'unique' && fieldKey !== 'id') {
          throw new Error(
            `Fields must have a unique index or be the idField to specify a uniqueWhere input but the field at ${listKey}.${fieldKey} specifies a uniqueWhere input without a unique index`
          );
        }
      }
    }

    // this is quite a hack, we could do this in a better way if we "initialised" the fields twice,
    // the first time to see if they have an orderBy and then the second time for real
    // but that would be more complicated and this works
    Object.assign(
      listInfos[listKey].types.findManyArgs.sortBy.type.graphQLType.ofType.ofType,
      new GraphQLEnumType({
        name: getGqlNames({ listKey, pluralGraphQLName }).listSortName,
        values: Object.fromEntries(
          Object.entries(fields).flatMap(([fieldKey, field]) => {
            if (
              field.input?.orderBy?.arg.type === orderDirectionEnum &&
              field.input?.orderBy?.arg.defaultValue === undefined &&
              field.input?.orderBy?.resolve === undefined &&
              field.access.read !== false
            ) {
              return [
                [`${fieldKey}_ASC`, {}],
                [`${fieldKey}_DESC`, {}],
              ];
            }
            return [];
          })
        ),
      })
    );
  }

  const lists: Record<string, InitialisedList> = {};

  for (const [listKey, list] of Object.entries(listsWithInitialisedFieldsAndResolvedDbFields)) {
    lists[listKey] = {
      ...list,
      ...listInfos[listKey],
      hooks: list.hooks || {},
      fieldsIncludingOppositesToOneSidedRelations: listsWithResolvedDBFields[listKey].fields,
      filterImpls: Object.assign(
        {},
        ...Object.values(list.fields).map(field => {
          if (field.dbField.kind === 'relation' && field.__legacy?.filters) {
            const foreignListKey = field.dbField.list;
            return Object.fromEntries(
              Object.entries(field.__legacy.filters.impls).map(([key, resolve]) => {
                return [
                  key,
                  (val: any) =>
                    resolve(val, foreignListWhereInput =>
                      resolveWhereInput(foreignListWhereInput, lists[foreignListKey])
                    ),
                ];
              })
            );
          }
          return field.__legacy?.filters?.impls ?? {};
        })
      ),
      applySearchField: (filter, search) => {
        const searchFieldName = listsConfig[listKey].db?.searchField ?? 'name';
        const searchField = list.fields[searchFieldName];
        if (search != null && search !== '' && searchField) {
          if (searchField.dbField.kind === 'scalar' && searchField.dbField.scalar === 'String') {
            // FIXME: Think about regex
            const mode = provider === 'sqlite' ? undefined : 'insensitive';
            filter = {
              AND: [filter, { [searchFieldName]: { contains: search, mode } }],
            };

            // const f = escapeRegExp;
            // this._query.andWhere(`${baseTableAlias}.${searchFieldName}`, '~*', f(search));
          } else {
            // Return no results
            filter = {
              AND: [filter, { [searchFieldName]: null }, { NOT: { [searchFieldName]: null } }],
            };
          }
        }
        return filter;
      },
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

  return {
    lists,
    listsWithResolvedRelations: listsWithResolvedDBFields,
  };
}
