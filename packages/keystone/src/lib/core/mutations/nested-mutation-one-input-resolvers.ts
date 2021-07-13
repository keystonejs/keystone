import { KeystoneContext, TypesForList, schema } from '@keystone-next/types';
import { resolveUniqueWhereInput } from '../where-inputs';
import { InitialisedList } from '../types-for-lists';
import { NestedMutationState } from './create-update';

async function handleCreateAndUpdate(
  value: Exclude<
    schema.InferValueFromArg<schema.Arg<TypesForList['relateTo']['one']['create']>>,
    null | undefined
  >,
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList,
  target: string
) {
  if (value.connect) {
    try {
      await context.db.lists[foreignList.listKey].findOne({ where: value.connect as any });
    } catch (err) {
      throw new Error(`Unable to connect a ${target}`);
    }
    return {
      connect: await resolveUniqueWhereInput(value.connect, foreignList.fields, context),
    };
  }
  if (value.create) {
    const createInput = value.create;
    let create = await (async () => {
      try {
        return await nestedMutationState.create(createInput, foreignList);
      } catch (err) {
        throw new Error(`Unable to create a ${target}`);
      }
    })();

    if (create.kind === 'connect') {
      return { connect: { id: create.id } };
    }
    return { create: create.data };
  }
}

export function resolveRelateToOneForCreateInput(
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList,
  target: string
) {
  return async (
    value: schema.InferValueFromArg<schema.Arg<TypesForList['relateTo']['one']['create']>>
  ) => {
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
  return async (
    value: schema.InferValueFromArg<
      schema.Arg<schema.NonNullType<TypesForList['relateTo']['one']['update']>>
    >
  ) => {
    if (value == null) {
      return undefined;
    }
    if (value.connect && value.create) {
      throw new Error(`Nested mutation operation invalid for ${target}`);
    }
    if (value.connect || value.create) {
      return handleCreateAndUpdate(value, nestedMutationState, context, foreignList, target);
    }
    if (value.disconnect) {
      try {
        await context
          .sudo()
          .db.lists[foreignList.listKey].findOne({ where: value.disconnect as any });
      } catch (err) {
        return;
      }
      return { disconnect: true };
    }
    if (value.disconnectAll) {
      return { disconnect: true };
    }
  };
}
