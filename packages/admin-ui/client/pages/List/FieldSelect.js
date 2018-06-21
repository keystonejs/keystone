import React, { Component } from 'react';
import { OptionRenderer } from '@keystonejs/ui/src/primitives/filters';

type FieldType = Object;
export type FieldSelectProps = {
  fields: Array<FieldType>,
  onChange: FieldType => void,
  value: FieldType | Array<FieldType>,
};

function isOptionSelected(opt, selected) {
  return Boolean(selected.filter(x => x.path === opt.path).length);
}
function getOptionValue(opt) {
  return opt.path;
}

/**
 * Why?
 *
 * Because fields can contain an `options` property, which react-select
 * interprets as an OptionGroup.
 *
 * How?
 *
 * Remove the options property on the way in, and return it during `onChange`.
 */
export default class FieldSelect extends Component<FieldSelectProps> {
  getSanitizedOptions = () => {
    const { fields } = this.props;
    return fields.map(({ options, ...field }) => field);
  };
  onChangeReturnFieldClass = selected => {
    const { fields: listFields, isMulti, onChange } = this.props;

    const fields = listFields.filter(lf => {
      return isMulti
        ? selected.filter(sf => sf.path === lf.path).length
        : selected.path === lf.path;
    });

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
