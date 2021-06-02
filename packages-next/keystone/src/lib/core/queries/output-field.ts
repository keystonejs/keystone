import {
  NextFieldType,
  CacheHint,
  IndividualFieldAccessControl,
  FieldReadAccessArgs,
  BaseGeneratedListTypes,
  ItemRootValue,
  types,
  FindManyArgsValue,
  KeystoneContext,
} from '@keystone-next/types';
import { GraphQLResolveInfo } from 'graphql';
import { validateFieldAccessControl, validateNonCreateListAccessControl } from '../access-control';
import { accessDeniedError } from '../graphql-errors';
import { resolveWhereInput } from '../where-inputs';
import {
  getDBFieldKeyForFieldOnMultiField,
  ResolvedDBField,
  ResolvedRelationDBField,
} from '../prisma-schema';
import { InitialisedList } from '../types-for-lists';
import { applyFirstSkipToCount, getPrismaModelForList, IdType } from '../utils';
import { findMany, findManyFilter } from './resolvers';

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
          : { AND: [relationFilter, await resolveWhereInput(access, foreignList)] },
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
        const keyOnDbValue = getDBFieldKeyForFieldOnMultiField(fieldPath, innerDBFieldKey);
        return [innerDBFieldKey, rootVal[keyOnDbValue] as any];
      })
    );
  }
  if (dbField.kind === 'relation') {
    return getRelationVal(dbField, id, lists[dbField.list], context, info);
  }
  return rootVal[fieldPath] as any;
}

export function outputTypeField(
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
        throw accessDeniedError('query', fieldPath, { itemId: rootVal.id });
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
