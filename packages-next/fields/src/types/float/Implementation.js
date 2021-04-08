import { PrismaFieldAdapter } from '@keystone-next/adapter-prisma-legacy';
import { Implementation } from '../../Implementation';

export class Float extends Implementation {
  constructor() {
    super(...arguments);
    this.isOrderable = true;
  }

  get _supportsUnique() {
    return true;
  }

  gqlOutputFields() {
    return [`${this.path}: Float`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  gqlQueryInputFields() {
    return [
      ...this.equalityInputFields('Float'),
      ...this.orderingInputFields('Float'),
      ...this.inInputFields('Float'),
    ];
  }
  gqlUpdateInputFields() {
    return [`${this.path}: Float`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: Float`];
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'number | null' } };
  }
}

export class PrismaFloatInterface extends PrismaFieldAdapter {
  constructor() {
    super(...arguments);
  }

  getPrismaSchema() {
    return this._schemaField({ type: 'Float' });
  }

  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath),
      ...this.orderingConditions(dbPath),
      ...this.inConditions(dbPath),
    };
  }
}
