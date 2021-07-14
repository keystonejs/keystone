import { KeystoneContext, TypesForList, schema } from '@keystone-next/types';
import { UserInputError } from 'apollo-server-errors';
import { resolveUniqueWhereInput, UniqueInputFilter, UniquePrismaFilter } from '../where-inputs';
import { InitialisedList } from '../types-for-lists';
import { NestedMutationState } from './create-update';
import { isRejected, isFulfilled } from '.';

const isNotNull = <T>(arg: T): arg is Exclude<T, null> => arg !== null;

type _CreateValueType = Exclude<
  schema.InferValueFromArg<schema.Arg<TypesForList['relateTo']['many']['create']>>,
  undefined
>;

type _UpdateValueType = Exclude<
  schema.InferValueFromArg<schema.Arg<TypesForList['relateTo']['many']['update']>>,
  undefined
>;

async function getDisconnects(
  uniqueWheres: (UniqueInputFilter | null)[],
  context: KeystoneContext,
  foreignList: InitialisedList
): Promise<UniquePrismaFilter[]> {
  return (
    await Promise.all(
      uniqueWheres.map(async filter => {
        // null should be UserInputError if we want to be consistent
        if (filter === null) return [];
        try {
          await context.sudo().db.lists[foreignList.listKey].findOne({ where: filter });
        } catch (err) {
          return [];
        }
        // maybe UserInputError
        return [await resolveUniqueWhereInput(filter, foreignList.fields, context)];
      })
    )
  ).flat();
}

function getConnects(
  uniqueWhere: UniqueInputFilter[],
  context: KeystoneContext,
  foreignList: InitialisedList
): Promise<UniquePrismaFilter>[] {
  return uniqueWhere.map(async filter => {
    // null???
    await context.db.lists[foreignList.listKey].findOne({ where: filter });
    // maybe UserInputError
    return resolveUniqueWhereInput(filter, foreignList.fields, context);
  });
}

async function resolveCreateAndConnect(
  value: Exclude<_UpdateValueType, null | undefined>,
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList,
  target: string
) {
  // Perform queries for the connections
  // We filter on isNotNull, but really we should treat them as UserInputError
  const connects = Promise.allSettled(
    getConnects((value.connect || []).filter(isNotNull), context, foreignList)
  );

  // Perform nested mutations for the creations
  const creates = Promise.allSettled(
    (value.create || []).filter(isNotNull).map(x => nestedMutationState.create(x, foreignList))
  );

  const [connectResult, createResult] = await Promise.all([connects, creates]);

  // Collect all the errors
  const errors = [...connectResult.filter(isRejected), ...createResult.filter(isRejected)].map(
    x => x.reason
  );
  if (errors.length) {
    throw new Error(`Unable to create and/or connect ${errors.length} ${target}`);
  }

  const result = {
    connect: connectResult.filter(isFulfilled).map(x => x.value),
    create: [] as Record<string, any>[],
  };

  for (const createData of createResult.filter(isFulfilled).map(x => x.value)) {
    if (createData.kind === 'create') {
      result.create.push(createData.data);
    } else if (createData.kind === 'connect') {
      // Hmm, not sure when this code path would get hit?
      result.connect.push({ id: createData.id });
    }
  }

  // Return the create and connect values. At this point, the creates have
  // happened and we've got their IDs back, and we've validated the connect
  // inputs to make sure they're well formed.
  return result;
}

function assertValidManyOperation(val: Exclude<_UpdateValueType, null>, target: string) {
  if (
    !Array.isArray(val.connect) &&
    !Array.isArray(val.create) &&
    !Array.isArray(val.disconnect) &&
    !val.disconnectAll
  ) {
    throw new UserInputError(`Nested mutation operation invalid for ${target}`);
  }
}

export function resolveRelateToManyForCreateInput(
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList,
  target: string
) {
  return async (value: _CreateValueType) => {
    if (value === null) {
      // null input is currently just a no-op. Perhaps should be UserInputError?
      return undefined;
    }
    assertValidManyOperation(value, target);
    return resolveCreateAndConnect(value, nestedMutationState, context, foreignList, target);
  };
}

export function resolveRelateToManyForUpdateInput(
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList,
  target: string
) {
  return async (value: _UpdateValueType) => {
    if (value === null) {
      // null input is currently just a no-op. Perhaps should be UserInputError?
      return undefined;
    }
    assertValidManyOperation(value, target);
    const disconnects = getDisconnects(
      value.disconnectAll ? [] : value.disconnect || [],
      context,
      foreignList
    );

    const [disconnect, connectAndCreates] = await Promise.all([
      disconnects,
      resolveCreateAndConnect(value, nestedMutationState, context, foreignList, target),
    ]);

    return {
      set: value.disconnectAll ? [] : undefined,
      disconnect,
      ...connectAndCreates,
    };
  };
}
