import React, { Component } from 'react';
import { OptionRenderer } from '@keystonejs/ui/src/primitives/filters';

function isOptionSelected(opt, selected) {
  return Boolean(selected.filter(x => x.path === opt.path).length);
}
function getOptionValue(opt) {
  return opt.path;
}
function mapToPath(acc, i) {
  acc[i.path] = true;
  return acc;
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
    return fields.map(({ options, ...field }) => field);
  };
  onChangeReturnFieldClass = selected => {
    const { fields: listFields, isMulti, onChange } = this.props;
    const arr = Array.isArray(selected) ? selected : [selected];
    const diffMap = arr.reduce(mapToPath, {});
    const fields = listFields.filter(i => diffMap[i.path]);
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
        onChange={this.onChangeReturnFieldClass}
      />
    );
  }
}
