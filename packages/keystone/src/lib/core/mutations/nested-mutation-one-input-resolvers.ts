import { KeystoneContext, TypesForList } from '../../../types';
import { graphql } from '../../..';
import { resolveUniqueWhereInput } from '../where-inputs';
import { InitialisedList } from '../types-for-lists';
import { accessDeniedError, userInputError } from '../graphql-errors';
import { NestedMutationState } from './create-update';

type _CreateValueType = Exclude<
  graphql.InferValueFromArg<
    graphql.Arg<Exclude<TypesForList['relateTo']['one']['create'], undefined>>
  >,
  null | undefined
>;
type _UpdateValueType = Exclude<
  graphql.InferValueFromArg<
    graphql.Arg<graphql.NonNullType<Exclude<TypesForList['relateTo']['one']['update'], undefined>>>
  >,
  null | undefined
>;

async function handleCreateAndUpdate(
  value: _CreateValueType,
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList
) {
  if (value.connect) {
    // Validate and resolve the input filter
    const uniqueWhere = await resolveUniqueWhereInput(value.connect, foreignList.fields, context);
    // Check whether the item exists (from this users POV).
    try {
      const item = await context.db[foreignList.listKey].findOne({ where: value.connect });
      if (item === null) {
        // Use the same error message pattern as getFilteredItem()
        throw accessDeniedError(
          `You cannot perform the 'connect' operation on the item '${JSON.stringify(
            uniqueWhere
          )}'. It may not exist.`
        );
      }
    } catch (err) {
      throw accessDeniedError(
        `You cannot perform the 'connect' operation on the item '${JSON.stringify(
          uniqueWhere
        )}'. It may not exist.`
      );
    }
    return { connect: uniqueWhere };
  } else if (value.create) {
    const { id } = await nestedMutationState.create(value.create, foreignList);
    return { connect: { id } };
  }
}

export function resolveRelateToOneForCreateInput(
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList
) {
  return async (value: _CreateValueType) => {
    const numOfKeys = Object.keys(value).length;
    if (numOfKeys !== 1) {
      throw userInputError(
        `You must provide "connect" or "create" in to-one relationship inputs for 'create' operations.`
      );
    }
    return handleCreateAndUpdate(value, nestedMutationState, context, foreignList);
  };
}

export function resolveRelateToOneForUpdateInput(
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList
) {
  return async (value: _UpdateValueType) => {
    if (Object.keys(value).length !== 1) {
      throw userInputError(
        `You must provide one of "connect", "create" or "disconnect" in to-one relationship inputs for 'update' operations.`
      );
    }

    if (value.connect || value.create) {
      return handleCreateAndUpdate(value, nestedMutationState, context, foreignList);
    } else if (value.disconnect) {
      return { disconnect: true };
    }
  };
}
