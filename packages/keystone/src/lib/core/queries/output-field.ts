import { CacheHint } from 'apollo-server-types';
import { GraphQLResolveInfo } from 'graphql';
import {
  NextFieldType,
  IndividualFieldAccessControl,
  BaseGeneratedListTypes,
  ItemRootValue,
  FindManyArgsValue,
  KeystoneContext,
  TypesForList,
  FieldReadItemAccessArgs,
} from '../../../types';
import { graphql } from '../../..';
import { getOperationAccess, getAccessFilters } from '../access-control';
import { ResolvedDBField, ResolvedRelationDBField } from '../resolve-relationships';
import { InitialisedList } from '../types-for-lists';
import { IdType, getDBFieldKeyForFieldOnMultiField, runWithPrisma } from '../utils';
import { accessReturnError, extensionError } from '../graphql-errors';
import { accessControlledFilter } from './resolvers';
import * as queries from './resolvers';

function getRelationVal(
  dbField: ResolvedRelationDBField,
  id: IdType,
  foreignList: InitialisedList,
  context: KeystoneContext,
  info: GraphQLResolveInfo,
  fk?: IdType
) {
  const oppositeDbField = foreignList.resolvedDbFields[dbField.field];
  if (oppositeDbField.kind !== 'relation') throw new Error('failed assert');

  if (dbField.mode === 'many') {
    const relationFilter = {
      [dbField.field]: oppositeDbField.mode === 'many' ? { some: { id } } : { id },
    };
    return {
      findMany: async (args: FindManyArgsValue) =>
        queries.findMany(args, foreignList, context, info, relationFilter),
      count: async ({ where }: { where: TypesForList['where'] }) =>
        queries.count({ where }, foreignList, context, info, relationFilter),
    };
  } else {
    return async () => {
      if (fk === null) {
        // If the foreign key is explicitly null, there's no need to anything else,
        // since we know the related item doesn't exist.
        return null;
      }
      // Check operation permission to pass into single operation
      const operationAccess = await getOperationAccess(foreignList, context, 'query');
      if (!operationAccess) {
        return null;
      }
      const accessFilters = await getAccessFilters(foreignList, context, 'query');
      if (accessFilters === false) {
        return null;
      }

      if (accessFilters === true && fk !== undefined) {
        // We know the exact item we're looking for, and there are no other filters to apply,
        // so we can use findUnique to get the item. This allows Prisma to group multiple
        // findUnique operations into a single database query, which solves the N+1 problem
        // in this specific case.
        return runWithPrisma(context, foreignList, model =>
          model.findUnique({ where: { id: fk } })
        );
      } else {
        // Either we have access filters to apply, or we don't have a foreign key to use.
        // If we have a foreign key, we'll search directly on this ID, and merge in the access filters.
        // If we don't have a foreign key, we'll use the general solution, which is a filter based
        // on the original item's ID, merged with any access control filters.
        const relationFilter =
          fk !== undefined
            ? { id: fk }
            : { [dbField.field]: oppositeDbField.mode === 'many' ? { some: { id } } : { id } };

        // There's no need to check isFilterable access here (c.f. `findOne()`), as
        // the filter has been constructed internally, not as part of user input.

        // Apply access control
        const resolvedWhere = await accessControlledFilter(
          foreignList,
          context,
          relationFilter,
          accessFilters
        );
        return runWithPrisma(context, foreignList, model =>
          model.findFirst({ where: resolvedWhere })
        );
      }
    };
  }
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
        const keyOnDbValue = getDBFieldKeyForFieldOnMultiField(fieldPath, innerDBFieldKey);
        return [innerDBFieldKey, rootVal[keyOnDbValue] as any];
      })
    );
  }
  if (dbField.kind === 'relation') {
    // If we're holding a foreign key value, let's take advantage of that.
    let fk: IdType | undefined;
    if (dbField.mode === 'one' && dbField.foreignIdField.kind !== 'none') {
      fk = rootVal[`${fieldPath}Id`] as IdType;
    }
    return getRelationVal(dbField, id, lists[dbField.list], context, info, fk);
  } else {
    return rootVal[fieldPath] as any;
  }
}

export function outputTypeField(
  output: NextFieldType['output'],
  dbField: ResolvedDBField,
  cacheHint: CacheHint | undefined,
  access: IndividualFieldAccessControl<FieldReadItemAccessArgs<BaseGeneratedListTypes>>,
  listKey: string,
  fieldKey: string,
  lists: Record<string, InitialisedList>
) {
  return graphql.field({
    type: output.type,
    deprecationReason: output.deprecationReason,
    description: output.description,
    args: output.args,
    extensions: output.extensions,
    async resolve(rootVal: ItemRootValue, args, context, info) {
      const id = (rootVal as any).id as IdType;

      // Check access
      let canAccess;
      try {
        canAccess =
          typeof access === 'function'
            ? await access({
                context,
                fieldKey,
                item: rootVal,
                listKey,
                operation: 'read',
                session: context.session,
              })
            : access;
      } catch (error: any) {
        throw extensionError('Access control', [
          { error, tag: `${listKey}.${fieldKey}.access.read` },
        ]);
      }
      if (typeof canAccess !== 'boolean') {
        throw accessReturnError([
          { tag: `${listKey}.${fieldKey}.access.read`, returned: typeof canAccess },
        ]);
      }
      if (!canAccess) {
        return null;
      }

      // Only static cache hints are supported at the field level until a use-case makes it clear what parameters a dynamic hint would take
      if (cacheHint && info && info.cacheControl) {
        info.cacheControl.setCacheHint(cacheHint);
      }

      const value = getValueForDBField(rootVal, dbField, id, fieldKey, context, lists, info);

      if (output.resolve) {
        return output.resolve({ value, item: rootVal }, args, context, info);
      } else {
        return value;
      }
    },
  });
}
