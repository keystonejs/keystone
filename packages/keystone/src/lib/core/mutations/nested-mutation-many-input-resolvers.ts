import { KeystoneContext, TypesForList, schema } from '@keystone-next/types';
import { resolveUniqueWhereInput, UniqueInputFilter, UniquePrismaFilter } from '../where-inputs';
import { InitialisedList } from '../types-for-lists';
import { isRejected, isFulfilled } from '../utils';
import { NestedMutationState } from './create-update';

type _CreateValueType = Exclude<
  schema.InferValueFromArg<schema.Arg<TypesForList['relateTo']['many']['create']>>,
  null | undefined
>;

type _UpdateValueType = Exclude<
  schema.InferValueFromArg<schema.Arg<TypesForList['relateTo']['many']['update']>>,
  null | undefined
>;

function getResolvedUniqueWheres(
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
  value: _CreateValueType,
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList,
  target: string
) {}

export function resolveRelateToManyForCreateInput(
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList,
  target: string
) {
  return async (value: _CreateValueType) => {
    if (!Array.isArray(value.connect) && !Array.isArray(value.create)) {
      throw new Error(
        `You must provide at least one field in to-many relationship fields but none were provided at ${target}`
      );
    }

    // Perform queries for the connections
    const connects = Promise.allSettled(
      getResolvedUniqueWheres(value.connect || [], context, foreignList)
    );

    // Perform nested mutations for the creations
    const creates = Promise.allSettled(
      (value.create || []).map(x => nestedMutationState.create(x, foreignList))
    );

    const [connectResult, createResult] = await Promise.all([connects, creates]);

    // Collect all the errors
    const errors = [...connectResult.filter(isRejected), ...createResult.filter(isRejected)].map(
      x => x.reason
    );
    if (errors.length) {
      throw new Error(`Unable to create, connect ${errors.length} ${target}`);
    }

    const result = {
      connect: [...connectResult, ...createResult].filter(isFulfilled).map(x => x.value),
    };

    // Perform queries for the connections
    return result;
  };
}

export function resolveRelateToManyForUpdateInput(
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList,
  target: string
) {
  return async (value: _UpdateValueType) => {
    if (
      !Array.isArray(value.connect) &&
      !Array.isArray(value.create) &&
      !Array.isArray(value.disconnect) &&
      !Array.isArray(value.set)
    ) {
      throw new Error(
        `You must provide at least one field in to-many relationship fields but none were provided at ${target}`
      );
    }
    if (value.set && value.disconnect) {
      throw new Error(
        `The set and disconnect fields cannot both be provided to to-many relationship inputs but both were provided at ${target}`
      );
    }
    const disconnects = getResolvedUniqueWheres(value.disconnect || [], context, foreignList);

    const [disconnect, connect] = await Promise.all([
      disconnects,
      resolveCreateAndConnect(value, nestedMutationState, context, foreignList, target),
    ]);

    return { set: value.set ? [] : undefined, disconnect, ...connect };
  };
}
