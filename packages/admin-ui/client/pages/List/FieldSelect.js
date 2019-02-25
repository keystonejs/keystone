import React, { Component } from 'react';
import { Options } from '@arch-ui/options';
import { arrayToObject } from '@voussoir/utils';

function isOptionSelected(opt, selected) {
  return Boolean(selected.filter(x => x.path === opt.path).length);
}
function getOptionValue(opt) {
  return opt.path;
}

/**
 * Why does this exist?
 * --------------------
 * Because fields can contain an `options` property, which react-select
 * interprets as an OptionGroup.
 *
 * How does it solve the problem?
 * ------------------------------
 * By removing the `options` property before passing fields on to react-select,
 * and returning it during `onChange`.
 */

type FieldType = Object;
export type FieldSelectProps = {
  fields: Array<FieldType>,
  onChange: FieldType => void,
  value: FieldType | Array<FieldType>,
};

export default class FieldSelect extends Component<FieldSelectProps> {
  getSanitizedOptions = () => {
    const { fields } = this.props;
    const sanitizedOptions = fields
      .filter(field => !!field.getFilterTypes())
      .map(({ options, ...field }) => field);
    return sanitizedOptions;
  };
  onChange = selected => {
    const { fields: listFields, isMulti, onChange } = this.props;
    const arr = Array.isArray(selected) ? selected : [selected];
    const diffMap = arrayToObject(arr, 'path', () => true);
    const fields = listFields.filter(i => diffMap[i.path]);
    const value = isMulti ? fields : fields[0];

    onChange(value);
  };

  render() {
    return (
      <Options
        isOptionSelected={isOptionSelected}
        getOptionValue={getOptionValue}
        {...this.props}
        options={this.getSanitizedOptions()}
        onChange={this.onChange}
      />
    );
  }
}
