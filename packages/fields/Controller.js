export default class FieldController {
  constructor(config) {
    this.config = config;

    // TODO: Undo this
    Object.assign(this, config);
  }
  getValue = data => data[this.config.path] || '';
  getInitialData = () => this.config.defaultValue || '';
}
