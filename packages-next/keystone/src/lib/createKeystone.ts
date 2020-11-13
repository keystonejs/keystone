import type { IncomingMessage, ServerResponse } from 'http';
import { GraphQLSchema, GraphQLObjectType, execute, parse } from 'graphql';
import { mergeSchemas } from '@graphql-tools/merge';
import { mapSchema } from '@graphql-tools/utils';
import { Keystone as BaseKeystone } from '@keystonejs/keystone';
import { MongooseAdapter } from '@keystonejs/adapter-mongoose';
import { KnexAdapter } from '@keystonejs/adapter-knex';
import type {
  BaseKeystoneList,
  SerializedAdminMeta,
  KeystoneConfig,
  Keystone,
  SessionContext,
  FieldType,
  KeystoneGraphQLAPI,
} from '@keystone-next/types';
import { adminMetaSchemaExtension } from '@keystone-next/admin-ui/templates';
import { autoIncrement, mongoId } from '@keystone-next/fields';
import { implementSession } from '../session';
import { gql } from '../schema';
import { itemAPIForList } from './itemAPI';
import { accessControlContext, skipAccessControlContext } from './createAccessControlContext';

export function createKeystone(config: KeystoneConfig): Keystone {
  config = applyIdFieldDefaults(config);

  // @ts-ignore The @types/keystonejs__keystone package has the wrong type for KeystoneOptions
  let keystone = new BaseKeystone({
    adapter:
      // FIXME: prisma support
      config.db.adapter === 'knex'
        ? new KnexAdapter({ knexOptions: { connection: config.db.url } })
        : new MongooseAdapter({ mongoUri: config.db.url }),
    cookieSecret: '123456789',
    queryLimits: config.graphql?.queryLimits,
    // @ts-ignore The @types/keystonejs__keystone package has the wrong type for onConnect
    onConnect: config.db.onConnect,
  });

  const sessionStrategy = config.session?.();

  const adminMeta: SerializedAdminMeta = {
    enableSessionItem: config.ui?.enableSessionItem || false,
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
    const listConfig = config.lists[key];
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
