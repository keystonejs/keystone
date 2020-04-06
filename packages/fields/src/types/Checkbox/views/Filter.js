import React from 'react';

const CheckboxFilterView = ({ onChange, filter, innerRef, value }) => {
  const handleChange = ({ target: { value } }) => {
    onChange(value);
  };

  if (!filter) return null;

  return (
    <select onChange={handleChange} ref={innerRef} value={value}>
      <option value="true">Checked</option>
      <option value="false">Unchecked</option>
      <option value="null">Not set</option>
    </select>
  );
};

export default CheckboxFilterView;
