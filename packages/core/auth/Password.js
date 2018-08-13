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
      usernameField: 'email',
      passwordField: 'password',
      ...config,
    };
  }
  getList() {
    return this.keystone.lists[this.listKey];
  }
  async validate({ username, password }) {
    const list = this.getList();
    const { usernameField, passwordField } = this.config;
    try {
      const item = await list.adapter.findOne({
        [usernameField]: username,
        [passwordField]: password,
      });
      return item ? { success: true, list, item } : { success: false };
    } catch (error) {
      return { success: false, error };
    }
  }
}

PasswordAuthStrategy.authType = 'password';

module.exports = PasswordAuthStrategy;
