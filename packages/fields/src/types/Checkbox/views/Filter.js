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

  const textValue = Object.entries(inputMap).find(([, v]) => v === value)[0];
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
