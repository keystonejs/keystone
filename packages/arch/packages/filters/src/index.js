/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Children } from 'react';
import {
  CheckboxGroup as _CheckboxGroup,
  Checkbox as _Checkbox,
  RadioGroup as _RadioGroup,
  Radio as _Radio,
} from 'react-radios';

import { colors } from '@arch-ui/theme';
import { CheckboxPrimitive, RadioPrimitive } from '@arch-ui/controls';
import { FlexGroup } from '@arch-ui/layout';

const ControlLabel = ({ isChecked, isDisabled, ...props }) => {
  const type = Children.toArray(props.children)[0].props.type;
  const borderRadius = type === 'checkbox' ? 3 : '2em';

  return (
    <label
      css={{
        alignItems: 'center',
        border: `1px solid ${colors.N10}`,
        borderRadius,
        display: 'flex',
        fontSize: '0.75em',
        fontWeight: 500,
        lineHeight: 1,
        transition: 'border-color 150ms linear',
        width: '100%',
        userSelect: 'none',

        ':hover, :focus': {
          borderColor: colors.N20,
        },
        ':active': {
          backgroundColor: colors.N05,
        },
      }}
      {...props}
    />
  );
};
const StretchGroup = props => <FlexGroup stretch {...props} />;

// checkbox
export const CheckboxGroup = props => <_CheckboxGroup component={StretchGroup} {...props} />;
const ButtonCheckbox = props => (
  <CheckboxPrimitive components={{ Label: ControlLabel }} {...props} />
);
export const Checkbox = props => <_Checkbox component={ButtonCheckbox} {...props} />;

// radio
export const RadioGroup = props => <_RadioGroup component={StretchGroup} {...props} />;
const ButtonRadio = props => <RadioPrimitive components={{ Label: ControlLabel }} {...props} />;
export const Radio = props => <_Radio component={ButtonRadio} {...props} />;
