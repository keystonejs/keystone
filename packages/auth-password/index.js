/*
  TODO:
    - work out how (and when) to validate the username and password fields
    - allow a validateUser() hook to be provided in config
*/

class PasswordAuthStrategy {
  constructor(keystone, listKey, config) {
    this.keystone = keystone;
    this.listKey = listKey;
    this.gqlNames = {}; // Set by the auth provider
    this.config = {
      identityField: 'email',
      secretField: 'password',
      protectIdentities: false,
      ...config,
    };
  }

  getList() {
    return this.keystone.lists[this.listKey];
  }

  getInputFragment() {
    return `
      ${this.config.identityField}: String
      ${this.config.secretField}: String
    `;
  }

  async validate(args) {
    const { secretField } = this.config;

    const list = this.getList();

    // Validate the config
    const secretFieldInstance = list.fieldsByPath[secretField];

    // Ducktype the password field; it needs a comparison function
    if (
      typeof secretFieldInstance.compare !== 'function' ||
      secretFieldInstance.compare.length < 2
    ) {
      throw new Error(
        `Field type specified does not support required functionality.` +
          `The PasswordAuthStrategy for list '${this.listKey}' is using a secretField of '${secretField}'` +
          ` but field type does not provide the required compare() functionality.`
      );
    }
    const { success, item, message } = await this._getItem(list, args, secretFieldInstance);
    if (!success) return { success, message };

    // Verify the secret matches
    const match = await this._matchItem(item, args, secretFieldInstance);

    if (!match.success) {
      return {
        success: false,
        message: this.config.protectIdentities
          ? '[passwordAuth:failure] Authentication failed'
          : match.message,
      };
    }
    return { ...match, list, item };
  }

  async _getItem(list, args, secretFieldInstance) {
    // Match by identity
    const { identityField } = this.config;
    const identity = args[identityField];
    const results = await list.adapter.find({ [identityField]: identity });
    // If we failed to match an identity and we're protecting existing identities then combat timing
    // attacks by creating an arbitrary hash (should take about as long has comparing an existing one)
    if (results.length !== 1 && this.config.protectIdentities) {
      // TODO: This should call `secretFieldInstance.compare()` to ensure it's
      // always consistent.
      // This may still leak if the workfactor for the password field has changed
      const hash = await secretFieldInstance.generateHash(
        'simulated-password-to-counter-timing-attack'
      );
      await secretFieldInstance.compare('', hash);
      return { success: false, message: '[passwordAuth:failure] Authentication failed' };
    }

    // Identity failures with helpful errors
    if (results.length === 0) {
      const key = '[passwordAuth:identity:notFound]';
      const message = `${key} The ${identityField} provided didn't identify any ${list.plural}`;
      return { success: false, message };
    }
    if (results.length > 1) {
      const key = '[passwordAuth:identity:multipleFound]';
      const message = `${key} The ${identityField} provided identified ${results.length} ${list.plural}`;
      return { success: false, message };
    }
    const item = results[0];
    return { success: true, item };
  }

  async _matchItem(item, args, secretFieldInstance) {
    const { secretField } = this.config;
    const secret = args[secretField];
    if (item[secretField]) {
      const success = await secretFieldInstance.compare(secret, item[secretField]);
      return {
        success,
        message: success
          ? 'Authentication successful'
          : `[passwordAuth:secret:mismatch] The ${secretField} provided is incorrect`,
      };
    }

    const hash = await secretFieldInstance.generateHash(
      'simulated-password-to-counter-timing-attack'
    );
    await secretFieldInstance.compare(secret, hash);
    return {
      success: false,
      message:
        '[passwordAuth:secret:notSet] The item identified has no secret set so can not be authenticated',
    };
  }

  getAdminMeta() {
    const { listKey, gqlNames } = this;
    const { identityField, secretField } = this.config;
    return { listKey, gqlNames, identityField, secretField };
  }
}

PasswordAuthStrategy.authType = 'password';

module.exports = { PasswordAuthStrategy };
