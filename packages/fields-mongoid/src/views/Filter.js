import React from 'react';
import { Input } from '@arch-ui/input';

const MongoIdFilterView = ({ onChange, filter, field, innerRef, value }) => {
  const handleChange = ({ target: { value } }) => {
    onChange(value);
  };

  if (!filter) return null;

  const placeholder = field.getFilterLabel(filter);

  return <Input onChange={handleChange} ref={innerRef} placeholder={placeholder} value={value} />;
};

export default MongoIdFilterView;
