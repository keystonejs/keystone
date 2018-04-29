import React, { Component } from 'react';
import Select from 'react-select';

import {
  FieldContainer,
  FieldLabel,
  FieldInput,
} from '@keystonejs/ui/src/primitives/fields';

const styles = {
  control: (base, { isFocused }) => ({
    ...base,
    backgroundColor: 'white',
    fontFamily: 'inherit',
    borderRadius: '0.3rem',
    boxShadow: isFocused
      ? 'inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 0 3px rgba(19, 133, 229, 0.1)'
      : 'inset 0 1px 1px rgba(0, 0, 0, 0.075)',
    transition: 'border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s',
  }),
};

class SelectField extends Component {
  onChange = option => {
    const { field, onChange } = this.props;
    onChange(field, option.value);
  };
  render() {
    const { field, item } = this.props;
    const value = field.options.filter(i => i.value === item[field.path])[0];
    return (
      <FieldContainer>
        <FieldLabel>{field.label}</FieldLabel>
        <FieldInput>
          <Select
            styles={styles}
            value={value}
            options={field.options}
            onChange={this.onChange}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}
SelectField.getInitialData = () => null;
export default SelectField;
