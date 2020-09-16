const { Integer } = require('@keystonejs/fields');

class Stars extends Integer.implementation {
  constructor(path, { starCount = 5 }) {
    super(...arguments);
    this.starCount = starCount;
  }

  extendAdminMeta(meta) {
    return { ...meta, starCount: this.starCount };
  }
}

module.exports = {
  Stars,
  MongoIntegerInterface: Integer.adapters.mongoose,
  KnexIntegerInterface: Integer.adapters.knex,
};
