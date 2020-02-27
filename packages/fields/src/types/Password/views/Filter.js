import React from 'react';
import { RadioGroup, Radio } from '@arch-ui/filters';

const PasswordFilterView = ({ onChange, value }) => {
  const handleChange = newValue => {
    const boolValue = newValue === 'is_set' ? true : false;
    onChange(boolValue);
  };

  const textValue = value ? 'is_set' : 'is_not_set';

  return (
    <RadioGroup onChange={handleChange} value={textValue}>
      <Radio value="is_set">Is Set</Radio>
      <Radio value="is_not_set">Is NOT Set</Radio>
    </RadioGroup>
  );
};

export default PasswordFilterView;
