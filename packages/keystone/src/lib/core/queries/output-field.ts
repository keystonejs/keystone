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
  TypesForList,
} from '@keystone-next/types';
import { GraphQLResolveInfo } from 'graphql';
import { validateFieldAccessControl } from '../access-control';
import { accessDeniedError } from '../graphql-errors';
import { ResolvedDBField, ResolvedRelationDBField } from '../resolve-relationships';
import { InitialisedList } from '../types-for-lists';
import { IdType, getDBFieldKeyForFieldOnMultiField, runWithPrisma } from '../utils';
import { accessControlledFilter } from './resolvers';
import * as queries from './resolvers';

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
      findMany: async (args: FindManyArgsValue) =>
        queries.findMany(args, foreignList, context, info, relationFilter),
      count: async ({ where }: { where: TypesForList['where'] }) =>
        queries.count({ where }, foreignList, context, info, relationFilter),
    };
  } else {
    return async () => {
      const resolvedWhere = await accessControlledFilter(foreignList, context, relationFilter);

      return runWithPrisma(context, foreignList, model =>
        model.findFirst({ where: resolvedWhere })
      );
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
          operation: 'read',
          session: context.session,
        },
      });
      if (!canAccess) {
        // If the client handles errors correctly, it should be able to
        // receive partial data (for the fields the user has access to),
        // and then an `errors` array of AccessDeniedError's
        throw accessDeniedError();
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
