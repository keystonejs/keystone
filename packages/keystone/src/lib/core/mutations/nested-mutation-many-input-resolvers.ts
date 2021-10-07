import { KeystoneContext, TypesForList } from '../../../types';
import { graphql } from '../../..';
import { resolveUniqueWhereInput, UniqueInputFilter, UniquePrismaFilter } from '../where-inputs';
import { InitialisedList } from '../types-for-lists';
import { isRejected, isFulfilled } from '../utils';
import { accessDeniedError, userInputError } from '../graphql-errors';
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
  foreignList: InitialisedList,
  operation: string
): Promise<UniquePrismaFilter>[] {
  return uniqueInputs.map(async uniqueInput => {
    // Validate and resolve the input filter
    const uniqueWhere = await resolveUniqueWhereInput(uniqueInput, foreignList.fields, context);
    // Check whether the item exists (from this users POV).
    try {
      const item = await context.db[foreignList.listKey].findOne({ where: uniqueInput });
      if (item === null) {
        // Use the same error message pattern as getFilteredItem()
        throw accessDeniedError(
          `You cannot perform the '${operation}' operation on the item '${JSON.stringify(
            uniqueWhere
          )}'. It may not exist.`
        );
      }
    } catch (err) {
      throw accessDeniedError(
        `You cannot perform the '${operation}' operation on the item '${JSON.stringify(
          uniqueWhere
        )}'. It may not exist.`
      );
    }
    return uniqueWhere;
  });
}

export function resolveRelateToManyForCreateInput(
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList,
  relationshipErrors: { error: Error; tag: string }[],
  tag: string
) {
  return async (value: _CreateValueType) => {
    if (!Array.isArray(value.connect) && !Array.isArray(value.create)) {
      throw userInputError(
        `You must provide "connect" or "create" in to-many relationship inputs for "create" operations.`
      );
    }

    // Perform queries for the connections
    const connects = Promise.allSettled(
      getResolvedUniqueWheres(value.connect || [], context, foreignList, 'connect')
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
      relationshipErrors.push(...errors.map((error: Error) => ({ error, tag })));
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
  relationshipErrors: { error: Error; tag: string }[],
  tag: string
) {
  return async (value: _UpdateValueType) => {
    if (
      !Array.isArray(value.connect) &&
      !Array.isArray(value.create) &&
      !Array.isArray(value.disconnect) &&
      !Array.isArray(value.set)
    ) {
      throw userInputError(
        `You must provide at least one of "set", "connect", "create" or "disconnect" in to-many relationship inputs for "update" operations.`
      );
    }
    if (value.set && value.disconnect) {
      throw userInputError(
        `The "set" and "disconnect" fields cannot both be provided to to-many relationship inputs for "update" operations.`
      );
    }

    // Perform queries for the connections
    const connects = Promise.allSettled(
      getResolvedUniqueWheres(value.connect || [], context, foreignList, 'connect')
    );

    const disconnects = Promise.allSettled(
      getResolvedUniqueWheres(value.disconnect || [], context, foreignList, 'disconnect')
    );

    const sets = Promise.allSettled(
      getResolvedUniqueWheres(value.set || [], context, foreignList, 'set')
    );

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
    ].map(x => x.reason);
    if (errors.length) {
      relationshipErrors.push(...errors.map((error: Error) => ({ error, tag })));
    }

    return {
      // unlike all the other operations, an empty array isn't a no-op for set
      set: value.set ? setResult.filter(isFulfilled).map(x => x.value) : undefined,
      disconnect: disconnectResult.filter(isFulfilled).map(x => x.value),
      connect: [...connectResult, ...createResult].filter(isFulfilled).map(x => x.value),
    };
  };
}
