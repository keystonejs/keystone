import React, { Component } from 'react';
import { OptionRenderer } from '@voussoir/ui/src/primitives/filters';
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
  includeLabelField: boolean,
};

export const pseudoLabelField = { label: 'Label', path: '_label_' };

export default class FieldSelect extends Component<FieldSelectProps> {
  getSanitizedOptions = () => {
    const { fields, includeLabelField } = this.props;
    const sanitizedOptions = fields.map(({ options, ...field }) => field);
    if (includeLabelField) {
      sanitizedOptions.unshift(pseudoLabelField);
    }
    return sanitizedOptions;
  };
  onChange = selected => {
    const { fields: listFields, isMulti, onChange } = this.props;
    const arr = Array.isArray(selected) ? selected : [selected];
    const diffMap = arrayToObject(arr, 'path', () => true);
    const fields = [pseudoLabelField].concat(listFields).filter(i => diffMap[i.path]);
    const value = isMulti ? fields : fields[0];

    onChange(value);
  };

  render() {
    return (
      <OptionRenderer
        isOptionSelected={isOptionSelected}
        getOptionValue={getOptionValue}
        {...this.props}
        options={this.getSanitizedOptions()}
        onChange={this.onChange}
      />
    );
  }
}
