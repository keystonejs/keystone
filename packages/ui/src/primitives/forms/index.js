// @flow

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, type Ref } from 'react';
import ReactSelect from 'react-select';

import { borderRadius, colors, gridSize } from '../../theme';
import { alpha } from '../../theme/color-utils';

export {
  Checkbox,
  CheckboxPrimitive,
  CheckboxGroup,
  Radio,
  RadioPrimitive,
  RadioGroup,
} from './Controls';
export { DayPicker, DateTimePicker } from './DayPicker';

// Styles shared between input and buttons
// ------------------------------

export const buttonAndInputBase = {
  appearance: 'none',
  background: 'none',
  border: '1px solid transparent',
  borderRadius: borderRadius,
  boxSizing: 'border-box',
  fontSize: '0.9rem',
  lineHeight: '17px',
  margin: 0,
  padding: `${gridSize}px ${gridSize * 1.5}px`,
  transition: 'box-shadow 100ms linear',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};

// Basic Input
// ------------------------------

type InputProps = { innerRef: Ref<*>, isMultiline?: boolean, disabled?: boolean };
export const Input = ({ innerRef, isMultiline, ...props }: InputProps) => {
  const css = {
    ...buttonAndInputBase,
    backgroundColor: props.disabled ? colors.N10 : 'white',
    borderColor: colors.N20,
    boxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.075)',
    color: 'inherit',
    width: '100%',

    ':hover': {
      borderColor: colors.N30,
      outline: 0,
    },
    ':focus': {
      borderColor: colors.primary,
      boxShadow: `inset 0 1px 1px rgba(0, 0, 0, 0.075),
        0 0 0 3px ${alpha(colors.primary, 0.2)}`,
      outline: 0,
    },
    '&[disabled]': {
      borderColor: colors.N15,
      boxShadow: 'none',
      backgroundColor: colors.N05,
    },
  };
  return isMultiline ? (
    <textarea ref={innerRef} css={{ ...css, lineHeight: 'inherit', height: 'auto' }} {...props} />
  ) : (
    <input ref={innerRef} css={css} {...props} />
  );
};

// Re-Style React Select
// ------------------------------

export const selectStyles = {
  control: (base: *, { isFocused }: { isFocused: Boolean }) => ({
    ...base,
    backgroundColor: 'white',
    color: 'inherit',
    borderRadius: borderRadius,
    borderColor: isFocused ? colors.primary : colors.N20,
    boxShadow: isFocused
      ? `inset 0 1px 1px rgba(0, 0, 0, 0.075),
        0 0 0 3px ${alpha(colors.primary, 0.2)}`
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

export const Select = (props: *) => <ReactSelect styles={selectStyles} isClearable {...props} />;

// Hidden Input
// ------------------------------

export const HiddenInput = ({ innerRef, ...props }: { innerRef?: Ref<*> }) => (
  <input
    ref={innerRef}
    tabIndex="-1"
    css={{
      border: 0,
      clip: 'rect(1px, 1px, 1px, 1px)',
      height: 1,
      margin: 0,
      opacity: 0,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      whiteSpace: 'nowrap',
      width: 1,
    }}
    {...props}
  />
);

// Autocomplete Captor
// ==============================

/*
 *  Why?
 *  ------------------------------
 *  For a while now browsers have been ignoring the `autocomplete="off"`
 *  property on form and input elements:
 *  - https://bugs.chromium.org/p/chromium/issues/detail?id=468153#c164
 *
 *  How?
 *  ------------------------------
 *  Browsers will autocomplete inputs in the order they're encountered; this
 *  component will capture the browser's attempt to autocomplete into these
 *  two hidden inputs and leave your legitimate fields unpolluted.
 *
 *  NOTE
 *  ------------------------------
 *  This component *must* be rendered before your legitimate fields.
 */

export const AutocompleteCaptor = () => (
  <Fragment>
    <HiddenInput type="text" tabIndex={-1} />
    <HiddenInput type="password" tabIndex={-1} />
  </Fragment>
);
