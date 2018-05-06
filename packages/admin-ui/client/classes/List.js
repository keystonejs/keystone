import FieldTypes from '../FIELD_TYPES';

export default class List {
  constructor(config) {
    this.config = config;

    // TODO: undo this
    Object.assign(this, config);

    this.fields = config.fields.map(fieldConfig => {
      const { Controller } = FieldTypes[config.key][fieldConfig.path];
      return new Controller(fieldConfig);
    });
  }
  getInitialItemData() {
    return this.fields.reduce((data, field) => {
      data[field.path] = field.getInitialData();
      return data;
    }, {});
  }
  formatCount(items) {
    const count = Array.isArray(items) ? items.length : items;
    return count === 1 ? `1 ${this.singular}` : `${count} ${this.plural}`;
  }
}
