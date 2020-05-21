import React from 'react';
import { Input } from '@arch-ui/input';

const FileFilterView = ({ onChange, filter, field, innerRef, value }) => {
  const handleChange = event => {
    const value = event.target.value;
    onChange(value.replace(/\D/g, ''));
  };

  if (!filter) return null;

  const placeholder = field.getFilterLabel(filter);

  return <Input onChange={handleChange} ref={innerRef} placeholder={placeholder} value={value} />;
};

export default FileFilterView;
