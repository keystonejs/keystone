import { Implementation } from '../../Implementation';
// import { MongooseFieldAdapter } from '@keystone-alpha/adapter-mongoose';
import { KnexFieldAdapter } from '@keystone-alpha/adapter-knex';

export class Uuid extends Implementation {
  constructor(path, {}) {
    super(...arguments);
  }
  get gqlOutputFields() {
    return [`${this.path}: ID`];
  }
  get gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }
  get gqlQueryInputFields() {
    return [...this.equalityInputFields('ID'), ...this.inInputFields('ID')];
  }
  get gqlUpdateInputFields() {
    return [`${this.path}: ID`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: ID`];
  }
}

// TODO: Build out the Mongo field adapter using the binary subtype (0x04)
// We don't want to use strings because strings are case sensitive.
// Even though we often pass UUIDs around in the `8-4-4-4-12` format, this is hex and
// so stirng based equality comparisons will fail us. See also...
//  - https://studio3t.com/knowledge-base/articles/mongodb-best-practices-uuid-data/#mongodb-best-practices
//  - https://medium.com/@cdimascio/uuids-with-mongodb-and-node-js-d4a8a188344b

export class KnexUuidInterface extends KnexFieldAdapter {
  createColumn(table) {
    return table.uuid(this.path);
  }
  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath, v => v.toUpperCase()),
      ...this.inConditions(dbPath, v => v.toUpperCase()),
    };
  }
}
