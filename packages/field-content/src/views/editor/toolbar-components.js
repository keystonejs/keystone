/** @jsx jsx */
import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';
import { lighten, darken } from '@arch-ui/color-utils';
import { A11yText } from '@arch-ui/typography';

export let ToolbarButton = ({ isActive, label, icon, ...props }) => (
  <button
    type="button"
    css={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
      border: 0,
      padding: '0.6em 0',
      paddingRight: '1em',
      cursor: 'pointer',
      color: isActive ? colors.primary : colors.N40,
      ':hover,:focus': {
        color: isActive ? darken(colors.primary, 10) : lighten(colors.primary, 40),
      },
      ':active': {
        color: isActive ? darken(colors.primary, 25) : lighten(colors.primary, 10),
      },
      fontSize: 16,
      outline: 'none',
    }}
    {...props}
  >
    {icon}
    <A11yText>{label}</A11yText>
  </button>
);
