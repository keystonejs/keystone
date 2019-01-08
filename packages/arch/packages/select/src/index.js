// @flow

import React from 'react';
import ReactSelect from 'react-select';

// Re-Style React Select
// ------------------------------
const colors = '#2684FF';
const borderRadius = 15;

const selectStyles = {
  control: (base: *, { isFocused }: { isFocused: Boolean }) => ({
    ...base,
    backgroundColor: 'white',
    color: 'inherit',
    borderRadius: borderRadius,
    borderColor: isFocused ? colors.primary : colors.N20,
    boxShadow: isFocused
      ? `inset 0 1px 1px rgba(0, 0, 0, 0.075),
        0 0 0 3px ${colors.primary}`
      : 'inset 0 1px 1px rgba(0, 0, 0, 0.075)',
    fontFamily: 'inherit',
    fontSize: 14,
    transition: 'border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s',
    '&:hover': {
      borderColor: isFocused ? colors.primary : colors.N30,
    },
  }),
  option: (base: *) => ({
    ...base,
    fontSize: 14,
  }),
  singleValue: (base: *) => ({
    ...base,
    color: 'inherit',
    fontSize: 14,
  }),
  multiValueLabel: (base: *) => ({
    ...base,
    color: 'inherit',
    fontSize: 14,
  }),
  multiValueRemove: (base: *) => ({
    ...base,
    svg: {
      height: '100%',
    },
  }),
};

const Select = (props: *) => <ReactSelect styles={selectStyles} isClearable {...props} />;

export default Select;
