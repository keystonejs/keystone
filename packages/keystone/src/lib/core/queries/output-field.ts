import { CacheHint } from 'apollo-server-types';
import { GraphQLResolveInfo } from 'graphql';
import {
  NextFieldType,
  IndividualFieldAccessControl,
  BaseGeneratedListTypes,
  ItemRootValue,
  graphql,
  FindManyArgsValue,
  KeystoneContext,
  TypesForList,
  FieldReadItemAccessArgs,
} from '../../../types';
import {
  getOperationAccess,
  getAccessFilters,
  validateFieldAccessControl,
} from '../access-control';
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
      // Check operation permission to pass into single operation
      const operationAccess = await getOperationAccess(foreignList, context, 'query');
      if (!operationAccess) {
        return null;
      }

      const accessFilters = await getAccessFilters(foreignList, context, 'query');
      if (accessFilters === false) {
        return null;
      }

      // Check filter access?
      // There's no need to check filter access here (c.f. `findOne()`), as
      // the filter has been construct internally, not as part of user input.

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
