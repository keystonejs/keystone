import { KeystoneContext, TypesForList, schema } from '@keystone-next/types';
import { UserInputError } from 'apollo-server-errors';
import { resolveUniqueWhereInput } from '../where-inputs';
import { InitialisedList } from '../types-for-lists';
import { NestedError } from '../graphql-errors';
import { NestedMutationState } from './create-update';

type _CreateValueType = schema.InferValueFromArg<
  schema.Arg<TypesForList['relateTo']['one']['create']>
>;
type _UpdateValueType = schema.InferValueFromArg<
  schema.Arg<schema.NonNullType<TypesForList['relateTo']['one']['update']>>
>;

async function handleCreateAndUpdate(
  value: Exclude<_CreateValueType, null | undefined>,
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList,
  target: string
) {
  if (value.connect) {
    try {
      await context.db.lists[foreignList.listKey].findOne({ where: value.connect });
    } catch (err) {
      // Probably an access control error?
      // NestedError...?
      throw NestedError(`Unable to connect a ${target}`);
    }
    // maybe UserInputError
    const connect = await resolveUniqueWhereInput(value.connect, foreignList.fields, context);
    return { connect };
  } else if (value.create) {
    const createInput = value.create;
    let create = await (async () => {
      try {
        // Perform the nested create operation
        return await nestedMutationState.create(createInput, foreignList);
      } catch (err) {
        // Need to think about all the things this could be... should we
        // perhaps just re-raise an apollo error with this error?
        throw NestedError(`Unable to create a ${target}`);
      }
    })();

    if (create.kind === 'connect') {
      return { connect: { id: create.id } };
    } else {
      return { create: create.data };
    }
  }
}

export function resolveRelateToOneForCreateInput(
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList,
  target: string
) {
  return async (value: _CreateValueType) => {
    // == coerces undefined here as well...
    if (value == null) {
      // null input is just a no-op. Perhaps should be UserInputError?
      return undefined;
    }
    const numOfKeys = Object.keys(value).length;
    if (numOfKeys !== 1) {
      throw new UserInputError(`Relationship field ${target} accepts exactly one input value.`);
    }
    return handleCreateAndUpdate(value, nestedMutationState, context, foreignList, target);
  };
}

export function resolveRelateToOneForUpdateInput(
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
    const numOfKeys = Object.keys(value).length;
    if (numOfKeys !== 1) {
      throw new UserInputError(`Relationship field ${target} accepts exactly one input value.`);
    }

    if (value.connect || value.create) {
      return handleCreateAndUpdate(value, nestedMutationState, context, foreignList, target);
    } else if (value.disconnect) {
      try {
        await context.sudo().db.lists[foreignList.listKey].findOne({ where: value.disconnect });
      } catch (err) {
        // Do nothing if we can't find the item they asked to disconnect...?
        return;
      }
      return { disconnect: true };
    } else if (value.disconnectAll) {
      return { disconnect: true };
    }
  };
}
