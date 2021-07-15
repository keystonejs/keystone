import { KeystoneContext, TypesForList, schema } from '@keystone-next/types';
import { resolveUniqueWhereInput, UniqueInputFilter, UniquePrismaFilter } from '../where-inputs';
import { InitialisedList } from '../types-for-lists';
import { isRejected, isFulfilled } from '../utils';
import { NestedMutationState } from './create-update';

const isNotNull = <T>(arg: T): arg is Exclude<T, null> => arg !== null;

type _CreateValueType = schema.InferValueFromArg<
  schema.Arg<TypesForList['relateTo']['many']['create']>
>;

type _UpdateValueType = schema.InferValueFromArg<
  schema.Arg<TypesForList['relateTo']['many']['update']>
>;

async function getDisconnects(
  uniqueWheres: (UniqueInputFilter | null)[],
  context: KeystoneContext,
  foreignList: InitialisedList
): Promise<UniquePrismaFilter[]> {
  return (
    await Promise.all(
      uniqueWheres.map(async filter => {
        if (filter === null) return [];
        try {
          await context.sudo().db.lists[foreignList.listKey].findOne({ where: filter });
        } catch (err) {
          return [];
        }
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
    await context.db.lists[foreignList.listKey].findOne({ where: filter });
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
      result.connect.push({ id: createData.id });
    }
  }

  // Perform queries for the connections
  return result;
}

function assertValidManyOperation(
  val: Exclude<_UpdateValueType, undefined | null>,
  target: string
) {
  if (
    !Array.isArray(val.connect) &&
    !Array.isArray(val.create) &&
    !Array.isArray(val.disconnect) &&
    !val.disconnectAll
  ) {
    throw new Error(`Nested mutation operation invalid for ${target}`);
  }
}

export function resolveRelateToManyForCreateInput(
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList,
  target: string
) {
  return async (value: _CreateValueType) => {
    if (value == null) {
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
    if (value == null) {
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
