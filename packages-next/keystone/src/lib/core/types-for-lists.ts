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
  Provider,
} from '@keystone-next/types';
// import { runInputResolvers } from './input-resolvers';
import { FieldHooks } from '@keystone-next/types/src/config/hooks';
import pluralize from 'pluralize';
import { validateFieldAccessControl, validateNonCreateListAccessControl } from './access-control';
import { getPrismaModelForList, IdType } from './utils';
import {
  getDBFieldPathForFieldOnMultiField,
  ListsWithResolvedRelations,
  ResolvedDBField,
  ResolvedRelationDBField,
  resolveRelationships,
} from './prisma-schema';
import { throwAccessDenied } from './ListTypes/graphqlErrors';
import {
  CreateAndUpdateInputResolvers,
  FilterInputResolvers,
  getFilterInputResolvers,
  resolveUniqueWhereInput,
} from './input-resolvers';
import { keyToLabel, labelToPath, labelToClass } from './ListTypes/utils';
import { createOne } from './mutation-resolvers';

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

export type InitialisedList = {
  fields: Record<string, InitialisedField>;
  singularGraphQLName: string;
  pluralGraphQLName: string;
  types: TypesForList;
  access: ResolvedListAccessControl;
  inputResolvers: {
    where: (context: KeystoneContext) => FilterInputResolvers['where'];
    createAndUpdate: (
      context: KeystoneContext
    ) => {
      resolvers: Record<string, CreateAndUpdateInputResolvers>;
      afterChange: () => Promise<void>;
    };
  };
  hooks: ListHooks<BaseGeneratedListTypes>;
  adminUILabels: { label: string; singular: string; plural: string; path: string };
};

function getRelationVal(
  dbField: ResolvedRelationDBField,
  id: IdType,
  localListKey: string,
  foreignList: InitialisedList,
  context: KeystoneContext
) {
  const getFilter = async () => {
    const access = await validateNonCreateListAccessControl({
      access: foreignList.access.read,
      args: {
        context,
        listKey: localListKey,
        operation: 'read',
        session: context.session,
      },
    });
    if (access === false) {
      return false;
    }
    const where = { [dbField.field]: { id } };
    if (access === true) {
      return where;
    }
    return { AND: [where, await foreignList.inputResolvers.where(context)(access)] };
  };
  if (dbField.mode === 'many') {
    return {
      findMany: async ({ first, skip, orderBy }: FindManyArgsValue) => {
        const filter = await getFilter();
        if (filter === false) {
          return [];
        }
        return getPrismaModelForList(context.prisma, dbField.list).findMany({
          where: filter,
          // TODO: needs to have input resolvers
          orderBy,
          take: first ?? undefined,
          skip,
        });
      },
      count: async ({ first, skip, orderBy }: FindManyArgsValue) => {
        const filter = await getFilter();
        if (filter === false) {
          return 0;
        }
        return getPrismaModelForList(context.prisma, dbField.list).count({
          where: filter,
          // TODO: needs to have input resolvers
          orderBy,
          take: first ?? undefined,
          skip,
        });
      },
    };
  }

  return async () => {
    const filter = await getFilter();
    if (filter === false) {
      return false;
    }

    return getPrismaModelForList(context.prisma, dbField.list).findFirst({
      where: filter,
    });
  };
}

function getValueForDBField(
  rootVal: ItemRootValue,
  dbField: ResolvedDBField,
  id: IdType,
  listKey: string,
  fieldPath: string,
  context: KeystoneContext,
  lists: Record<string, InitialisedList>
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
    return getRelationVal(dbField, id, listKey, lists[dbField.list], context);
  }
  return rootVal[fieldPath] as any;
}

function outputTypeField(
  output: NextFieldType['output'],
  dbField: ResolvedDBField,
  cacheHint: CacheHint | undefined,
  access: IndividualFieldAccessControl<FieldReadAccessArgs>,
  listKey: string,
  fieldPath: string,
  lists: Record<string, InitialisedList>
) {
  return types.field<ItemRootValue, any, any, string, KeystoneContext>({
    type: output.type,
    deprecationReason: output.deprecationReason,
    description: output.description,
    args: output.args,
    extensions: output.extensions,
    async resolve(rootVal, args, context, info) {
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

      const value = getValueForDBField(rootVal, dbField, id, listKey, fieldPath, context, lists);

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
}

type ResolvedFieldAccessControl = {
  read: IndividualFieldAccessControl<FieldReadAccessArgs>;
  create: IndividualFieldAccessControl<FieldCreateAccessArgs>;
  update: IndividualFieldAccessControl<FieldUpdateAccessArgs>;
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

  const _itemQueryName = graphql?.itemQueryName || labelToClass(_singular);
  const _listQueryName = graphql?.itemQueryName || labelToClass(_plural);
  return {
    singularGraphQLName: _itemQueryName,
    pluralGraphQLName: _listQueryName,
    adminUILabels,
  };
}

export function initialiseLists(
  lists: KeystoneConfig['lists'],
  provider: Provider
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
                    field.cacheHint,
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
    const uniqueWhere = types.inputObject({
      name: names.whereUniqueInputName,
      fields: () => {
        const { fields } = listsWithInitialisedFieldsAndResolvedDbFields[listKey];
        return Object.fromEntries(
          Object.entries(fields).flatMap(([key, field]) => {
            if (!field.input?.uniqueWhere || field.access.read === false) return [];
            return [[key, field.input.uniqueWhere.arg]] as const;
          })
        );
      },
    });
    // TODO: validate no fields are named AND, NOT, or OR
    const where: TypesForList['where'] = types.inputObject({
      name: names.whereInputName,
      fields: () => {
        const { fields } = listsWithInitialisedFieldsAndResolvedDbFields[listKey];
        return {
          AND: types.arg({
            type: types.list(types.nonNull(where)),
          }),
          OR: types.arg({
            type: types.list(types.nonNull(where)),
          }),
          NOT: types.arg({
            type: types.list(types.nonNull(where)),
          }),
          ...Object.fromEntries(
            Object.entries(fields).flatMap(([key, field]) => {
              if (!field.input?.where?.arg || field.access.read === false) return [];
              return [[key, field.input.where.arg]] as const;
            })
          ),
        };
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
      name: names.listSortName,
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

    const manyRelationWhere = types.inputObject({
      name: names.manyRelationFilter,
      fields: {
        every: types.arg({ type: where }),
        some: types.arg({ type: where }),
        none: types.arg({ type: where }),
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
        manyRelationWhere,
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
      return [
        listKey,
        {
          ...list,
          access: parseListAccessControl(list.access),
          fields: Object.fromEntries(
            Object.entries(list.fields).map(([fieldKey, field]) => [
              fieldKey,
              {
                ...field,
                access: parseFieldAccessControl(field.access),
                dbField: listsWithResolvedDBFields[listKey].fields[fieldKey],
                hooks: field.hooks ?? {},
              },
            ])
          ),
        },
      ];
    })
  );

  for (const [listKey, { fields }] of Object.entries(
    listsWithInitialisedFieldsAndResolvedDbFields
  )) {
    assertNoConflictingExtraOutputFields(listKey, fields);
    assertIdFieldGraphQLTypesCorrect(listKey, fields);
  }

  const getWhereInputResolvers = getFilterInputResolvers(
    listsWithInitialisedFieldsAndResolvedDbFields
  );

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
      },
    ])
  );

  return {
    lists: initialisedLists,
    listsWithResolvedRelations: listsWithResolvedDBFields,
  };
}

function createAndUpdateInputResolvers(
  lists: Record<string, InitialisedList>,
  context: KeystoneContext
) {
  let ret: {
    resolvers: Record<string, CreateAndUpdateInputResolvers>;
    afterChange: () => Promise<void>;
  } = {
    resolvers: Object.fromEntries(
      Object.entries(lists).map(([listKey, list]) => {
        return [
          listKey,
          {
            create: async input => {
              return (await createOne({ data: input }, listKey, list, context)).id;
            },
            uniqueWhere: input => resolveUniqueWhereInput(input, list.fields, context),
          },
        ];
      })
    ),
    afterChange: async () => {},
  };
  return ret;
}
