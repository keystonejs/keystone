const { mergeWhereClause, upcase } = require('@keystonejs/utils');
const { logger } = require('@keystonejs/logger');

const { throwAccessDenied } = require('../ListTypes/graphqlErrors');

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
      updateAuthenticatedMutationName: `updateAuthenticated${itemQueryName}`,
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
      updateAuthenticatedMutationName,
      outputTypeName,
    } = this.gqlNames;
    const { authStrategy } = this;
    const authTypeTitleCase = upcase(authStrategy.authType);
    const ret = [
      `""" Authenticate and generate a token for a ${outputTypeName} with the ${authTypeTitleCase} Authentication Strategy. """
        ${authenticateMutationName}(${authStrategy.getInputFragment()}): ${authenticateOutputName}
      `,
      `${unauthenticateMutationName}: ${unauthenticateOutputName}`,
    ];
    const updateFields = this.list.getFieldsWithAccess({ schemaName, access: 'update' });
    const schemaAccess = this.access[schemaName];
    if (schemaAccess.update && updateFields.length) {
      ret.push(
        `${updateAuthenticatedMutationName}(data: ${this.list.gqlNames.updateInputName}): ${outputTypeName}`
      );
    }
    return ret;
  }
  getSubscriptions({}) {
    return [];
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
    const {
      updateAuthenticatedMutationName,
      authenticateMutationName,
      unauthenticateMutationName,
    } = this.gqlNames;
    const ret = {
      [authenticateMutationName]: (_, args, context) => this._authenticateMutation(args, context),
      [unauthenticateMutationName]: (_, __, context) => this._unauthenticateMutation(context),
    };
    const updateFields = this.list.getFieldsWithAccess({ schemaName, access: 'update' });
    const schemaAccess = this.access[schemaName];
    if (schemaAccess.update && updateFields.length) {
      ret[updateAuthenticatedMutationName] = (_, args, context) =>
        this._updateMutation(args, context);
    }
    return ret;
  }
  getSubscriptionResolvers({}) {
    return {};
  }

  async _authenticatedQuery(context, info) {
    if (info && info.cacheControl) {
      info.cacheControl.setCacheHint({ scope: 'PRIVATE' });
    }

    if (!context.authedItem || context.authedListKey !== this.list.key) {
      return null;
    }

    const gqlName = this.gqlNames.authenticatedQueryName;
    const access = await this.checkAccess(context, 'query', { gqlName });
    return this.list.itemQuery(
      mergeWhereClause({ where: { id: context.authedItem.id } }, access),
      context,
      this.gqlNames.authenticatedQueryName
    );
  }

  async _authenticateMutation(args, context) {
    const gqlName = this.gqlNames.authenticateMutationName;
    await this.checkAccess(context, 'mutation', { gqlName });

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
    await this.checkAccess(context, 'mutation', { gqlName });

    await context.endAuthedSession();
    return { success: true };
  }

  async _updateMutation({ data }, context) {
    const gqlName = this.gqlNames.updateAuthenticatedMutationName;

    if (!context.authedItem || context.authedListKey !== this.list.key) {
      // Not logged in? Can't update the data
      throwAccessDenied('mutation', context, gqlName);
    }

    await this.checkAccess(context, 'mutation', { gqlName });

    return this.list.updateMutation(context.authedItem.id, data, context);
  }

  async checkAccess(context, type, { gqlName }) {
    const operation = 'auth';
    const access = await context.getAuthAccessControlForUser(this.list.access, this.list.key, {
      gqlName,
      context,
    });
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
