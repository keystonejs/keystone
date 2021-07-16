import { KeystoneContext, TypesForList, schema } from '@keystone-next/types';
import { resolveUniqueWhereInput } from '../where-inputs';
import { InitialisedList } from '../types-for-lists';
import { NestedMutationState } from './create-update';

type _CreateValueType = Exclude<
  schema.InferValueFromArg<schema.Arg<TypesForList['relateTo']['one']['create']>>,
  null | undefined
>;
type _UpdateValueType = Exclude<
  schema.InferValueFromArg<
    schema.Arg<schema.NonNullType<TypesForList['relateTo']['one']['update']>>
  >,
  null | undefined
>;

async function handleCreateAndUpdate(
  value: _CreateValueType,
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList,
  target: string
) {
  if (value.connect) {
    // Validate and resolve the input filter
    const uniqueWhere = await resolveUniqueWhereInput(value.connect, foreignList.fields, context);
    // Check whether the item exists
    try {
      await context.db.lists[foreignList.listKey].findOne({ where: value.connect });
    } catch (err) {
      throw new Error(`Unable to connect a ${target}`);
    }
    return { connect: uniqueWhere };
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
    if (value.connect && value.create) {
      throw new Error(`Nested mutation operation invalid for ${target}`);
    }

    if (value.connect || value.create) {
      return handleCreateAndUpdate(value, nestedMutationState, context, foreignList, target);
    } else if (value.disconnect) {
      try {
        await context.sudo().db.lists[foreignList.listKey].findOne({ where: value.disconnect });
      } catch (err) {
        return;
      }
      return { disconnect: true };
    } else if (value.disconnectAll) {
      return { disconnect: true };
    }
  };
}
