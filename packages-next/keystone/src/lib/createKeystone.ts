import type { IncomingMessage, ServerResponse } from 'http';
import { GraphQLSchema, GraphQLObjectType, execute, parse } from 'graphql';
import { mergeSchemas } from '@graphql-tools/merge';
import { mapSchema } from '@graphql-tools/utils';
import { Keystone } from '@keystonejs/keystone';
import { MongooseAdapter } from '@keystonejs/adapter-mongoose';
import { KnexAdapter } from '@keystonejs/adapter-knex';
import type {
  SerializedAdminMeta,
  KeystoneConfig,
  KeystoneSystem,
  SessionContext,
  FieldType,
  KeystoneGraphQLAPI,
  SessionStrategy,
} from '@keystone-next/types';
import { adminMetaSchemaExtension } from '@keystone-next/admin-ui/templates';
import { autoIncrement, mongoId } from '@keystone-next/fields';
import { implementSession } from '../session';
import { gql } from '../schema';
import { itemAPIForList } from './itemAPI';
import { accessControlContext, skipAccessControlContext } from './createAccessControlContext';

export function _createKeystone(config: KeystoneConfig): any {
  // Note: For backwards compatibility we may want to expose
  // this as a public API so that users can start their transition process
  // by using this pattern for creating their Keystone object before using
  // it in their existing custom servers or original CLI systems.
  const { db, graphql, lists } = config;
  // @ts-ignore The @types/keystonejs__keystone package has the wrong type for KeystoneOptions
  const keystone = new Keystone({
    adapter:
      // FIXME: prisma support
      db.adapter === 'knex'
        ? new KnexAdapter({
            knexOptions: { connection: db.url },
            // FIXME: Add support for all options
          })
        : new MongooseAdapter({
            mongoUri: db.url,
            //FIXME: Add support for all options
          }),
    cookieSecret: '123456789', // FIXME: Don't provide a default here. See #2882
    queryLimits: graphql?.queryLimits,
    // @ts-ignore The @types/keystonejs__keystone package has the wrong type for KeystoneOptions
    onConnect: db.onConnect,
    // FIXME: Unsupported options: Need to work which of these we want to support with backwards
    // compatibility options.
    // defaultAccess
    // adapters
    // defaultAdapter
    // sessionStore
    // cookie
    // schemaNames
    // appVersion
  });

  Object.entries(lists).forEach(([key, { fields, graphql, access, hooks, description }]) => {
    keystone.createList(key, {
      fields: Object.fromEntries(
        Object.entries(fields).map(([key, { type, config }]: any) => [key, { type, ...config }])
      ),
      access,
      queryLimits: graphql?.queryLimits,
      schemaDoc: graphql?.description ?? description,
      listQueryName: graphql?.listQueryName,
      itemQueryName: graphql?.itemQueryName,
      hooks,
      // FIXME: Unsupported options: Need to work which of these we want to support with backwards
      // compatibility options.
      // adminDoc
      // labelResolver
      // labelField
      // adminConfig
      // label
      // singular
      // plural
      // path
      // adapterConfig
      // cacheHint
      // plugins
    } as any) as any;
  });

  return keystone;
}

function createAdminMeta(
  config: KeystoneConfig,
  keystone: any,
  sessionStrategy?: SessionStrategy<unknown>
) {
  const { ui, lists } = config;
  const adminMeta: SerializedAdminMeta = {
    enableSessionItem: ui?.enableSessionItem || false,
    enableSignout: sessionStrategy?.end !== undefined,
    lists: {},
  };
  let uniqueViewCount = -1;
  const stringViewsToIndex: Record<string, number> = {};
  const views: string[] = [];
  function getViewId(view: string) {
    if (stringViewsToIndex[view] === undefined) {
      uniqueViewCount++;
      stringViewsToIndex[view] = uniqueViewCount;
      views.push(view);
    }
    return stringViewsToIndex[view];
  }
  Object.keys(lists).forEach(key => {
    const listConfig = lists[key];
    const list = keystone.lists[key];
    // Default the labelField to `name`, `label`, or `title` if they exist; otherwise fall back to `id`
    const labelField =
      (listConfig.ui?.labelField as string | undefined) ??
      (listConfig.fields.label
        ? 'label'
        : listConfig.fields.name
        ? 'name'
        : listConfig.fields.title
        ? 'title'
        : 'id');
    adminMeta.lists[key] = {
      key,
      labelField,
      description: listConfig.ui?.description ?? listConfig.description ?? null,
      label: list.adminUILabels.label,
      singular: list.adminUILabels.singular,
      plural: list.adminUILabels.plural,
      path: list.adminUILabels.path,
      fields: {},
      pageSize: listConfig.ui?.listView?.pageSize ?? 50,
      gqlNames: list.gqlNames,
      initialColumns: (listConfig.ui?.listView?.initialColumns as string[]) ?? [labelField],
      initialSort:
        (listConfig.ui?.listView?.initialSort as
          | { field: string; direction: 'ASC' | 'DESC' }
          | undefined) ?? null,
    };
  });
  Object.keys(adminMeta.lists).forEach(key => {
    const listConfig = lists[key];
    const list = (keystone as any).lists[key];
    for (const fieldKey of Object.keys(listConfig.fields)) {
      const field: FieldType<any> = listConfig.fields[fieldKey];
      adminMeta.lists[key].fields[fieldKey] = {
        label: list.fieldsByPath[fieldKey].label,
        views: getViewId(field.views),
        customViews: field.config.ui?.views === undefined ? null : getViewId(field.config.ui.views),
        fieldMeta: field.getAdminMeta?.(key, fieldKey, adminMeta) ?? null,
        isOrderable: list.fieldsByPath[fieldKey].isOrderable || fieldKey === 'id',
      };
    }
  });

  return { adminMeta, views };
}

export function createKeystone(config: KeystoneConfig): KeystoneSystem {
  config = applyIdFieldDefaults(config);

  const keystone = _createKeystone(config);

  const sessionStrategy = config.session?.();

  const { adminMeta, views } = createAdminMeta(config, keystone, sessionStrategy);

  // @ts-ignore
  const server = keystone.createApolloServer({
    schemaName: 'public',
    dev: process.env.NODE_ENV === 'development',
  });
  let sessionImplementation = sessionStrategy ? implementSession(sessionStrategy) : undefined;
  const schemaFromApolloServer: GraphQLSchema = server.schema;
  const schema = mapSchema(schemaFromApolloServer, {
    'MapperKind.OBJECT_TYPE'(type) {
      if (
        config.lists[type.name] !== undefined &&
        config.lists[type.name].fields._label_ === undefined
      ) {
        let {
          fields: { _label_, ...fields },
          ...objectTypeConfig
        } = type.toConfig();
        return new GraphQLObjectType({ fields, ...objectTypeConfig });
      }

      return type;
    },
  });

  // TODO: find a way to not do this
  let graphQLSchema = config.extendGraphqlSchema?.(schema, keystone) || schema;
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
      sessionImplementation === undefined
        ? undefined
        : config.ui?.isAccessAllowed ?? (({ session }) => session !== undefined),
    config,
  });

  function createContext({
    sessionContext,
    skipAccessControl = false,
  }: {
    sessionContext?: SessionContext;
    skipAccessControl?: boolean;
  }) {
    const rawGraphQL: KeystoneGraphQLAPI<any>['raw'] = ({ query, context, variables }) => {
      if (typeof query === 'string') {
        query = parse(query);
      }
      return Promise.resolve(
        execute({
          schema: graphQLSchema,
          document: query,
          contextValue: context ?? contextToReturn,
          variableValues: variables,
        })
      );
    };
    const contextToReturn: any = {
      schemaName: 'public',
      ...(skipAccessControl ? skipAccessControlContext : accessControlContext),
      lists: itemAPI,
      totalResults: 0,
      keystone,
      graphql: {
        createContext,
        raw: rawGraphQL,
        run: async args => {
          let result = await rawGraphQL(args);
          if (result.errors?.length) {
            throw result.errors[0];
          }
          return result.data;
        },
        schema: graphQLSchema,
      } as KeystoneGraphQLAPI<any>,
      maxTotalResults: (keystone as any).queryLimits.maxTotalResults,
      createContext,
      ...sessionContext,
    };
    return contextToReturn;
  }
  let itemAPI: Record<string, ReturnType<typeof itemAPIForList>> = {};
  for (const listKey of Object.keys(adminMeta.lists)) {
    itemAPI[listKey] = itemAPIForList(
      (keystone as any).lists[listKey],
      graphQLSchema,
      createContext
    );
  }

  const createSessionContext = sessionImplementation?.createContext;
  let keystoneThing = {
    keystone,
    adminMeta,
    graphQLSchema,
    views,
    createSessionContext: createSessionContext
      ? (req: IncomingMessage, res: ServerResponse) => createSessionContext(req, res, keystoneThing)
      : undefined,
    createContext,
    async createContextFromRequest(req: IncomingMessage, res: ServerResponse) {
      return createContext({
        sessionContext: await sessionImplementation?.createContext(req, res, keystoneThing),
      });
    },
    config,
  };
  return keystoneThing;
}

/* Validate lists config and default the id field */
function applyIdFieldDefaults(config: KeystoneConfig): KeystoneConfig {
  const lists: KeystoneConfig['lists'] = {};
  Object.keys(config.lists).forEach(key => {
    const listConfig = config.lists[key];
    if (listConfig.fields.id) {
      throw new Error(
        `A field with the \`id\` path is defined in the fields object on the ${JSON.stringify(
          key
        )} list. This is not allowed, use the idField option instead.`
      );
    }
    let idField =
      config.lists[key].idField ??
      { mongoose: mongoId({}), knex: autoIncrement({}) }[config.db.adapter];
    idField = {
      ...idField,
      config: {
        ui: {
          createView: { fieldMode: 'hidden', ...idField.config.ui?.createView },
          itemView: { fieldMode: 'hidden', ...idField.config.ui?.itemView },
          ...idField.config.ui,
        },
        ...idField.config,
      },
    };

    const fields = { id: idField, ...listConfig.fields };
    lists[key] = { ...listConfig, fields };
  });

  return { ...config, lists };
}
