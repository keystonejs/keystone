/*
  TODO:
    - work out how (and when) to vaidate the username and password fields
    - allow a validateUser() hook to be provided in config
*/

class PasswordAuthStrategy {
  constructor(keystone, listKey, config) {
    this.keystone = keystone;
    this.listKey = listKey;
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
    const { identityField, secretField } = this.config;
    const identity = args[identityField];
    const secret = args[secretField];

    const list = this.getList();

    // Validate the config
    const secretFieldInstance = list.fieldsByPath[secretField];

    const protectIds = this.config.protectIdentities;
    const genericError = '[passwordAuth:failure] Authentication failed';

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

    // Match by identity
    const results = await list.adapter.find({ [identityField]: identity });

    // If we failed to match an identity and we're protecting existing identities then combat timing
    // attacks by creating an arbitrary hash (should take about as long has comparing an existing one)
    if (results.length !== 1 && protectIds) {
      // TODO: This should call `secretFieldInstance.compare()` to ensure it's
      // always consistent.
      // This may still leak if the workfactor for the password field has changed
      await secretFieldInstance.generateHash('password1234');
      return { success: false, message: genericError };
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

    // Verify the secret matches
    const item = results[0];
    const hash = item[secretField];
    const match = await secretFieldInstance.compare(secret, hash);

    if (!match && protectIds) {
      return { success: false, message: genericError };
    }

    if (!match) {
      const key = '[passwordAuth:secret:mismatch]';
      const message = `${key} The ${secretField} provided is incorrect`;
      return { success: false, message };
    }

    return { success: true, list, item, message: 'Authentication successful' };
  }

  getAdminMeta() {
    const { listKey } = this;
    const { identityField, secretField } = this.config;
    return { listKey, identityField, secretField };
  }
}

PasswordAuthStrategy.authType = 'password';

module.exports = PasswordAuthStrategy;
