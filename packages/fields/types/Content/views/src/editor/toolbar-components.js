/** @jsx jsx */
import { jsx } from '@emotion/core';
import { colors, gridSize } from '@arch-ui/theme';
import { lighten, darken } from '@arch-ui/color-utils';
import Tooltip from '@arch-ui/tooltip';
import { A11yText } from '@arch-ui/typography';

export let ToolbarButton = ({
  isActive,
  label,
  icon,
  as: Tag = 'button',
  tooltipPlacement = 'top',
  ...props
}) => {
  return (
    <Tooltip placement={tooltipPlacement} css={{ margin: gridSize * 2 }} content={label}>
      {ref => (
        <Tag
          {...(Tag === 'button' ? { type: 'button' } : null)}
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
          ref={ref}
          {...props}
        >
          {icon}
          <A11yText>{label}</A11yText>
        </Tag>
      )}
    </Tooltip>
  );
};
