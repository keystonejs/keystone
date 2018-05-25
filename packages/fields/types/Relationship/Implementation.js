const {
  Schema: {
    Types: { ObjectId },
  },
} = require('mongoose');

const Implementation = require('../../Implementation');

module.exports = class Select extends Implementation {
  constructor() {
    super(...arguments);
  }
  getGraphqlSchema() {
    const { many, ref } = this.config;
    const type = many ? `[${ref}]` : ref;
    return `${this.path}: ${type}`;
  }
  addToMongooseSchema(schema) {
    const { many, mongooseOptions, ref } = this.config;
    const type = many ? [ObjectId] : ObjectId;
    schema.add({
      [this.path]: { type, ref, ...mongooseOptions },
    });
  }
  extendAdminMeta(meta) {
    const { many, ref } = this.config;
    return { ...meta, ref, many };
  }
  getGraphqlQueryArgs() {
    const { many, ref } = this.config;
    if (many) {
      return `
        # condition must be true for all nodes
        ${this.path}_every: ${ref}WhereInput
        # condition must be true for at least 1 node
        ${this.path}_some: ${ref}WhereInput
        # condition must be false for all nodes
        ${this.path}_none: ${ref}WhereInput
        # is the relation field null
        ${this.path}_is_null: Boolean
      `;
    } else {
      return `
        ${this.path}: ${ref}WhereInput
      `;
    }
  }
  getGraphqlFieldResolvers() {
    const { many, ref } = this.config;
    return {
      [this.path]: item => {
        if (many) {
          return this.getListByKey(ref).model.find({
            _id: { $in: item[this.path] },
          });
        } else {
          return this.getListByKey(ref).model.findById(item[this.path]);
        }
      },
    };
  }
  getGraphqlUpdateArgs() {
    const { many } = this.config;
    const type = many ? '[String]' : 'String';
    return `${this.path}: ${type}`;
  }
  getGraphqlCreateArgs() {
    return this.getGraphqlUpdateArgs();
  }
  getQueryConditions(args, depthGuard) {
    return [];
    /*
    if (this.config.many) {
      return [];
      return this.getQueryConditionsMany(args, depthGuard);
    }

    return this.getQueryConditionsSingle(args, depthGuard);
    */
  }
  getQueryConditionsMany(args/*, depthGuard*/) {
    Object.keys(args || {})
      .filter(filter => filter.startsWith(`${this.path}_`))
      .map(filter => filter);
  }
  getQueryConditionsSingle(args, depthGuard) {
    console.log('single relation args:', args);

    const conditions = [];

    if (!args || !args[this.path]) {
      return conditions;
    }

    const filters = this.getListByKey(this.config.ref).itemsQueryConditions(
      args[this.path],
      depthGuard
    );

    console.log('single relation filters:', filters);

    return filters;
  }
};
