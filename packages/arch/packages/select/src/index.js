import * as React from 'react';
import { useMemo } from 'react';
import BaseSelect from 'react-select';
import AsyncCreatableSelect from 'react-select/async-creatable';
import AsyncSelect from 'react-select/async';
import CreatableSelect from 'react-select/creatable';
import { colors } from '@arch-ui/theme';

// ==============================
// Styled Select
// ==============================

const indicatorStyles = (provided, { isDisabled, isFocused }) => {
  let styles = {
    color: colors.N20,
    ':hover': !isDisabled && !isFocused ? { color: colors.N40 } : null,
  };
  if (isDisabled) styles = { color: colors.N10 };
  if (isFocused) {
    styles = { color: colors.N60, ':hover': { color: colors.N80 } };
  }
  return {
    ...provided,
    ...styles,
  };
};
const selectStyles = {
  control: (provided, { isFocused }) => {
    const focusStyles = isFocused
      ? {
          borderColor: colors.primary,
          boxShadow: `inset 0 1px 1px rgba(0, 0, 0, 0.075),
      0 0 0 3px ${colors.B.A20}`,
          outline: 0,
        }
      : null;
    return {
      ...provided,
      backgroundColor: 'white',
      borderColor: colors.N20,
      fontSize: '1rem',
      minHeight: 35,
      minWidth: '200px',
      ':hover': { borderColor: colors.N30 },
      ...focusStyles,
    };
  },
  clearIndicator: indicatorStyles,
  dropdownIndicator: indicatorStyles,
  menu: provided => ({
    ...provided,
    fontSize: '0.9em',
    zIndex: 10,
  }),
  option: (provided, { isDisabled, isFocused, isSelected }) => {
    let bg = 'inherit';
    if (isFocused) bg = colors.B.L90;
    if (isSelected) bg = colors.primary;

    let txt = 'inherit';
    if (isFocused) txt = colors.primary;
    if (isSelected) txt = 'white';
    if (isDisabled) txt = colors.N40;

    const cssPseudoActive =
      !isSelected && !isDisabled
        ? {
            backgroundColor: colors.B.L80,
            color: colors.B.D20,
          }
        : {};

    return {
      ...provided,
      fontSize: '1rem',
      backgroundColor: bg,
      color: txt,

      ':active': cssPseudoActive,
    };
  },
  menuPortal: provided => ({
    ...provided,
    zIndex: 3,
  }),
};

const getSelectVariant = ({ isAsync, isCreatable }) => {
  if (isAsync && isCreatable) {
    return AsyncCreatableSelect;
  }
  if (isAsync) {
    return AsyncSelect;
  }
  if (isCreatable) {
    return CreatableSelect;
  }

  return BaseSelect;
};

const Select = ({ isAsync, isCreatable, innerRef, styles, ...props }) => {
  const ReactSelect = getSelectVariant({ isAsync, isCreatable });

  return (
    <ReactSelect
      ref={innerRef}
      styles={useMemo(
        () => ({
          ...selectStyles,
          ...styles,
        }),
        [styles]
      )}
      {...props}
    />
  );
};

export default Select;
