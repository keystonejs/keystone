import { KeystoneContext, TypesForList, types } from '@keystone-next/types';
import { resolveUniqueWhereInput, UniqueInputFilter, UniquePrismaFilter } from './input-resolvers';
import { createOneState } from './mutations/resolvers';
import { InitialisedList } from './types-for-lists';
import {
  isRejected,
  isFulfilled,
  getPrismaModelForList,
  promiseAllRejectWithAllErrors,
  IdType,
} from './utils';

const isNotNull = <T>(arg: T): arg is Exclude<T, null> => arg !== null;

export class NestedMutationState {
  #afterChanges: (() => void | Promise<void>)[] = [];
  #context: KeystoneContext;
  constructor(context: KeystoneContext) {
    this.#context = context;
  }
  async create(
    input: Record<string, any>,
    list: InitialisedList
  ): Promise<{ kind: 'connect'; id: IdType } | { kind: 'create'; data: Record<string, any> }> {
    const { afterChange, data } = await createOneState({ data: input }, list, this.#context);
    const item = await getPrismaModelForList(this.#context.prisma, list.listKey).create({ data });
    this.#afterChanges.push(() => afterChange(item));
    return { kind: 'connect' as const, id: item.id };
  }
  async commit() {
    await promiseAllRejectWithAllErrors(this.#afterChanges);
  }
}

// TODO: access control for the items you are connecting/disconnecting
// the previous version of this used read access control for that

export function resolveRelateToManyForCreateInput(
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList,
  target: string
) {
  return async (
    value: types.InferValueFromArg<types.Arg<TypesForList['relateTo']['many']['create']>>
  ) => {
    if (value == null) {
      return undefined;
    }
    assertValidManyOperation(value, target);
    return resolveCreateAndConnect(value, nestedMutationState, context, foreignList, target);
  };
}

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
          await context.sudo().db.lists[foreignList.listKey].findOne({ where: filter as any });
        } catch (err) {
          return [];
        }
        return [resolveUniqueWhereInput(filter, foreignList.fields, context)];
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
    await context.db.lists[foreignList.listKey].findOne({ where: filter as any });
    return resolveUniqueWhereInput(filter, foreignList.fields, context);
  });
}

async function resolveCreateAndConnect(
  value: Exclude<
    types.InferValueFromArg<types.Arg<TypesForList['relateTo']['many']['update']>>,
    null | undefined
  >,
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList,
  target: string
) {
  const connects = Promise.allSettled(
    getConnects((value.connect || []).filter(isNotNull), context, foreignList)
  );
  const creates = Promise.allSettled(
    (value.create || []).filter(isNotNull).map(x => nestedMutationState.create(x, foreignList))
  );

  const [connectResult, createResult] = await Promise.all([connects, creates]);

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
    }
    if (createData.kind === 'connect') {
      result.connect.push({ id: createData.id });
    }
  }

  return result;
}

function assertValidManyOperation(
  val: Exclude<
    types.InferValueFromArg<types.Arg<TypesForList['relateTo']['many']['update']>>,
    undefined | null
  >,
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

export function resolveRelateToManyForUpdateInput(
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList,
  target: string
) {
  return async (
    value: types.InferValueFromArg<types.Arg<TypesForList['relateTo']['many']['update']>>
  ) => {
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

async function handleCreateAndUpdate(
  value: Exclude<
    types.InferValueFromArg<types.Arg<TypesForList['relateTo']['one']['create']>>,
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
    value: types.InferValueFromArg<types.Arg<TypesForList['relateTo']['one']['create']>>
  ) => {
    if (value == null) {
      return undefined;
    }
    const numOfKeys = Object.keys(value).length;
    if (numOfKeys !== 1) {
      throw new Error(`Nested mutation operation invalid for ${target}`);
      // throw new Error(
      //   `If a relate to one for create input is passed, only one key can be passed but ${numOfKeys} were be passed`
      // );
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
    value: types.InferValueFromArg<
      types.Arg<types.NonNullType<TypesForList['relateTo']['one']['update']>>
    >
  ) => {
    // should === null disconnect?
    if (value == null) {
      return undefined;
    }
    // if (value === null) {
    //   return { disconnect: true };
    // }
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
