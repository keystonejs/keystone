import {
  NextFieldType,
  CacheHint,
  IndividualFieldAccessControl,
  FieldReadAccessArgs,
  BaseGeneratedListTypes,
  ItemRootValue,
  schema,
  FindManyArgsValue,
  KeystoneContext,
} from '@keystone-next/types';
import { GraphQLResolveInfo } from 'graphql';
import { validateFieldAccessControl, validateNonCreateListAccessControl } from '../access-control';
import { AccessDeniedError } from '../graphql-errors';
import { resolveWhereInput } from '../where-inputs';
import { ResolvedDBField, ResolvedRelationDBField } from '../resolve-relationships';
import { InitialisedList } from '../types-for-lists';
import {
  applyFirstSkipToCount,
  getPrismaModelForList,
  IdType,
  getDBFieldKeyForFieldOnMultiField,
} from '../utils';
import { findMany, findManyFilter } from './resolvers';

function getRelationVal(
  dbField: ResolvedRelationDBField,
  id: IdType,
  foreignList: InitialisedList,
  context: KeystoneContext,
  info: GraphQLResolveInfo
) {
  const oppositeDbField = foreignList.resolvedDbFields[dbField.field];
  if (oppositeDbField.kind !== 'relation') throw new Error('failed assert');
  const relationFilter = {
    [dbField.field]: oppositeDbField.mode === 'many' ? { some: { id } } : { id },
  };
  if (dbField.mode === 'many') {
    return {
      findMany: async (args: FindManyArgsValue) => {
        return findMany(args, foreignList, context, info, relationFilter);
      },
      count: async ({ where, search, first, skip }: FindManyArgsValue) => {
        // Maybe KS_ACCESS_DENIED
        const filter = await findManyFilter(foreignList, context, where, search);

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
  } else {
    return async () => {
      const access = await validateNonCreateListAccessControl({
        access: foreignList.access.read,
        args: { context, listKey: dbField.list, operation: 'read', session: context.session },
      });
      if (access === false) {
        throw AccessDeniedError();
      }

      return getPrismaModelForList(context.prisma, dbField.list).findFirst({
        where:
          access === true
            ? relationFilter
            : { AND: [relationFilter, await resolveWhereInput(access, foreignList)] },
      });
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
    return getRelationVal(dbField, id, lists[dbField.list], context, info);
  } else {
    return rootVal[fieldPath] as any;
  }
}

export function outputTypeField(
  output: NextFieldType['output'],
  dbField: ResolvedDBField,
  cacheHint: CacheHint | undefined,
  access: IndividualFieldAccessControl<FieldReadAccessArgs<BaseGeneratedListTypes>>,
  listKey: string,
  fieldKey: string,
  lists: Record<string, InitialisedList>
) {
  return schema.field({
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
          fieldKey,
          item: rootVal,
          listKey,
          operation: 'read' as const,
          session: context.session,
        },
      });
      if (!canAccess) {
        // If the client handles errors correctly, it should be able to
        // receive partial data (for the fields the user has access to),
        // and then an `errors` array of AccessDeniedError's
        throw AccessDeniedError();
      }

      // Only static cache hints are supported at the field level until a use-case makes it clear what parameters a dynamic hint would take
      if (cacheHint && info && info.cacheControl) {
        info.cacheControl.setCacheHint(cacheHint as any);
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
