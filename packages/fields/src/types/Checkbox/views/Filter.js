import React from 'react';
import { RadioGroup, Radio } from '@arch-ui/filters';

const inputMap = {
  is_true: true,
  is_false: false,
  is_null: null,
};

const CheckboxFilterView = ({ onChange, filter, value }) => {
  const handleChange = newValue => {
    onChange(inputMap[newValue]);
  };

  const textValue = value === true ? 'is_true' : value === false ? 'is_false' : 'is_null';
  if (!filter) return null;

  return (
    <RadioGroup onChange={handleChange} value={textValue}>
      <Radio value="is_true">True</Radio>
      <Radio value="is_false">False</Radio>
      <Radio value="is_null">Not set</Radio>
    </RadioGroup>
  );
};

export default CheckboxFilterView;
