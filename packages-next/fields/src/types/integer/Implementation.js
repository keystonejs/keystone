import { PrismaFieldAdapter } from '@keystone-next/adapter-prisma-legacy';
import { Implementation } from '../../Implementation';

export class Integer extends Implementation {
  constructor() {
    super(...arguments);
    this.isOrderable = true;
  }

  get _supportsUnique() {
    return true;
  }

  gqlOutputFields() {
    return [`${this.path}: Int`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  gqlQueryInputFields() {
    return [
      ...this.equalityInputFields('Int'),
      ...this.orderingInputFields('Int'),
      ...this.inInputFields('Int'),
    ];
  }
  gqlUpdateInputFields() {
    return [`${this.path}: Int`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: Int`];
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'number | null' } };
  }
}

export class PrismaIntegerInterface extends PrismaFieldAdapter {
  constructor() {
    super(...arguments);
  }

  getPrismaSchema() {
    return this._schemaField({ type: 'Int' });
  }

  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath),
      ...this.orderingConditions(dbPath),
      ...this.inConditions(dbPath),
    };
  }
}
