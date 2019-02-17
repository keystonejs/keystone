/** @jsx jsx */
import { jsx } from '@emotion/core';
import { forwardRef } from 'react';
import { colors, gridSize } from '@arch-ui/theme';
import { lighten, darken } from '@arch-ui/color-utils';
import Tooltip from '@arch-ui/tooltip';
import { A11yText } from '@arch-ui/typography';

export let BasicToolbarButton = forwardRef(({ isActive, ...props }, ref) => {
  return (
    <button
      type="button"
      ref={ref}
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
});

export let ToolbarButton = ({ isActive, label, icon, ...props }) => {
  return (
    <Tooltip placement="top" css={{ marginBottom: gridSize / 2 }} content={label}>
      {ref => (
        <BasicToolbarButton ref={ref} isActive={isActive} {...props}>
          {icon}
          <A11yText>{label}</A11yText>
        </BasicToolbarButton>
      )}
    </Tooltip>
  );
};
