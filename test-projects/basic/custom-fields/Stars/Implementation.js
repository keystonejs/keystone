const {
  Integer,
  MongoIntegerInterface,
  KnexIntegerInterface,
} = require('@voussoir/fields/types/Integer/Implementation');

class Stars extends Integer {
  extendAdminMeta(meta) {
    return { ...meta, starCount: this.config.starCount || 5 };
  }
}

module.exports = {
  Stars,
  MongoIntegerInterface,
  KnexIntegerInterface,
};
