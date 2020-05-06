const { mergeWhereClause, upcase } = require('@keystonejs/utils');
const { logger } = require('@keystonejs/logger');

const { throwAccessDenied } = require('../List/graphqlErrors');

const graphqlLogger = logger('graphql');

class ListAuthProvider {
  constructor({ authStrategy, list }) {
    this.authStrategy = authStrategy;
    this.list = list;
    this.access = list.access;
    const { outputTypeName, itemQueryName } = list.gqlNames;
    this.gqlNames = {
      outputTypeName,
      authenticatedQueryName: `authenticated${itemQueryName}`,
      authenticateMutationName: `authenticate${itemQueryName}With${upcase(authStrategy.authType)}`,
      unauthenticateMutationName: `unauthenticate${itemQueryName}`,
      authenticateOutputName: `authenticate${itemQueryName}Output`,
      unauthenticateOutputName: `unauthenticate${itemQueryName}Output`,
    };

    // Record GQL names in the strategy
    authStrategy.gqlNames = this.gqlNames;
  }

  getTypes({ schemaName }) {
    if (!this.access[schemaName].auth) return [];
    const { unauthenticateOutputName, authenticateOutputName, outputTypeName } = this.gqlNames;
    return [
      `
        type ${unauthenticateOutputName} {
          """
          \`true\` when unauthentication succeeds.
          NOTE: unauthentication always succeeds when the request has an invalid or missing authentication token.
          """
          success: Boolean
        }
      `,
      `
        type ${authenticateOutputName} {
          """ Used to make subsequent authenticated requests by setting this token in a header: 'Authorization: Bearer <token>'. """
          token: String
          """ Retrieve information on the newly authenticated ${outputTypeName} here. """
          item: ${outputTypeName}
        }
      `,
    ];
  }
  getQueries({ schemaName }) {
    if (!this.access[schemaName].auth) return [];
    const { authenticatedQueryName, outputTypeName } = this.gqlNames;
    return [`${authenticatedQueryName}: ${outputTypeName}`];
  }
  getMutations({ schemaName }) {
    if (!this.access[schemaName].auth) return [];
    const {
      authenticateMutationName,
      authenticateOutputName,
      unauthenticateMutationName,
      unauthenticateOutputName,
      outputTypeName,
    } = this.gqlNames;
    const { authStrategy } = this;
    const authTypeTitleCase = upcase(authStrategy.authType);
    return [
      `""" Authenticate and generate a token for a ${outputTypeName} with the ${authTypeTitleCase} Authentication Strategy. """
        ${authenticateMutationName}(${authStrategy.getInputFragment()}): ${authenticateOutputName}
      `,
      `${unauthenticateMutationName}: ${unauthenticateOutputName}`,
    ];
  }

  getTypeResolvers({}) {
    return {};
  }
  getQueryResolvers({ schemaName }) {
    if (!this.access[schemaName].auth) return {};
    const { authenticatedQueryName } = this.gqlNames;
    return {
      [authenticatedQueryName]: (_, __, context, info) => this._authenticatedQuery(context, info),
    };
  }
  getMutationResolvers({ schemaName }) {
    if (!this.access[schemaName].auth) return {};
    const { authenticateMutationName, unauthenticateMutationName } = this.gqlNames;
    return {
      [authenticateMutationName]: (_, args, context) => this._authenticateMutation(args, context),
      [unauthenticateMutationName]: (_, __, context) => this._unauthenticateMutation(context),
    };
  }

  _authenticatedQuery(context, info) {
    if (info && info.cacheControl) {
      info.cacheControl.setCacheHint({ scope: 'PRIVATE' });
    }

    if (!context.authedItem || context.authedListKey !== this.list.key) {
      return null;
    }

    const gqlName = this.gqlNames.authenticatedQueryName;
    const access = this.checkAccess(context, 'query', { gqlName });
    return this.list.itemQuery(
      mergeWhereClause({ where: { id: context.authedItem.id } }, access),
      context,
      this.gqlNames.authenticatedQueryName
    );
  }

  async _authenticateMutation(args, context) {
    const gqlName = this.gqlNames.authenticateMutationName;
    this.checkAccess(context, 'mutation', { gqlName });

    // Verify incoming details
    const { item, success, message } = await this.authStrategy.validate(args, context);
    if (!success) {
      throw new Error(message);
    }

    const token = await context.startAuthedSession({ item, list: this.list });
    return { token, item };
  }

  async _unauthenticateMutation(context) {
    const gqlName = this.gqlNames.unauthenticateMutationName;
    this.checkAccess(context, 'mutation', { gqlName });

    await context.endAuthedSession();
    return { success: true };
  }

  checkAccess(context, type, { gqlName }) {
    const operation = 'auth';
    const access = context.getAuthAccessControlForUser(this.list.key, { gqlName });
    if (!access) {
      graphqlLogger.debug({ operation, access, gqlName }, 'Access statically or implicitly denied');
      graphqlLogger.info({ operation, gqlName }, 'Access Denied');
      // If the client handles errors correctly, it should be able to
      // receive partial data (for the fields the user has access to),
      // and then an `errors` array of AccessDeniedError's
      throwAccessDenied(type, context, gqlName);
    }
    return access;
  }
}

module.exports = { ListAuthProvider };
