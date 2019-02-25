const Integer = require('@voussoir/field-integer');

class Stars extends Integer.implementation {
  extendAdminMeta(meta) {
    return { ...meta, starCount: this.config.starCount || 5 };
  }
}

module.exports = {
  Stars,
  MongoStarsInterface: Integer.adapters.mongoose,
  KnexStarsInterface: Integer.adapters.knex,
};
