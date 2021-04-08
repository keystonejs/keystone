import { PrismaFieldAdapter } from '@keystone-next/adapter-prisma-legacy';
import { Implementation } from '../../Implementation';

export class Text extends Implementation {
  constructor(path, { isMultiline }) {
    super(...arguments);
    this.isMultiline = isMultiline;
    this.isOrderable = true;
  }

  get _supportsUnique() {
    return true;
  }

  gqlOutputFields() {
    return [`${this.path}: String`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }
  gqlQueryInputFields() {
    const { listAdapter } = this.adapter;
    return [
      ...this.equalityInputFields('String'),
      ...(listAdapter.name === 'prisma' && listAdapter.provider === 'sqlite'
        ? []
        : [
            ...this.stringInputFields('String'),
            ...this.equalityInputFieldsInsensitive('String'),
            ...this.stringInputFieldsInsensitive('String'),
          ]),
      ...this.inInputFields('String'),
    ];
  }
  gqlUpdateInputFields() {
    return [`${this.path}: String`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: String`];
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'string | null' } };
  }
}

export class PrismaTextInterface extends PrismaFieldAdapter {
  constructor() {
    super(...arguments);
    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
  }

  getPrismaSchema() {
    return [this._schemaField({ type: 'String' })];
  }

  getQueryConditions(dbPath) {
    const { listAdapter } = this;
    return {
      ...this.equalityConditions(dbPath),
      ...(listAdapter.provider === 'sqlite'
        ? {}
        : {
            ...this.stringConditions(dbPath),
            ...this.equalityConditionsInsensitive(dbPath),
            ...this.stringConditionsInsensitive(dbPath),
          }),
      // These have no case-insensitive counter parts
      ...this.inConditions(dbPath),
    };
  }
}
