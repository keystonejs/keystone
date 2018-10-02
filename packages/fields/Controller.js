// @flow
/*::
// in a flow comment because otherwise webpack will complain
import List from '@voussoir/admin-ui/client/classes/List';
*/
import type { AdminMeta } from '@voussoir/admin-ui/client/providers/AdminMeta';

type FieldConfig = {
  label: string,
  path: string,
  type: string,
  [key: mixed]: mixed,
};

type FilterType = {
  type: string,
  label: string,
  getInitialValue: () => mixed,
};

export type FieldControllerType = FieldController;

export default class FieldController {
  config: FieldConfig;
  label: string;
  path: string;
  list: List;
  type: string;
  adminMeta: AdminMeta;
  filterTypes: Array<FilterType>;
  getValue: (data: Object) => mixed;
  getQueryFragment: () => string;
  getFilterGraphQL: FilterType => string;
  formatFilter: (...args: any) => string;
  constructor(config: FieldConfig, list: List, adminMeta: AdminMeta) {
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

  getValue = (data: Object) => data[this.config.path] || '';
  getInitialData = () => this.config.defaultValue || '';
}
