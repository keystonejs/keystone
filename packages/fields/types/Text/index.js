const Field = require('../../Field');

const { escapeRegExp: esc } = require('@keystone/utils');

/* TODO: need to re-think how query filters are built up. currently, the last
one will override any previous ones, and we can't pass a regexp to .ne so will
need to refactor to build the query using $or and $not */

module.exports = class Text extends Field {
  constructor(path, config) {
    super(path, config);
    this.graphQLType = 'String';
  }
  addToMongooseSchema(schema) {
    const { mongooseOptions } = this.config;
    schema.add({
      [this.path]: { type: String, ...mongooseOptions },
    });
  }
  getGraphqlQueryArgs() {
    return `
      ${this.path}: String
      ${this.path}_case_sensitive: Boolean
      # ${this.path}_not: String
      # ${this.path}_in: [String!]
      # ${this.path}_not_in: [String!]
      ${this.path}_contains: String
      # ${this.path}_not_contains: String
      ${this.path}_starts_with: String
      # ${this.path}_not_starts_with: String
      ${this.path}_ends_with: String
      # ${this.path}_not_ends_with: String
    `;
  }
  addFiltersToQuery(query, args) {
    const caseSensitive = args[`${this.path}_case_sensitive`];
    const rx_cs = caseSensitive ? '' : 'i';
    const eq = this.path;
    if (eq in args) {
      if (caseSensitive) {
        query.where(this.path, eq);
      } else {
        const eq_rx = new RegExp(`^${esc(args[eq])}$`, rx_cs);
        query.where(this.path, eq_rx);
      }
    }
    // const not = `${this.path}_not`;
    // if (not in args) {
    //   if (caseSensitive) {
    //     query.ne(this.path, eq);
    //   } else {
    //     const not_rx = new RegExp(`^${esc(args[not])}$`, rx_cs);
    //     query.ne(this.path, not_rx);
    //   }
    // }
    // const is_in = `${this.path}_in`;
    // if (is_in in args) {
    //   query.in(this.path, args[is_in]);
    // }
    // const not_in = `${this.path}_not_in`;
    // if (not_in in args) {
    //   query.nin(this.path, args[not_in]);
    // }
    const contains = `${this.path}_contains`;
    if (contains in args) {
      const contains_rx = new RegExp(esc(args[contains]), rx_cs);
      query.where(this.path, contains_rx);
    }
    // const not_contains = `${this.path}_not_contains`;
    // if (not_contains in args) {
    //   const not_contains_rx = new RegExp(esc(args[not_contains]), rx_cs);
    //   query.ne(this.path, not_contains_rx);
    // }
    const starts_with = `${this.path}_starts_with`;
    if (starts_with in args) {
      const starts_with_rx = new RegExp(`^${esc(args[starts_with])}`, rx_cs);
      query.where(this.path, starts_with_rx);
    }
    // const not_starts_with = `${this.path}_not_starts_with`;
    // if (not_starts_with in args) {
    //   const not_starts_with_rx = new RegExp(
    //     `^${esc(args[not_starts_with])}`,
    //     rx_cs
    //   );
    //   query.ne(this.path, not_starts_with_rx);
    // }
    const ends_with = `${this.path}_ends_with`;
    if (ends_with in args) {
      const ends_with_rx = new RegExp(`${esc(args[ends_with])}$`, rx_cs);
      query.where(this.path, ends_with_rx);
    }
    // const not_ends_with = `${this.path}_not_ends_with`;
    // if (not_ends_with in args) {
    //   const not_ends_with_rx = new RegExp(
    //     `${esc(args[not_ends_with])}$`,
    //     rx_cs
    //   );
    //   query.ne(this.path, not_ends_with_rx);
    // }
  }
};
