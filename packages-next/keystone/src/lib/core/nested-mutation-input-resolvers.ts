import { tsgql, TypesForList } from '@keystone-next/types';
import { CreateAndUpdateInputResolvers } from './input-resolvers';

// TODO: access control for the items you are connecting/disconnecting
// the previous version of this used read access control for that

export function resolveRelateToManyForCreateInput(inputResolvers: CreateAndUpdateInputResolvers) {
  return async (
    value: tsgql.InferValueFromArg<
      tsgql.Arg<
        tsgql.NonNullType<TypesForList['relateTo']['many']['create']>,
        { connect: never[]; create: never[] }
      >
    >
  ) => {
    const connects = Promise.all(value.connect.map(x => inputResolvers.uniqueWhere(x)));
    const _creates = Promise.all(value.create.map(x => inputResolvers.create(x)));
    const [connect, creates] = await Promise.all([connects, _creates]);

    const create: any[] = [];

    for (const createData of creates) {
      if (createData.kind === 'create') {
        create.push(createData.data);
      }
      if (createData.kind === 'connect') {
        connect.push({ id: createData.id });
      }
    }
    return {
      connect,
      create,
    };
  };
}

export function resolveRelateToManyForUpdateInput(inputResolvers: CreateAndUpdateInputResolvers) {
  return async (
    value: tsgql.InferValueFromArg<
      tsgql.Arg<
        tsgql.NonNullType<TypesForList['relateTo']['many']['update']>,
        { connect: []; create: []; disconnect: []; disconnectAll: false }
      >
    >
  ) => {
    const disconnects = Promise.all(value.disconnect.map(x => inputResolvers.uniqueWhere(x)));
    const connects = Promise.all(value.connect.map(x => inputResolvers.uniqueWhere(x)));
    const _creates = Promise.all(value.create.map(x => inputResolvers.create(x)));
    const [disconnect, connect, creates] = await Promise.all([disconnects, connects, _creates]);

    const create: any[] = [];

    for (const createData of creates) {
      if (createData.kind === 'create') {
        create.push(createData.data);
      }
      if (createData.kind === 'connect') {
        connect.push({ id: createData.id });
      }
    }

    return {
      set: value.disconnectAll ? [] : undefined,
      disconnect: disconnect as any,
      connect,
      create,
    };
  };
}

export function resolveRelateToOneForCreateInput(inputResolvers: CreateAndUpdateInputResolvers) {
  return async (
    value: tsgql.InferValueFromArg<
      tsgql.Arg<tsgql.NonNullType<TypesForList['relateTo']['one']['create']>>
    >
  ) => {
    if (value === undefined) {
      return undefined;
    }
    if (value === null) {
      throw new Error(`A relate to one for create input cannot be set to null`);
    }
    const numOfKeys = Object.keys(value).length;
    if (numOfKeys !== 1) {
      throw new Error(
        `If a relate to one for create input is passed, only one key can be passed but ${numOfKeys} were be passed`
      );
    }
    if (value.connect) {
      return {
        connect: await inputResolvers.uniqueWhere(value.connect),
      };
    }
    if (value.create) {
      const create = await inputResolvers.create(value.create);
      if (create.kind === 'connect') {
        return { connect: { id: create.id } };
      }
      return { create: create.data };
    }
    throw new Error(`The key passed to a relate to one for create input must not be null`);
  };
}

export function resolveRelateToOneForUpdateInput(inputResolvers: CreateAndUpdateInputResolvers) {
  return async (
    value: tsgql.InferValueFromArg<
      tsgql.Arg<tsgql.NonNullType<TypesForList['relateTo']['one']['update']>>
    >
  ) => {
    if (value === undefined) {
      return undefined;
    }
    if (value === null) {
      return { disconnect: true };
    }
    const numOfKeys = Object.keys(value).length;
    if (numOfKeys !== 1) {
      throw new Error(
        `If a relate to one for update input is passed, only one key can be passed but ${numOfKeys} were be passed`
      );
    }
    if (value.connect) {
      return {
        connect: await inputResolvers.uniqueWhere(value.connect),
      };
    }
    if (value.create) {
      const create = await inputResolvers.create(value.create);
      if (create.kind === 'connect') {
        return { connect: { id: create.id } };
      }
      return { create: create.data };
    }
  };
}
