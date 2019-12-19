const { GraphQLJSON } = require('graphql-type-json');
const { flatten, objMerge, unique } = require('@keystonejs/utils');

class ListCRUDProvider {
  constructor({ metaPrefix = 'ks' } = {}) {
    this._listsMeta = `_${metaPrefix}ListsMeta`;
    this.listsArray = [];
  }

  getTypes({ schemaName }) {
    return unique([
      `"""NOTE: Can be JSON, or a Boolean/Int/String
          Why not a union? GraphQL doesn't support a union including a scalar
          (https://github.com/facebook/graphql/issues/215)"""
       scalar JSON`,
      `type _ListAccess {
        """Access Control settings for the currently logged in (or anonymous)
           user when performing 'create' operations.
           NOTE: 'create' can only return a Boolean.
           It is not possible to specify a declarative Where clause for this
           operation"""
        create: Boolean

        """Access Control settings for the currently logged in (or anonymous)
           user when performing 'read' operations."""
        read: JSON

        """Access Control settings for the currently logged in (or anonymous)
           user when performing 'update' operations."""
        update: JSON

        """Access Control settings for the currently logged in (or anonymous)
           user when performing 'delete' operations."""
        delete: JSON

        """Access Control settings for the currently logged in (or anonymous)
           user when performing 'auth' operations."""
        auth: JSON
      }`,
      `type _ListSchemaRelatedFields {
      """The typename as used in GraphQL queries"""
      type: String

      """A list of GraphQL field names"""
      fields: [String]
    }`,
      `type _ListSchema {
      """The typename as used in GraphQL queries"""
      type: String

      """Top level GraphQL query names which either return this type, or
         provide aggregate information about this type"""
      queries: [String]

      """Information about fields on other types which return this type, or
         provide aggregate information about this type"""
      relatedFields: [_ListSchemaRelatedFields]
    }`,
      `type _ListMeta {
      """The Keystone List name"""
      name: String

      """Access control configuration for the currently authenticated
         request"""
      access: _ListAccess

      """Information on the generated GraphQL schema"""
      schema: _ListSchema
     }`,
      `type _QueryMeta {
        count: Int
     }`,
      ...flatten(this.listsArray.map(list => list.getGqlTypes({ schemaName }))),
    ]);
  }
  getQueries({ schemaName }) {
    // Aux lists are only there for typing and internal operations, they should
    // not have any GraphQL operations performed on them
    const firstClassLists = this.listsArray.filter(list => !list.isAuxList);
    return [
      ...flatten(firstClassLists.map(list => list.getGqlQueries({ schemaName }))),
      `""" Retrieve the meta-data for all lists. """
          ${this._listsMeta}: [_ListMeta]`,
    ];
  }
  getMutations({ schemaName }) {
    const firstClassLists = this.listsArray.filter(list => !list.isAuxList);
    return flatten(firstClassLists.map(list => list.getGqlMutations({ schemaName })));
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
      // A function so we can lazily evaluate this potentially expensive
      // operation
      // (Could we memoize this in the future?)
      // NOTE: We purposely include the list we're looking for as it may have a
      // self-referential field (eg: User { friends: [User] })
      // Aux lists are only there for typing and internal operations, they should
      // not have any GraphQL operations performed on them
      relatedFields: ({ key }) =>
        this.listsArray
          .filter(list => !list.isAuxList)
          .map(list => ({
            type: list.gqlNames.outputTypeName,
            fields: flatten(
              list
                .getFieldsRelatedTo(key)
                .filter(field => field.access[schemaName].read)
                .map(field => Object.keys(field.gqlOutputFieldResolvers({ schemaName })))
            ),
          }))
          .filter(({ fields }) => fields.length),
    };

    return {
      ...objMerge(this.listsArray.map(list => list.gqlAuxFieldResolvers({ schemaName }))),
      ...objMerge(this.listsArray.map(list => list.gqlFieldResolvers({ schemaName }))),
      JSON: GraphQLJSON,
      _QueryMeta: queryMetaResolver,
      _ListMeta: listMetaResolver,
      _ListAccess: listAccessResolver,
      _ListSchema: listSchemaResolver,
    };
  }
  getQueryResolvers({ schemaName }) {
    const firstClassLists = this.listsArray.filter(list => !list.isAuxList);
    // Order is also important here, any TypeQuery's defined by types
    // shouldn't be able to override list-level queries
    return {
      ...objMerge(firstClassLists.map(list => list.gqlAuxQueryResolvers())),
      ...objMerge(firstClassLists.map(list => list.gqlQueryResolvers({ schemaName }))),
      // And the Keystone meta queries must always be available
      [this._listsMeta]: (_, args, context) =>
        this.listsArray
          .filter(list => list.access[schemaName].read)
          .map(list => list.listMeta(context)),
    };
  }
  getMutationResolvers({ schemaName }) {
    const firstClassLists = this.listsArray.filter(list => !list.isAuxList);
    return {
      ...objMerge(firstClassLists.map(list => list.gqlAuxMutationResolvers())),
      ...objMerge(firstClassLists.map(list => list.gqlMutationResolvers({ schemaName }))),
    };
  }
}

module.exports = { ListCRUDProvider };
