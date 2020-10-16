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
} from '@keystone-spike/types';
import { sessionStuff } from '../session';
import type { IncomingMessage, ServerResponse } from 'http';
import { mergeSchemas } from '@graphql-tools/merge';
import { gql } from '../schema';
import { GraphQLSchema, GraphQLScalarType, GraphQLObjectType } from 'graphql';
import { mapSchema } from '@graphql-tools/utils';
import { crudForList } from '../lib/crud-api';
import { adminMetaSchemaExtension } from '@keystone-spike/admin-ui/templates';
import { accessControlContext, skipAccessControlContext } from '../lib/createAccessControlContext';
import { autoIncrement, mongoId } from '@keystone-spike/fields';

export function createKeystone(config: KeystoneConfig): Keystone {
  config = applyIdFieldDefaults(config);

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
    const labelField =
      (listConfig.admin?.labelField as string | undefined) ??
      (listConfig.fields.name ? 'name' : 'id');
    adminMeta.lists[key] = {
      key,
      labelField,
      description: listConfig.admin?.description ?? listConfig.description ?? null,
      label: list.adminUILabels.label,
      singular: list.adminUILabels.singular,
      plural: list.adminUILabels.plural,
      path: list.adminUILabels.path,
      fields: {},
      pageSize: listConfig.admin?.listView?.pageSize ?? 50,
      gqlNames: list.gqlNames,
      initialColumns: (listConfig.admin?.listView?.initialColumns as string[]) ?? [labelField],
      initialSort:
        (listConfig.admin?.listView?.initialSort as
          | {
              field: string;
              direction: 'ASC' | 'DESC';
            }
          | undefined) ?? null,
    };
  });
  Object.keys(adminMeta.lists).forEach(key => {
    const listConfig = config.lists[key];
    const list = (keystone as any).lists[key];

    for (const fieldKey of Object.keys(listConfig.fields)) {
      const field: FieldType<any> = listConfig.fields[fieldKey];
      const view = field.config.admin?.views ?? field.views;
      adminMeta.lists[key].fields[fieldKey] = {
        label: list.fieldsByPath[fieldKey].label,
        views: getViewId(view),
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
    config,
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
      ...(skipAccessControl ? skipAccessControlContext : accessControlContext),
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

function applyIdFieldDefaults(config: KeystoneConfig) {
  const newLists: KeystoneConfig['lists'] = {};
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
        admin: {
          createView: {
            fieldMode: 'hidden',
            ...idField.config.admin?.createView,
          },
          itemView: {
            fieldMode: 'hidden',
            ...idField.config.admin?.itemView,
          },
          ...idField.config.admin,
        },
        ...idField.config,
      },
    };

    const fields = { id: idField, ...listConfig.fields };
    newLists[key] = {
      ...listConfig,
      fields,
    };
  });

  return {
    ...config,
    lists: newLists,
  };
}
