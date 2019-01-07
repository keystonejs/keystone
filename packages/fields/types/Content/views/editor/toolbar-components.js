/** @jsx jsx */
import { jsx } from '@emotion/core';
import { colors } from '@voussoir/ui/src/theme';
import { lighten, darken } from '@voussoir/ui/src/theme/color-utils';

function getToolbarItemStyles(isActive) {
  return {
    color: isActive ? colors.primary : 'white',
    ':hover,:focus': {
      color: isActive ? darken(colors.primary, 10) : lighten(colors.primary, 40),
    },
    ':active': {
      color: isActive ? darken(colors.primary, 25) : lighten(colors.primary, 10),
    },
  };
}

export let ToolbarButton = ({ isActive, ...props }) => {
  return (
    <button
      type="button"
      css={[
        {
          backgroundColor: 'transparent',
          border: 0,
          cursor: 'pointer',
        },
        getToolbarItemStyles(isActive),
      ]}
      {...props}
    />
  );
};

export let ToolbarCheckbox = ({ isActive, onChange, id, children }) => {
  return (
    <label
      css={[
        {
          display: 'inline-flex',
          justifyContent: 'center',
          flexDirection: 'column',
          cursor: 'pointer',
        },
        getToolbarItemStyles(isActive),
      ]}
      htmlFor={id}
    >
      <input
        type="checkbox"
        id={id}
        value={isActive}
        css={{
          flex: 0,
          backgroundColor: 'transparent',
          border: 0,
          position: 'absolute',
          opacity: 0,
          cursor: 'pointer',
          height: 0,
          width: 0,
        }}
        onChange={() => {
          onChange();
        }}
      />
      <span css={{ paddingRight: 4, paddingLeft: 4 }}>{children}</span>
    </label>
  );
};
