import {
  types,
  FindManyArgsValue,
  ItemRootValue,
  KeystoneContext,
  TypesForList,
  getGqlNames,
  NextFieldType,
  CacheHint,
  FieldReadAccessArgs,
  IndividualFieldAccessControl,
  FieldAccessControl,
  FieldCreateAccessArgs,
  FieldUpdateAccessArgs,
  BaseGeneratedListTypes,
  CreateAccessControl,
  DeleteListAccessControl,
  ReadListAccessControl,
  UpdateListAccessControl,
  ListAccessControl,
  ListInfo,
  ListHooks,
  KeystoneConfig,
  DatabaseProvider,
  FindManyArgs,
  orderDirectionEnum,
  CacheHintArgs,
} from '@keystone-next/types';
import { FieldHooks } from '@keystone-next/types/src/config/hooks';
import pluralize from 'pluralize';
import { GraphQLEnumType, GraphQLResolveInfo } from 'graphql';
import { validateFieldAccessControl, validateNonCreateListAccessControl } from './access-control';
import { applyFirstSkipToCount, getPrismaModelForList, IdType } from './utils';
import {
  getDBFieldPathForFieldOnMultiField,
  ListsWithResolvedRelations,
  ResolvedDBField,
  ResolvedRelationDBField,
  resolveRelationships,
} from './prisma-schema';
import { accessDeniedError, throwAccessDenied } from './ListTypes/graphqlErrors';
import {
  CreateAndUpdateInputResolvers,
  FilterInputResolvers,
  getFilterInputResolvers,
  InputFilter,
  PrismaFilter,
  resolveUniqueWhereInput,
} from './input-resolvers';
import { keyToLabel, labelToPath, labelToClass } from './ListTypes/utils';
import { createOneState } from './mutation-resolvers';
import { findMany, findManyFilter } from './query-resolvers';

export type InitialisedField = Omit<NextFieldType, 'dbField' | 'access'> & {
  dbField: ResolvedDBField;
  access: ResolvedFieldAccessControl;
  hooks: FieldHooks<BaseGeneratedListTypes>;
};

type ResolvedListAccessControl = {
  read: ReadListAccessControl<BaseGeneratedListTypes>;
  create: CreateAccessControl<BaseGeneratedListTypes>;
  update: UpdateListAccessControl<BaseGeneratedListTypes>;
  delete: DeleteListAccessControl<BaseGeneratedListTypes>;
};

type NestedMutationState = {
  resolvers: Record<string, CreateAndUpdateInputResolvers>;
  afterChanges: (() => Promise<void> | void)[];
};

export type InitialisedList = {
  fields: Record<string, InitialisedField>;
  fieldsIncludingOppositesToOneSidedRelations: Record<string, ResolvedDBField>;
  pluralGraphQLName: string;
  filterImpls: Record<string, (input: InputFilter[string]) => PrismaFilter>;
  types: TypesForList;
  access: ResolvedListAccessControl;
  inputResolvers: {
    where: (context: KeystoneContext) => FilterInputResolvers['where'];
    createAndUpdate: (context: KeystoneContext) => NestedMutationState;
  };
  hooks: ListHooks<BaseGeneratedListTypes>;
  adminUILabels: { label: string; singular: string; plural: string; path: string };
  applySearchField: (filter: PrismaFilter, search: string | null | undefined) => PrismaFilter;
  cacheHint: ((args: CacheHintArgs) => CacheHint) | undefined;
  maxResults: number;
  listKey: string;
};

function assert(condition: boolean): asserts condition {
  if (!condition) {
    throw new Error('failed assert');
  }
}

function getRelationVal(
  dbField: ResolvedRelationDBField,
  id: IdType,
  foreignList: InitialisedList,
  context: KeystoneContext,
  info: GraphQLResolveInfo
) {
  const oppositeDbField = foreignList.fieldsIncludingOppositesToOneSidedRelations[dbField.field];
  assert(oppositeDbField.kind === 'relation');
  const relationFilter = {
    [dbField.field]: oppositeDbField.mode === 'many' ? { some: { id } } : { id },
  };
  if (dbField.mode === 'many') {
    return {
      findMany: async (args: FindManyArgsValue) => {
        return findMany(args, foreignList, context, info, relationFilter);
      },
      count: async ({ where, search, first, skip }: FindManyArgsValue) => {
        const filter = await findManyFilter(foreignList, context, where, search);
        if (filter === false) {
          throw accessDeniedError('query');
        }
        const count = applyFirstSkipToCount({
          count: await getPrismaModelForList(context.prisma, dbField.list).count({
            where: { AND: [filter, relationFilter] },
          }),
          first,
          skip,
        });
        if (info.cacheControl && foreignList.cacheHint) {
          info.cacheControl.setCacheHint(
            foreignList.cacheHint({
              results: count,
              operationName: info.operation.name?.value,
              meta: true,
            }) as any
          );
        }
        return count;
      },
    };
  }

  return async () => {
    const access = await validateNonCreateListAccessControl({
      access: foreignList.access.read,
      args: {
        context,
        listKey: dbField.list,
        operation: 'read',
        session: context.session,
      },
    });
    if (access === false) {
      throw accessDeniedError('query');
    }
    return getPrismaModelForList(context.prisma, dbField.list).findFirst({
      where:
        access === true
          ? relationFilter
          : { AND: [relationFilter, await foreignList.inputResolvers.where(context)(access)] },
    });
  };
}

function getValueForDBField(
  rootVal: ItemRootValue,
  dbField: ResolvedDBField,
  id: IdType,
  fieldPath: string,
  context: KeystoneContext,
  lists: Record<string, InitialisedList>,
  info: GraphQLResolveInfo
) {
  if (dbField.kind === 'multi') {
    return Object.fromEntries(
      Object.keys(dbField.fields).map(innerDBFieldKey => {
        const keyOnDbValue = getDBFieldPathForFieldOnMultiField(fieldPath, innerDBFieldKey);
        return [innerDBFieldKey, rootVal[keyOnDbValue] as any];
      })
    );
  }
  if (dbField.kind === 'relation') {
    return getRelationVal(dbField, id, lists[dbField.list], context, info);
  }
  return rootVal[fieldPath] as any;
}

function outputTypeField(
  output: NextFieldType['output'],
  dbField: ResolvedDBField,
  cacheHint: CacheHint | undefined,
  access: IndividualFieldAccessControl<FieldReadAccessArgs<BaseGeneratedListTypes>>,
  listKey: string,
  fieldPath: string,
  lists: Record<string, InitialisedList>
) {
  return types.field({
    type: output.type,
    deprecationReason: output.deprecationReason,
    description: output.description,
    args: output.args,
    extensions: output.extensions,
    async resolve(rootVal: ItemRootValue, args, context, info) {
      const id = (rootVal as any).id as IdType;

      // Check access
      const canAccess = await validateFieldAccessControl({
        access,
        args: {
          context,
          fieldKey: fieldPath,
          item: rootVal,
          listKey,
          operation: 'read',
          session: context.session,
        },
      });
      if (!canAccess) {
        // If the client handles errors correctly, it should be able to
        // receive partial data (for the fields the user has access to),
        // and then an `errors` array of AccessDeniedError's
        throwAccessDenied('query', fieldPath, { itemId: rootVal.id });
      }

      // Only static cache hints are supported at the field level until a use-case makes it clear what parameters a dynamic hint would take
      if (cacheHint && info && info.cacheControl) {
        info.cacheControl.setCacheHint(cacheHint as any);
      }

      const value = getValueForDBField(rootVal, dbField, id, fieldPath, context, lists, info);

      if (output.resolve) {
        return output.resolve({ id, value, item: rootVal }, args, context, info);
      }
      return value;
    },
  });
}

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

type ResolvedFieldAccessControl = {
  read: IndividualFieldAccessControl<FieldReadAccessArgs<BaseGeneratedListTypes>>;
  create: IndividualFieldAccessControl<FieldCreateAccessArgs<BaseGeneratedListTypes>>;
  update: IndividualFieldAccessControl<FieldUpdateAccessArgs<BaseGeneratedListTypes>>;
};

function parseFieldAccessControl(
  access: FieldAccessControl<BaseGeneratedListTypes> | undefined
): ResolvedFieldAccessControl {
  if (typeof access === 'boolean' || typeof access === 'function') {
    return { create: access, read: access, update: access };
  }
  // note i'm intentionally not using spread here because typescript can't express an optional property which cannot be undefined so spreading would mean there is a possibility that someone could pass {access: undefined} or {access:{read: undefined}} and bad things would happen
  return {
    create: access?.create ?? true,
    read: access?.read ?? true,
    update: access?.update ?? true,
  };
}

function parseListAccessControl(
  access: ListAccessControl<BaseGeneratedListTypes> | undefined
): ResolvedListAccessControl {
  if (typeof access === 'boolean' || typeof access === 'function') {
    return { create: access, read: access, update: access, delete: access };
  }
  // note i'm intentionally not using spread here because typescript can't express an optional property which cannot be undefined so spreading would mean there is a possibility that someone could pass {access: undefined} or {access:{read: undefined}} and bad things would happen
  return {
    create: access?.create ?? true,
    read: access?.read ?? true,
    update: access?.update ?? true,
    delete: access?.delete ?? true,
  };
}

function getNamesFromList(
  listKey: string,
  { graphql, plural, label, singular, path }: KeystoneConfig['lists'][string]
) {
  const _label = label || keyToLabel(listKey);
  const _singular = singular || pluralize.singular(_label);
  const _plural = plural || pluralize.plural(_label);

  if (_plural === _label) {
    throw new Error(
      `Unable to use ${_label} as a List name - it has an ambiguous plural (${_plural}). Please choose another name for your list.`
    );
  }

  const adminUILabels = {
    // Fall back to the plural for the label if none was provided, not the autogenerated default from key
    label: label || _plural,
    singular: _singular,
    plural: _plural,
    path: path || labelToPath(_plural),
  };

  const pluralGraphQLName = graphql?.pluralName || labelToClass(_plural);
  return {
    pluralGraphQLName,
    adminUILabels,
  };
}

export function initialiseLists(
  lists: KeystoneConfig['lists'],
  provider: DatabaseProvider
): {
  lists: Record<string, InitialisedList>;
  listsWithResolvedRelations: ListsWithResolvedRelations;
} {
  const listInfos: Record<string, ListInfo> = {};
  for (const [listKey, list] of Object.entries(lists)) {
    const _names = getNamesFromList(listKey, list);
    const names = getGqlNames({
      listKey,
      pluralGraphQLName: _names.pluralGraphQLName,
    });

    let output = types.object<ItemRootValue>()({
      name: names.outputTypeName,
      description: ' A keystone list',
      fields: () => {
        const { fields } = listsWithInitialisedFieldsAndResolvedDbFields[listKey];
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
                    initialisedLists
                  ),
                ];
              });
            })
          ),
        };
      },
    });
    // const uniqueWhere = types.inputObject({
    //   name: names.whereUniqueInputName,
    //   fields: () => {
    //     const { fields } = listsWithInitialisedFieldsAndResolvedDbFields[listKey];
    //     return Object.fromEntries(
    //       Object.entries(fields).flatMap(([key, field]) => {
    //         if (!field.input?.uniqueWhere || field.access.read === false) return [];
    //         return [[key, field.input.uniqueWhere.arg]] as const;
    //       })
    //     );
    //   },
    // });

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
        const { fields } = listsWithInitialisedFieldsAndResolvedDbFields[listKey];
        return Object.assign(
          {
            AND: types.arg({
              type: types.list(types.nonNull(where)),
            }),
            OR: types.arg({
              type: types.list(types.nonNull(where)),
            }),
            // NOT: types.arg({
            //   type: types.list(types.nonNull(where)),
            // }),
            // ...Object.fromEntries(
            //   Object.entries(fields).flatMap(([key, field]) => {
            //     if (!field.input?.where?.arg || field.access.read === false) return [];
            //     return [[key, field.input.where.arg]] as const;
            //   })
            // ),
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
        const { fields } = listsWithInitialisedFieldsAndResolvedDbFields[listKey];
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
        const { fields } = listsWithInitialisedFieldsAndResolvedDbFields[listKey];
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
        const { fields } = listsWithInitialisedFieldsAndResolvedDbFields[listKey];
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
        const list = initialisedLists[listKey];
        return {
          ...(list.access.create === false
            ? {}
            : {
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
        const list = initialisedLists[listKey];

        return {
          ...(list.access.create === false
            ? {}
            : {
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
    Object.entries(lists).map(([listKey, list]) => [
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

        if (dbField.index !== 'unique' || fieldKey === 'id') {
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

  const initialisedLists: Record<string, InitialisedList> = Object.fromEntries(
    Object.entries(listsWithInitialisedFieldsAndResolvedDbFields).map(([listKey, list]): [
      string,
      InitialisedList
    ] => [
      listKey,
      {
        ...list,
        ...listInfos[listKey],
        hooks: list.hooks || {},
        inputResolvers: {
          where: context => getWhereInputResolvers(context)[listKey].where,
          createAndUpdate: context => createAndUpdateInputResolvers(initialisedLists, context),
        },
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
                        initialisedLists[foreignListKey].inputResolvers.where(
                          // we're abusing the fact that the context technically isn't used rn
                          {} as any
                        )(foreignListWhereInput)
                      ),
                  ];
                })
              );
            }
            return field.__legacy?.filters?.impls ?? {};
          })
        ),
        applySearchField: (filter, search) => {
          const searchFieldName = lists[listKey].db?.searchField ?? 'name';
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
          const cacheHint = lists[listKey].graphql?.cacheHint;
          if (cacheHint === undefined) {
            return undefined;
          }
          return typeof cacheHint === 'function' ? cacheHint : () => cacheHint;
        })(),
        maxResults: lists[listKey].graphql?.queryLimits?.maxResults ?? Infinity,
        listKey,
      },
    ])
  );

  const getWhereInputResolvers = getFilterInputResolvers(initialisedLists);

  return {
    lists: initialisedLists,
    listsWithResolvedRelations: listsWithResolvedDBFields,
  };
}

function createAndUpdateInputResolvers(
  lists: Record<string, InitialisedList>,
  context: KeystoneContext
) {
  let ret: NestedMutationState = {
    resolvers: Object.fromEntries(
      Object.entries(lists).map(([listKey, list]) => {
        const create = async (input: any) => {
          const { afterChange, data } = await createOneState({ data: input }, list, context);
          // TODO: update this comment with the addition of using nested mutations + fetching the item by id after
          // we can only create the item from a nested mutation in the transaction if we have the id.
          // you might be asking, why not use prisma's nested mutations?

          // we can't for to-many relations because when if we do
          // prisma.item.create({ data: { others: { create: [{}] } } });
          // we don't have a way to get the item that was created in the nested mutation
          // and we need the item to call the afterChange hook
          // now we have the item that was created to call afterChange with
          // and it still happens in a transaction

          // we _technically_ could use prisma's nested mutations for to-one relations since there is just one item
          // we don't do that though because people should just use uuids(or some other id field that generates the value before getting to the db),
          // it's not worth the complexity to make this marginally better for something that we don't recommend
          if (data.id === undefined) {
            const item = await getPrismaModelForList(context.prisma, listKey).create({ data });
            await afterChange(item);
            return { kind: 'connect' as const, id: item.id };
          } else {
            ret.afterChanges.push(async () => {
              const item = await getPrismaModelForList(context.prisma, listKey).findUnique({
                where: { id: data.id },
              });
              if (!item) {
                throw new Error('could not find item after creating it');
              }
              await afterChange(item);
            });
            return { kind: 'create' as const, data };
          }
        };
        return [
          listKey,
          {
            create,
            uniqueWhere: input => resolveUniqueWhereInput(input, list.fields, context),
          },
        ];
      })
    ),
    afterChanges: [],
  };
  return ret;
}
