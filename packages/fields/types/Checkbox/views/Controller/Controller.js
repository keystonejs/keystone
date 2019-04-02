/* eslint-disable import/no-extraneous-dependencies */

import FieldController from '../../../../Controller/src/index';

export default class CheckboxController extends FieldController {
  getValue = data => data[this.config.path] || false;
  getInitialData = () => this.config.defaultValue || false;
  getFilterGraphQL = ({ type, value }) => {
    const key = type === 'is' ? `${this.path}` : `${this.path}_${type}`;
    return `${key}: ${value}`;
  };
  getFilterLabel = ({ label }) => {
    return `${this.label} ${label.toLowerCase()}`;
  };
  formatFilter = ({ label, value }) => {
    return `${this.getFilterLabel({ label })}: "${value}"`;
  };
  getFilterTypes = () => [
    {
      type: 'is',
      label: 'Is',
      getInitialValue: () => 'true',
    },
    {
      type: 'not',
      label: 'Is not',
      getInitialValue: () => 'true',
    },
  ];
}
