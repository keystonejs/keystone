import { PrismaFieldAdapter } from '@keystone-next/adapter-prisma-legacy';
import { Implementation } from '@keystone-next/fields-legacy';

export class Checkbox extends Implementation {
  constructor() {
    super(...arguments);
    this.isOrderable = true;
  }

  get _supportsUnique() {
    return false;
  }

  gqlOutputFields() {
    return [`${this.path}: Boolean`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  gqlQueryInputFields() {
    return this.equalityInputFields('Boolean');
  }
  gqlUpdateInputFields() {
    return [`${this.path}: Boolean`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: Boolean`];
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'boolean | null' } };
  }
}

export class PrismaCheckboxInterface extends PrismaFieldAdapter {
  constructor() {
    super(...arguments);

    // Error rather than ignoring invalid config
    if (this.config.isIndexed) {
      throw (
        `The Checkbox field type doesn't support indexes on Prisma. ` +
        `Check the config for ${this.path} on the ${this.field.listKey} list`
      );
    }
  }
  getPrismaSchema() {
    return [this._schemaField({ type: 'Boolean' })];
  }

  getQueryConditions(dbPath) {
    return this.equalityConditions(dbPath);
  }
}
