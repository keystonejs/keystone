export default class FieldController {
  constructor(config) {
    this.config = config;

    // TODO: Undo this
    Object.assign(this, config);
  }
  getInitialData = () => '';
}
