import { Keystone as BaseKeystone } from '@keystonejs/keystone';
import { MongooseAdapter } from '@keystonejs/adapter-mongoose';
import { KnexAdapter } from '@keystonejs/adapter-knex';
import type {
  BaseKeystoneList,
  SerializedAdminMeta,
  KeystoneConfig,
  Keystone,
  SessionContext,
} from '@keystone-spike/types';
import { sessionStuff } from '../session';
import type { IncomingMessage, ServerResponse } from 'http';
import { mergeSchemas } from '@graphql-tools/merge';
import { gql } from '../schema';
import { GraphQLSchema, GraphQLScalarType } from 'graphql';
import { mapSchema } from '@graphql-tools/utils';
import { crudForList } from '../lib/crud-api';
import { adminMetaSchemaExtension } from '@keystone-spike/admin-ui/templates';

export function createKeystone(config: KeystoneConfig): Keystone {
  let keystone = new BaseKeystone({
    name: config.name,
    adapter:
      config.db.adapter === 'knex'
        ? new KnexAdapter({ knexOptions: { connection: config.db.url } })
        : new MongooseAdapter({ mongoUri: config.db.url }),
    cookieSecret: '123456789',
    queryLimits: config.graphql?.queryLimits,
  });

  const sessionStrategy = config.session?.();

  const adminMeta: SerializedAdminMeta = {
    enableSessionItem: config.admin?.enableSessionItem || false,
    enableSignout: sessionStrategy?.end !== undefined,
    lists: {},
  };
  let uniqueViewCount = -1;
  const stringViewsToIndex: Record<string, number> = {};
  const views: string[] = [];
  function getViewId(view: string) {
    if (stringViewsToIndex[view] !== undefined) {
      return stringViewsToIndex[view];
    }
    uniqueViewCount++;
    stringViewsToIndex[view] = uniqueViewCount;
    views.push(view);
    return uniqueViewCount;
  }
  Object.keys(config.lists).forEach(key => {
    const listConfig = config.lists[key];
    const list: BaseKeystoneList = keystone.createList(key, {
      fields: Object.fromEntries(
        Object.entries(listConfig.fields).map(([key, field]) => [
          key,
          { type: (field as any).type, ...(field as any).config },
        ])
      ),
      access: listConfig.access,
      queryLimits: listConfig.graphql?.queryLimits,
      schemaDoc: listConfig.graphql?.description ?? listConfig.description,
      listQueryName: listConfig.graphql?.listQueryName,
      itemQueryName: listConfig.graphql?.itemQueryName,
      hooks: listConfig.hooks,
    } as any) as any;
    adminMeta.lists[key] = {
      key,
      description: listConfig.admin?.description ?? listConfig.description ?? null,
      label: list.adminUILabels.label,
      singular: list.adminUILabels.singular,
      plural: list.adminUILabels.plural,
      path: list.adminUILabels.path,
      fields: {},
      pageSize: listConfig.admin?.listView?.pageSize ?? 50,
      gqlNames: list.gqlNames,
      initialColumns:
        listConfig.admin?.listView?.initialColumns ?? Object.keys(listConfig.fields).slice(0, 2),
    };
    for (const fieldKey of Object.keys(listConfig.fields)) {
      const field = listConfig.fields[fieldKey];
      const view = field.config.admin?.views ?? field.views;
      adminMeta.lists[key].fields[fieldKey] = {
        label: fieldKey,
        views: getViewId(view),
        fieldMeta: field.getAdminMeta?.() ?? null,
        isOrderable: (list as any).fieldsByPath[fieldKey].isOrderable,
      };
    }
  });
  // @ts-ignore
  const server = keystone.createApolloServer({
    schemaName: 'public',
    dev: process.env.NODE_ENV === 'development',
  });
  let sessionThing = sessionStrategy ? sessionStuff(sessionStrategy) : undefined;
  const schemaFromApolloServer: GraphQLSchema = server.schema;
  const schema = mapSchema(schemaFromApolloServer, {
    'MapperKind.SCALAR_TYPE'(type) {
      // because of a bug in mergeSchemas which duplicates directives on scalars,
      // we're removing specifiedByUrl from the scalar
      // https://github.com/ardatan/graphql-tools/issues/2031
      if (type instanceof GraphQLScalarType && type.name === 'JSON') {
        return new GraphQLScalarType({
          name: type.name,
          description: type.description,
          parseLiteral: type.parseLiteral,
          parseValue: type.parseValue,
          serialize: type.serialize,
        });
      }
      return type;
    },
  });

  let graphQLSchema =
    config.extendGraphqlSchema?.(
      schema,
      // TODO: find a way to not do this
      keystone
    ) || schema;
  if (sessionStrategy?.end) {
    graphQLSchema = mergeSchemas({
      schemas: [graphQLSchema],
      typeDefs: gql`
        type Mutation {
          endSession: Boolean!
        }
      `,
      resolvers: {
        Mutation: {
          async endSession(rootVal, args, ctx) {
            await ctx.endSession();
            return true;
          },
        },
      },
    });
  }
  graphQLSchema = adminMetaSchemaExtension({
    adminMeta,
    graphQLSchema,
    isAccessAllowed:
      sessionThing === undefined
        ? undefined
        : config.admin?.isAccessAllowed ?? (({ session }) => session !== undefined),
  });

  function createContext({
    sessionContext,
    skipAccessControl = false,
  }: {
    sessionContext?: SessionContext;
    skipAccessControl?: boolean;
  }) {
    return {
      schemaName: 'public',
      // authedItem: authentication.item,
      // authedListKey: authentication.listKey,
      ...(keystone as any)._getAccessControlContext({
        schemaName: 'public',
        authentication: sessionContext?.session
          ? {
              // TODO: Keystone makes assumptions about the shape of this object
              item: true,
              ...(sessionContext?.session as any),
            }
          : {},
        skipAccessControl,
      }),
      crud,
      totalResults: 0,
      keystone,
      maxTotalResults: (keystone as any).queryLimits.maxTotalResults,
      createContext,
      ...sessionContext,
    };
  }
  let crud: Record<string, ReturnType<typeof crudForList>> = {};
  for (const listKey of Object.keys(adminMeta.lists)) {
    crud[listKey] = crudForList((keystone as any).lists[listKey], graphQLSchema, createContext);
  }

  const createSessionContext = sessionThing?.createContext;
  let keystoneThing = {
    keystone,
    adminMeta,
    graphQLSchema,
    views,
    createSessionContext: createSessionContext
      ? (req: IncomingMessage, res: ServerResponse) => {
          return createSessionContext(req, res, keystoneThing);
        }
      : undefined,
    createContext,
    async createContextFromRequest(req: IncomingMessage, res: ServerResponse) {
      let sessionContext = await sessionThing?.createContext(req, res, keystoneThing);

      return createContext({ sessionContext });
    },
    config,
  };
  return keystoneThing;
}
