const { GraphQLJSON } = require('graphql-type-json');
const { flatten, objMerge, unique } = require('@keystone-next/utils-legacy');

class ListCRUDProvider {
  constructor() {
    this.lists = [];
  }

  getTypes({ schemaName }) {
    return unique([
      ...flatten(this.lists.map(list => list.getGqlTypes({ schemaName }))),
      ...[
        `
          """
          NOTE: Can be JSON, or a Boolean/Int/String
          Why not a union? GraphQL doesn't support a union including a scalar
          (https://github.com/facebook/graphql/issues/215)
          """
          scalar JSON
        `,
        `
          type _QueryMeta {
            count: Int
          }
        `,
      ],
    ]);
  }

  getQueries({ schemaName }) {
    return flatten(this.lists.map(list => list.getGqlQueries({ schemaName })));
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

    return {
      ...objMerge(this.lists.map(list => list.gqlAuxFieldResolvers({ schemaName }))),
      ...objMerge(this.lists.map(list => list.gqlFieldResolvers({ schemaName }))),
      JSON: GraphQLJSON,
      _QueryMeta: queryMetaResolver,
    };
  }

  getQueryResolvers({ schemaName }) {
    return {
      // Order is also important here, any TypeQuery's defined by types
      // shouldn't be able to override list-level queries
      ...objMerge(this.lists.map(list => list.gqlAuxQueryResolvers())),
      ...objMerge(this.lists.map(list => list.gqlQueryResolvers({ schemaName }))),
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
