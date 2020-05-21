import React from 'react';
import { Input } from '@arch-ui/input';

const DecimalFilterView = ({ onChange, filter, field, innerRef, value }) => {
  const valueToString = value => {
    // Make the value a string to prevent loss of accuracy and precision.
    if (typeof value === 'string') {
      return value;
    } else if (typeof value === 'number') {
      return String(value);
    } else {
      // If it is neither string nor number then it must be empty.
      return '';
    }
  };

  const handleChange = event => {
    const value = event.target.value;
    onChange(value.replace(/[^0-9.,]+/g, ''));
  };

  const placeholder = field.getFilterLabel(filter);

  return (
    <Input
      onChange={handleChange}
      ref={innerRef}
      placeholder={placeholder}
      value={valueToString(value)}
    />
  );
};

export default DecimalFilterView;
