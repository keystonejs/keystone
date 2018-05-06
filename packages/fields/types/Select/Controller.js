import FieldController from '../../Controller';

export default class SelectController extends FieldController {
  constructor(...args) {
    super(...args);
    this.options = this.config.options;
  }
  getValue = data => {
    const { path } = this.config;
    return data[path] ? data[path] : null;
  };
  getInitialData = () => {
    return this.config.defaultValue || null;
  };
}
