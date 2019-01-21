/** @jsx jsx */
import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';
import { lighten, darken } from '@arch-ui/color-utils';

export let ToolbarButton = ({ isActive, ...props }) => {
  return (
    <button
      type="button"
      css={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        border: 0,
        cursor: 'pointer',
        color: isActive ? colors.primary : 'white',
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
    />
  );
};
