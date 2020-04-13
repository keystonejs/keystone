import React from 'react';
import { RadioGroup, Radio } from '@arch-ui/filters';

const CheckboxFilterView = ({ onChange, filter, value }) => {
  if (!filter) return null;

  return (
    <RadioGroup onChange={onChange} value={value}>
      <Radio value="true">Checked</Radio>
      <Radio value="false">Unchecked</Radio>
      <Radio value="null">Not set</Radio>
    </RadioGroup>
  );
};

export default CheckboxFilterView;
