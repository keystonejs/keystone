import { KeystoneContext, TypesForList, schema } from '@keystone-next/types';
import { resolveUniqueWhereInput, UniqueInputFilter, UniquePrismaFilter } from '../where-inputs';
import { InitialisedList } from '../types-for-lists';
import { isRejected, isFulfilled } from '../utils';
import { NestedMutationState } from './create-update';

const isNotNull = <T>(arg: T): arg is Exclude<T, null> => arg !== null;

type _CreateValueType = Exclude<
  schema.InferValueFromArg<schema.Arg<TypesForList['relateTo']['many']['create']>>,
  null | undefined
>;

type _UpdateValueType = Exclude<
  schema.InferValueFromArg<schema.Arg<TypesForList['relateTo']['many']['update']>>,
  null | undefined
>;

async function getDisconnects(
  uniqueInputs: (UniqueInputFilter | null)[],
  context: KeystoneContext,
  foreignList: InitialisedList
): Promise<UniquePrismaFilter[]> {
  return (
    await Promise.all(
      uniqueInputs.map(async uniqueInput => {
        if (uniqueInput === null) return [];
        let uniqueWhere;
        try {
          // Validate and resolve the input filter
          uniqueWhere = await resolveUniqueWhereInput(uniqueInput, foreignList.fields, context);
          // Check whether the item exists
          await context.sudo().db.lists[foreignList.listKey].findOne({ where: uniqueInput });
        } catch (err) {
          return [];
        }
        return [uniqueWhere];
      })
    )
  ).flat();
}

function getConnects(
  uniqueInputs: UniqueInputFilter[],
  context: KeystoneContext,
  foreignList: InitialisedList
): Promise<UniquePrismaFilter>[] {
  return uniqueInputs.map(async uniqueInput => {
    // Validate and resolve the input filter
    const uniqueWhere = await resolveUniqueWhereInput(uniqueInput, foreignList.fields, context);
    // Check whether the item exists
    await context.db.lists[foreignList.listKey].findOne({ where: uniqueInput });
    return uniqueWhere;
  });
}

async function resolveCreateAndConnect(
  value: _UpdateValueType,
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

  const result = { connect: connectResult.filter(isFulfilled).map(x => x.value) };
  for (const createData of createResult.filter(isFulfilled).map(x => x.value)) {
    result.connect.push({ id: createData.id });
  }

  // Perform queries for the connections
  return result;
}

function assertValidManyOperation(val: _UpdateValueType, target: string) {
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
    assertValidManyOperation(value, target);
    const disconnects = getDisconnects(
      value.disconnectAll ? [] : value.disconnect || [],
      context,
      foreignList
    );

    const [disconnect, connect] = await Promise.all([
      disconnects,
      resolveCreateAndConnect(value, nestedMutationState, context, foreignList, target),
    ]);

    return { set: value.disconnectAll ? [] : undefined, disconnect, ...connect };
  };
}
