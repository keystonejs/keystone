export default class FieldController {
  constructor(config, list, adminMeta) {
    this.config = config;
    this.label = config.label;
    this.path = config.path;
    this.type = config.type;
    this.list = list;
    this.adminMeta = adminMeta;
  }

  // TODO: This is a bad default; we should (somehow?) inspect the fields provided
  // by the implementations gqlOutputFields
  getQueryFragment = () => this.path;

  getValue = data => data[this.config.path] || '';
  getInitialData = () => this.config.defaultValue || '';
}
