const { gql } = require('apollo-server-express');
const { parseCustomAccess } = require('@keystonejs/access-control');
const { objMerge } = require('@keystonejs/utils');
const { AccessDeniedError } = require('../ListTypes/graphqlErrors');
const { graphqlLogger } = require('../Keystone/logger');

class CustomProvider {
  constructor({ schemaNames, defaultAccess }) {
    this._schemaNames = schemaNames;
    this._defaultAccess = defaultAccess;
    this._extendedTypes = [];
    this._extendedQueries = [];
    this._extendedMutations = [];
    this._extendedSubscriptions = [];
  }

  extendGraphQLSchema({ types = [], queries = [], mutations = [], subscriptions = [] }) {
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
    this._extendedSubscriptions = this._extendedSubscriptions.concat(
      subscriptions.map(_parseAccess)
    );
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
  getSubscriptions({ schemaName }) {
    return this._extendedSubscriptions
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
  getSubscriptionResolvers({ schemaName }) {
    return objMerge(
      this._extendedSubscriptions
        .filter(({ access }) => access[schemaName])
        .map(this._customResolver('subscription'))
    );
  }

  _customResolver(type) {
    return ({ schema, subscribe, resolver, access, cacheHint }) => {
      const gqlName = gql(`type t { ${schema} }`).definitions[0].fields[0].name.value;

      // Perform access control check before passing off control to the
      // user defined resolver (along with the evalutated access).
      const computeAccess = async (item, args, context, info) => {
        const _access = await context.getCustomAccessControlForUser(
          item,
          args,
          context,
          info,
          access,
          gqlName
        );
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

      const resolve = async (item, args, context, info) => {
        if (resolver) {
          // Allow cache hints to be added to custom queries
          if (type === 'query' && cacheHint) {
            if (typeof cacheHint !== 'object') {
              throw new Error(`cacheHint must be an object`);
            }
            if (info && info.cacheControl) {
              info.cacheControl.setCacheHint(cacheHint);
            }
          }
          return resolver(item, args, context, info, {
            access: await computeAccess(item, args, context, info),
          });
        }
      };

      return {
        // Subscriptions use a slightly different format
        [gqlName]: type === 'subscription' ? { subscribe, resolve } : resolve,
      };
    };
  }
}

module.exports = { CustomProvider };
