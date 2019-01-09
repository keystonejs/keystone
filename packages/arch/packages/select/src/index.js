// @flow

import * as React from 'react';
import ReactSelect from 'react-select';
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
      fontSize: '0.9em',
      minHeight: 35,
      minWidth: '200px',
      ':hover': { borderColor: colors.N30 },
      ...focusStyles,
    };
  },
  clearIndicator: indicatorStyles,
  dropdownIndicator: indicatorStyles,
  menu: p => ({ ...p, fontSize: '0.9em' }),
  option: (p, { isDisabled, isFocused, isSelected }) => {
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
      ...p,
      backgroundColor: bg,
      color: txt,

      ':active': cssPseudoActive,
    };
  },
  menuPortal: p => ({ ...p, zIndex: 3 }),
};
export const Select = ({ innerRef, ...props }: { innerRef?: React.Ref<*> }) => (
  <ReactSelect ref={innerRef} styles={selectStyles} {...props} />
);

export default Select;
