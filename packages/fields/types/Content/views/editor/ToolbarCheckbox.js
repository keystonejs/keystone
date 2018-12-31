/** @jsx jsx */
import { jsx } from '@emotion/core';
import { colors } from '@voussoir/ui/src/theme';
import { A11yText } from '@voussoir/ui/src/primitives/typography';

export let ToolbarCheckbox = ({ isActive, onChange, label, id, icon: Icon }) => {
  return (
    <label
      css={{
        display: 'inline-flex',
        justifyContent: 'center',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
      htmlFor={id}
    >
      <input
        type="checkbox"
        id={id}
        onMouseDown={e => {
          e.preventDefault();
        }}
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
      <Icon css={{ color: isActive ? colors.primary : 'white', paddingRight: 4, paddingLeft: 4 }} />
      <A11yText>{label}</A11yText>
    </label>
  );
};
