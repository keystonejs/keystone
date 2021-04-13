const { GraphQLJSON } = require('graphql-type-json');
const { flatten, objMerge, unique } = require('@keystone-next/utils-legacy');

const { getListCRUDTypes } = require('./listCRUDTypes');

class ListCRUDProvider {
  constructor({ metaPrefix = 'ks' } = {}) {
    this.lists = [];
    this.gqlNames = {
      listsMeta: `_${metaPrefix}ListsMeta`,
      listsMetaInput: `_${metaPrefix}ListsMetaInput`,
    };
  }

  getTypes({ schemaName }) {
    return unique([
      ...flatten(this.lists.map(list => list.getGqlTypes({ schemaName }))),
      ...getListCRUDTypes(this.gqlNames),
    ]);
  }

  getQueries({ schemaName }) {
    return [
      ...flatten(this.lists.map(list => list.getGqlQueries({ schemaName }))),
      `""" Retrieve the meta-data for all lists. """
      ${this.gqlNames.listsMeta}(where: ${this.gqlNames.listsMetaInput}): [_ListMeta]`,
    ];
  }

  getMutations({ schemaName }) {
    return flatten(this.lists.map(list => list.getGqlMutations({ schemaName })));
  }

  getSubscriptions({}) {
    return [];
  }

  getTypeResolvers({ schemaName }) {
    const queryMetaResolver = {
      // meta is passed in from the list's resolver (eg; '_allUsersMeta')
      count: meta => meta.getCount(),
    };

    const listMetaResolver = {
      // meta is passed in from the list's resolver (eg; '_allUsersMeta')
      access: meta => meta.getAccess(),
      // schema is
      schema: meta => meta.getSchema(),
    };

    const listAccessResolver = {
      // access is passed in from the listMetaResolver
      create: access => access.getCreate(),
      read: access => access.getRead(),
      update: access => access.getUpdate(),
      delete: access => access.getDelete(),
      auth: access => access.getAuth(),
    };

    // NOTE: some fields are passed through unchanged from the list, and so are
    // not specified here.
    const listSchemaResolver = {
      // Aux lists aren't filtered out here since you can query them via _ksListsMeta.
      // They need to be included so the `key` check can match them and fetch their fields.
      fields: ({ key }, { where: { type } = {} }) => {
        return this.lists
          .find(list => list.key === key)
          .getAllFieldsWithAccess({ schemaName, access: 'read' })
          .filter(field => !type || field.constructor.name === type)
          .map(field => ({
            path: field.path,
            name: field.path,
            type: field.constructor.name,
          }));
      },

      // A function so we can lazily evaluate this potentially expensive
      // operation
      // (Could we memoize this in the future?)
      // NOTE: We purposely include the list we're looking for as it may have a
      // self-referential field (eg: User { friends: [User] })
      relatedFields: ({ key }) =>
        this.lists
          .map(list => ({
            type: list.gqlNames.outputTypeName,
            fields: flatten(
              list.fields
                .filter(field => field.isRelationship && field.refListKey === key)
                .filter(field => field.access[schemaName].read)
                .map(field => Object.keys(field.gqlOutputFieldResolvers({ schemaName })))
            ),
          }))
          .filter(({ fields }) => fields.length),
    };

    return {
      ...objMerge(this.lists.map(list => list.gqlAuxFieldResolvers({ schemaName }))),
      ...objMerge(this.lists.map(list => list.gqlFieldResolvers({ schemaName }))),
      JSON: GraphQLJSON,
      _QueryMeta: queryMetaResolver,
      _ListMeta: listMetaResolver,
      _ListAccess: listAccessResolver,
      _ListSchema: listSchemaResolver,
    };
  }

  getQueryResolvers({ schemaName }) {
    return {
      // Order is also important here, any TypeQuery's defined by types
      // shouldn't be able to override list-level queries
      ...objMerge(this.lists.map(list => list.gqlAuxQueryResolvers())),
      ...objMerge(this.lists.map(list => list.gqlQueryResolvers({ schemaName }))),

      // And the Keystone meta queries must always be available
      [this.gqlNames.listsMeta]: (_, { where: { key, auxiliary } = {} }, context) =>
        this.lists
          .filter(
            list =>
              list.access[schemaName].read &&
              (!key || list.key === key) &&
              (auxiliary === undefined || auxiliary === false)
          )
          .map(list => list.listMeta(context)),
    };
  }

  getMutationResolvers({ schemaName }) {
    return objMerge(this.lists.map(list => list.gqlMutationResolvers({ schemaName })));
  }

  getSubscriptionResolvers({}) {
    return {};
  }
}

module.exports = { ListCRUDProvider };
