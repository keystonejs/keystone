import { KeystoneContext, TypesForList, graphql } from '../../../types';
import { resolveUniqueWhereInput, UniqueInputFilter, UniquePrismaFilter } from '../where-inputs';
import { InitialisedList } from '../types-for-lists';
import { isRejected, isFulfilled } from '../utils';
import { userInputError } from '../graphql-errors';
import { NestedMutationState } from './create-update';

type _CreateValueType = Exclude<
  graphql.InferValueFromArg<
    graphql.Arg<Exclude<TypesForList['relateTo']['many']['create'], undefined>>
  >,
  null | undefined
>;

type _UpdateValueType = Exclude<
  graphql.InferValueFromArg<
    graphql.Arg<Exclude<TypesForList['relateTo']['many']['update'], undefined>>
  >,
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
    const item = await context.db.lists[foreignList.listKey].findOne({ where: uniqueInput });
    if (item === null) {
      throw new Error('Unable to find item to connect to.');
    }
    return uniqueWhere;
  });
}

export function resolveRelateToManyForCreateInput(
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList,
  target: string
) {
  return async (value: _CreateValueType) => {
    if (!Array.isArray(value.connect) && !Array.isArray(value.create)) {
      throw userInputError(
        `You must provide at least one field in to-many relationship inputs but none were provided at ${target}`
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
      throw new Error(`Unable to create and/or connect ${errors.length} ${target}`);
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
      throw userInputError(
        `You must provide at least one field in to-many relationship inputs but none were provided at ${target}`
      );
    }
    if (value.set && value.disconnect) {
      throw userInputError(
        `The set and disconnect fields cannot both be provided to to-many relationship inputs but both were provided at ${target}`
      );
    }

    // Perform queries for the connections
    const connects = Promise.allSettled(
      getResolvedUniqueWheres(value.connect || [], context, foreignList)
    );

    const disconnects = Promise.allSettled(
      getResolvedUniqueWheres(value.disconnect || [], context, foreignList)
    );

    const sets = Promise.allSettled(getResolvedUniqueWheres(value.set || [], context, foreignList));

    // Perform nested mutations for the creations
    const creates = Promise.allSettled(
      (value.create || []).map(x => nestedMutationState.create(x, foreignList))
    );

    const [connectResult, createResult, disconnectResult, setResult] = await Promise.all([
      connects,
      creates,
      disconnects,
      sets,
    ]);

    // Collect all the errors
    const errors = [
      ...connectResult.filter(isRejected),
      ...createResult.filter(isRejected),
      ...disconnectResult.filter(isRejected),
      ...setResult.filter(isRejected),
    ];
    if (errors.length) {
      throw new Error(
        `Unable to create, connect, disconnect and/or set ${errors.length} ${target}`
      );
    }

    return {
      // unlike all the other operations, an empty array isn't a no-op for set
      set: value.set ? setResult.filter(isFulfilled).map(x => x.value) : undefined,
      disconnect: disconnectResult.filter(isFulfilled).map(x => x.value),
      connect: [...connectResult, ...createResult].filter(isFulfilled).map(x => x.value),
    };
  };
}
