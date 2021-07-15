import { KeystoneContext, TypesForList, schema } from '@keystone-next/types';
import { resolveUniqueWhereInput } from '../where-inputs';
import { InitialisedList } from '../types-for-lists';
import { findOne } from '../queries/resolvers';
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
      await findOne({ where: value.connect }, foreignList, context);
    } catch (err) {
      throw new Error(`Unable to connect a ${target}`);
    }
    const connect = await resolveUniqueWhereInput(value.connect, foreignList.fields, context);
    return { connect };
  } else if (value.create) {
    const createInput = value.create;
    let create = await (async () => {
      try {
        // Perform the nested create operation
        return await nestedMutationState.create(createInput, foreignList);
      } catch (err) {
        throw new Error(`Unable to create a ${target}`);
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
    if (value == null) {
      return undefined;
    }
    const numOfKeys = Object.keys(value).length;
    if (numOfKeys !== 1) {
      throw new Error(`Nested mutation operation invalid for ${target}`);
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
    if (value == null) {
      return undefined;
    }

    if (value.connect && value.create) {
      throw new Error(`Nested mutation operation invalid for ${target}`);
    }

    if (value.connect || value.create) {
      return handleCreateAndUpdate(value, nestedMutationState, context, foreignList, target);
    } else if (value.disconnect) {
      try {
        await findOne({ where: value.disconnect }, foreignList, context);
      } catch (err) {
        return;
      }
      return { disconnect: true };
    } else if (value.disconnectAll) {
      return { disconnect: true };
    }
  };
}
