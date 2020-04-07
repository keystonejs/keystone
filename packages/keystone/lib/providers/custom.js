const gql = require('graphql-tag');
const { parseCustomAccess } = require('@keystonejs/access-control');
const { objMerge } = require('@keystonejs/utils');
const { logger } = require('@keystonejs/logger');

const { AccessDeniedError } = require('../List/graphqlErrors');

const graphqlLogger = logger('graphql');

class CustomProvider {
  constructor({ schemaNames, defaultAccess, buildQueryHelper }) {
    this._schemaNames = schemaNames;
    this._defaultAccess = defaultAccess;
    this._buildQueryHelper = buildQueryHelper;
    this._extendedTypes = [];
    this._extendedQueries = [];
    this._extendedMutations = [];
  }

  extendGraphQLSchema({ types = [], queries = [], mutations = [] }) {
    const _parseAccess = obj => ({
      ...obj,
      access: parseCustomAccess({
        access: obj.access,
        schemaNames: this._schemaNames,
        defaultAccess: this._defaultAccess.custom,
      }),
    });

    this._extendedTypes = this._extendedTypes.concat(types.map(_parseAccess));
    this._extendedQueries = this._extendedQueries.concat(queries.map(_parseAccess));
    this._extendedMutations = this._extendedMutations.concat(mutations.map(_parseAccess));
  }

  getTypes({ schemaName }) {
    return this._extendedTypes.filter(({ access }) => access[schemaName]).map(({ type }) => type);
  }
  getQueries({ schemaName }) {
    return this._extendedQueries
      .filter(({ access }) => access[schemaName])
      .map(({ schema }) => schema);
  }
  getMutations({ schemaName }) {
    return this._extendedMutations
      .filter(({ access }) => access[schemaName])
      .map(({ schema }) => schema);
  }

  getTypeResolvers({}) {
    return {};
  }
  getQueryResolvers({ schemaName }) {
    return objMerge(
      this._extendedQueries
        .filter(({ access }) => access[schemaName])
        .map(this._customResolver('query'))
    );
  }
  getMutationResolvers({ schemaName }) {
    return objMerge(
      this._extendedMutations
        .filter(({ access }) => access[schemaName])
        .map(this._customResolver('mutation'))
    );
  }

  _customResolver(type) {
    return ({ schema, resolver, access }) => {
      const gqlName = gql(`type t { ${schema} }`).definitions[0].fields[0].name.value;

      // Perform access control check before passing off control to the
      // user defined resolver (along with the evalutated access).
      const computeAccess = context => {
        const _access = context.getCustomAccessControlForUser(access);
        if (!_access) {
          graphqlLogger.debug({ access, gqlName }, 'Access statically or implicitly denied');
          graphqlLogger.info({ gqlName }, 'Access Denied');
          // If the client handles errors correctly, it should be able to
          // receive partial data (for the fields the user has access to),
          // and then an `errors` array of AccessDeniedError's
          throw new AccessDeniedError({
            data: { type, target: gqlName },
            internalData: {
              authedId: context.authedItem && context.authedItem.id,
              authedListKey: context.authedListKey,
            },
          });
        }
        return _access;
      };
      return {
        [gqlName]: (obj, args, context, info) =>
          resolver(obj, args, context, info, {
            query: this._buildQueryHelper(context),
            access: computeAccess(context),
          }),
      };
    };
  }
}

module.exports = { CustomProvider };
