const { mergeWhereClause, upcase } = require('@keystonejs/utils');
const { throwAccessDenied, ValidationFailureError } = require('../ListTypes/graphqlErrors');
const { graphqlLogger } = require('../Keystone/logger');

class HookManager {
  constructor({ name, listKey, hooks = {} }) {
    this.name = name;
    this.hooks = hooks;
    this.listKey = listKey;
  }

  async resolveAuthInput({ context, operation, originalInput }) {
    const { listKey } = this;
    let resolvedData = originalInput;

    if (this.hooks.resolveAuthInput) {
      const args = { context, originalInput, operation, listKey };
      // And run any list-level hook
      resolvedData = await this.hooks.resolveAuthInput(args);
      if (typeof resolvedData !== 'object') {
        const method = `${this.name}.hooks.resolveAuthInput()`;
        throw new Error(
          `Expected ${method} to return an object, but got a ${typeof resolvedData}: ${resolvedData}`
        );
      }
    }

    // Finally returning the amalgamated result of all the hooks.
    return resolvedData;
  }

  async validateAuthInput({ resolvedData, context, operation, originalInput }) {
    const { listKey } = this;
    const args = { resolvedData, context, originalInput, operation, listKey };

    if (this.hooks['validateAuthInput']) {
      const listValidationErrors = [];
      await this.hooks['validateAuthInput']({
        ...args,
        addValidationError: (msg, _data = {}, internalData = {}) =>
          listValidationErrors.push({ msg, data: _data, internalData }),
      });
      if (listValidationErrors.length) {
        throw new ValidationFailureError({
          data: {
            messages: listValidationErrors.map(e => e.msg),
            errors: listValidationErrors.map(e => e.data),
            operation,
          },
          internalData: {
            errors: listValidationErrors.map(e => e.internalData),
            data: originalInput,
          },
        });
      }
    }
  }

  async beforeAuth({ resolvedData, context, operation, originalInput }) {
    const { listKey } = this;
    const args = { resolvedData, context, originalInput, operation, listKey };
    if (this.hooks.beforeAuth) await this.hooks.beforeAuth(args);
  }

  async afterAuth({
    operation,
    item,
    success,
    message,
    token,
    originalInput,
    resolvedData,
    context,
  }) {
    const { listKey } = this;
    const args = {
      resolvedData,
      context,
      operation,
      originalInput,
      item,
      success,
      message,
      token,
      listKey,
    };
    if (this.hooks.afterAuth) await this.hooks.afterAuth(args);
  }

  async beforeUnauth({ operation, context }) {
    const { listKey } = this;
    const args = { context, operation, listKey };
    if (this.hooks.beforeUnauth) await this.hooks.beforeUnauth(args);
  }

  async afterUnauth({ operation, context, listKey, itemId }) {
    const args = { context, operation, listKey, itemId };
    if (this.hooks.afterUnauth) await this.hooks.afterUnauth(args);
  }
}

class ListAuthProvider {
  constructor({ authStrategy, list, hooks }) {
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
    this.hookManager = new HookManager({
      name: authStrategy.constructor.name,
      hooks,
      listKey: list.key,
    });
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

  async _authenticateMutation(originalInput, context) {
    const gqlName = this.gqlNames.authenticateMutationName;
    await this.checkAccess(context, 'mutation', { gqlName });
    const operation = 'authenticate';
    const resolvedData = await this.hookManager.resolveAuthInput({
      operation,
      originalInput,
      context,
    });
    await this.hookManager.validateAuthInput({ operation, originalInput, resolvedData, context });
    await this.hookManager.beforeAuth({ operation, originalInput, resolvedData, context });
    // Verify incoming details
    const { item, success, message } = await this.authStrategy.validate(resolvedData, context);
    if (!success) {
      throw new Error(message);
    }

    const token = await context.startAuthedSession({ item, list: this.list });
    await this.hookManager.afterAuth({
      operation,
      item,
      success,
      message,
      token,
      originalInput,
      resolvedData,
      context,
    });
    return { token, item };
  }

  async _unauthenticateMutation(context) {
    const gqlName = this.gqlNames.unauthenticateMutationName;
    await this.checkAccess(context, 'mutation', { gqlName });
    const operation = 'unauthenticate';
    await this.hookManager.beforeUnauth({ operation, context });
    const { success, listKey, itemId } = await context.endAuthedSession();
    await this.hookManager.afterUnauth({ operation, context, success, listKey, itemId });
    return { success };
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
