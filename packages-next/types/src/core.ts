import { IncomingMessage, ServerResponse } from 'http';
import type { GraphQLResolveInfo } from 'graphql';
import type { BaseGeneratedListTypes, MaybePromise } from './utils';
import type { KeystoneContext, SessionContext } from './context';

type FieldDefaultValueArgs<TGeneratedListTypes extends BaseGeneratedListTypes> = {
  context: KeystoneContext;
  originalInput: TGeneratedListTypes['inputs']['create'];
};

export type DatabaseProvider = 'sqlite' | 'postgresql';

export type FieldDefaultValue<T, TGeneratedListTypes extends BaseGeneratedListTypes> =
  | T
  | null
  | ((args: FieldDefaultValueArgs<TGeneratedListTypes>) => MaybePromise<T | null | undefined>);

export type CreateContext = (args: {
  sessionContext?: SessionContext<any>;
  skipAccessControl?: boolean;
  req?: IncomingMessage;
}) => KeystoneContext;

export type SessionImplementation = {
  createSessionContext(
    req: IncomingMessage,
    res: ServerResponse,
    createContext: CreateContext
  ): Promise<SessionContext<any>>;
};

export type GraphQLResolver = (
  root: any,
  args: any,
  context: KeystoneContext,
  info: GraphQLResolveInfo
) => any;

export type GraphQLSchemaExtension = {
  typeDefs: string;
  resolvers: Record<string, Record<string, GraphQLResolver>>;
};
