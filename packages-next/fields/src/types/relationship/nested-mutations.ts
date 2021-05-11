// @ts-ignore
import groupBy from 'lodash.groupby';
import pSettle from 'p-settle';
import { intersection, pick } from '@keystone-next/utils-legacy';
import { PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';
import { KeystoneContext } from '@keystone-next/types';
import { ParameterError } from './graphqlErrors';
import {
  Relationship,
  RelationshipManyOperation,
  RelationshipOperation,
  RelationshipSingleOperation,
} from './Implementation';

type List = {
  key: string;
  adapter: PrismaListAdapter;
  gqlNames: { itemQueryName: string };
  itemQuery: any;
  createMutation: any;
};

type Operations = 'create' | 'connect' | 'disconnect' | 'disconnectAll';
const NESTED_MUTATIONS: Operations[] = ['create', 'connect', 'disconnect', 'disconnectAll'];

/*** Input validation  ***/
const throwWithErrors = (message: string, meta: Record<string, any>) => {
  const error = new Error(message);
  throw Object.assign(error, meta);
};

function validateInput({
  input,
  target,
  many,
}: {
  input: RelationshipOperation;
  target: string;
  many: boolean;
}) {
  // Only accept mutations which we know how to handle.
  let validInputMutations = intersection(Object.keys(input), NESTED_MUTATIONS) as Operations[];

  // Filter out mutations which don't have any parameters
  if (many) {
    // to-many must have an array of objects
    validInputMutations = validInputMutations.filter(
      mutation => mutation === 'disconnectAll' || Array.isArray(input[mutation])
    );
  } else {
    validInputMutations = validInputMutations.filter(
      mutation => mutation === 'disconnectAll' || Object.keys(input[mutation]).length
    );
  }

  // We must have at least one valid mutation
  if (!validInputMutations.length) {
    throw new ParameterError({
      message: `Must provide a nested mutation (${NESTED_MUTATIONS.join(
        ', '
      )}) when mutating ${target}`,
    });
  }

  // For a non-many relationship we can't create AND connect - only one can be set at a time
  if (!many && validInputMutations.includes('create') && validInputMutations.includes('connect')) {
    throw new ParameterError({
      message: `Can only provide one of 'connect' or 'create' when mutating ${target}`,
    });
  }
  return validInputMutations;
}

export const cleanAndValidateInput = ({
  input,
  many,
  localField,
  target,
}: {
  input: RelationshipOperation;
  many: boolean;
  localField: Relationship<any>;
  target: string;
}) => {
  try {
    return pick(input, validateInput({ input, target, many }));
  } catch (error) {
    const message = `Nested mutation operation invalid for ${target}`;
    error.path = ['<validate>'];
    throwWithErrors(message, { errors: [error], path: [localField.path] });
  }
  return {};
};

const _runActions = async (
  action: (arg: any) => Promise<any>,
  targets: any[] | null | undefined,
  path: string[]
) => {
  const results = await pSettle((targets || []).map(action));
  const errors = results
    .map((settleInfo, index) => ({ ...settleInfo, index }))
    .filter(({ isRejected }) => isRejected)
    // @ts-ignore
    .map(({ reason, index }) => {
      reason.path = [...path, index];
      return reason;
    });
  // If there are no errors we know everything resolved successfully
  // @ts-ignore
  return [errors.length ? [] : results.map(({ value }) => value), errors];
};

export async function resolveNestedMany({
  input,
  currentValue,
  refList,
  context,
  localField,
  target,
  mutationState,
}: {
  input: RelationshipManyOperation;
  currentValue: string[];
  target: string;
  refList: List;
  context: KeystoneContext;
  localField: Relationship<any>;
  mutationState: { afterChangeStack: any[]; transaction: {} };
}) {
  // Disconnections
  let disconnectIds = [] as string[];
  if (input.disconnectAll) {
    disconnectIds = [...currentValue];
  } else if (input.disconnect) {
    // We want to avoid DB lookups where possible, so we split the input into
    // two halves; one with ids, and the other without ids
    const { withId, withoutId }: { withId: { id: any }[]; withoutId: { id: any }[] } = groupBy(
      input.disconnect,
      ({ id }: { id: any }) => (id ? 'withId' : 'withoutId')
    );

    // We set the Ids we do find immediately
    disconnectIds = (withId || []).map(({ id }) => id);

    // And any without ids (ie; other unique criteria), have to be looked up
    // This will resolve access control, etc for us.
    // In the future, when WhereUniqueInput accepts more than just an id,
    // this will also resolve those queries for us too.
    const action = (where: { id: any }) =>
      refList.itemQuery(where, context, refList.gqlNames.itemQueryName);
    // We don't throw if any fail; we're only interested in the ones this user has
    // access to read (and hence remove from the list)
    const disconnectItems = (await pSettle((withoutId || []).map(action)))
      .filter(({ isFulfilled }) => isFulfilled)
      // @ts-ignore
      .map(({ value }) => value)
      .filter(itemToDisconnect => itemToDisconnect); // Possible to get null results when the id doesn't exist, or read access is denied

    disconnectIds.push(...disconnectItems.map(({ id }) => id));
  }

  // Connections
  let connectedIds = [] as string[];
  let createdIds = [] as string[];
  if (input.connect || input.create) {
    // This will resolve access control, etc for us.
    // In the future, when WhereUniqueInput accepts more than just an id,
    // this will also resolve those queries for us too.
    const [connectedItems, connectErrors] = await _runActions(
      where => refList.itemQuery({ where }, context, refList.gqlNames.itemQueryName),
      input.connect,
      ['connect']
    );

    // Create related item. Will check for access control itself, no need to do anything extra here.
    // NOTE: We don't check for read access control on the returned ids as the
    // user will not have seen it, so it's ok to return it directly here.
    const [createdItems, createErrors] = await _runActions(
      data => refList.createMutation(data, context, mutationState),
      input.create,
      ['create']
    );

    const allErrors = [...connectErrors, ...createErrors];
    if (allErrors.length) {
      const message = `Unable to create and/or connect ${allErrors.length} ${target}`;
      throwWithErrors(message, { errors: allErrors, path: [localField.path] });
    }

    connectedIds = connectedItems.map(item => {
      if (item && item.id) {
        return item.id;
      }
      // Possible to get null results when the id doesn't exist, or read access is denied
      return null;
    });

    createdIds = createdItems.map(item => {
      if (item && item.id) {
        return item.id;
      }
      // Possible to get null results when the id doesn't exist, or read access is denied
      return null;
    });
  }

  return { disconnect: disconnectIds, connect: connectedIds, create: createdIds };
}

export async function resolveNestedSingle({
  input,
  currentValue,
  localField,
  refList,
  context,
  target,
  mutationState,
}: {
  input: RelationshipSingleOperation;
  currentValue?: string;
  target: string;
  localField: Relationship<any>;
  refList: List;
  context: KeystoneContext;
  mutationState: { afterChangeStack: any[]; transaction: {} };
}) {
  let result_ = {
    create: [] as string[],
    connect: [] as string[],
    disconnect: [] as string[],
  };
  if ((input.disconnect || input.disconnectAll) && currentValue) {
    let idToDisconnect;
    if (input.disconnectAll) {
      idToDisconnect = currentValue;
    } else if (input.disconnect.id) {
      idToDisconnect = input.disconnect.id;
    } else {
      try {
        // Support other unique fields for disconnection
        idToDisconnect = (
          await refList.itemQuery(
            { where: input.disconnect },
            context,
            refList.gqlNames.itemQueryName
          )
        ).id.toString();
      } catch (error) {
        // Maybe we don't have read access, or maybe the item doesn't exist
        // (recently deleted, or it's an erroneous value in the relationship field)
        // So we silently ignore it
      }
    }

    if (currentValue === idToDisconnect) {
      // Found the item, so unset it
      result_.disconnect = [idToDisconnect];
    }
  }

  let operation: 'connect' | 'create' | undefined;
  let method;

  if (input.connect) {
    operation = 'connect';
    method = () =>
      refList.itemQuery({ where: input.connect }, context, refList.gqlNames.itemQueryName);
  } else if (input.create) {
    operation = 'create';
    method = () => refList.createMutation(input.create, context, mutationState);
  }

  if (operation && method) {
    // override result with the connected/created value
    // input is of type *RelateToOneInput
    let item;
    try {
      item = await method();
    } catch (error) {
      const message = `Unable to ${operation} a ${target}`;
      error.path = [operation];
      throwWithErrors(message, { errors: [error], path: [localField.path] });
    }

    // Might not exist if the input id doesn't exist / the user doesn't have read access
    if (item) {
      result_[operation] = [item.id];
    }
  }
  return result_;
}
