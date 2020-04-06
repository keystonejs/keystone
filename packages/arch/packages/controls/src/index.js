import React from 'react';
import {
  CheckboxGroup as ReactCheckboxGroup,
  Checkbox as ReactCheckbox,
  RadioGroup as ReactRadioGroup,
  Radio as ReactRadio,
} from 'react-radios';
import { RadioPrimitive, CheckboxPrimitive } from './primitives';

export const Checkbox = props => <ReactCheckbox component={CheckboxPrimitive} {...props} />;
export const CheckboxGroup = props => <ReactCheckboxGroup {...props} />;

export const Radio = props => <ReactRadio component={RadioPrimitive} {...props} />;
export const RadioGroup = props => <ReactRadioGroup {...props} />;

export { RadioPrimitive, CheckboxPrimitive };
