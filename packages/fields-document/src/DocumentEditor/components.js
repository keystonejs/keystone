/** @jsx jsx */

import { jsx } from '@emotion/core';

export const Button = ({ isDisabled, isPressed, ...props }) => (
  <button
    type="button"
    disabled={isDisabled}
    css={{
      background: isPressed ? '#EDF2F7' : 'white',
      borderColor: isPressed ? '#A0AEC0' : isDisabled ? '#E2E8F0' : '#CBD5E0',
      borderStyle: 'solid',
      borderWidth: 1,
      borderRadius: 5,
      boxShadow: isPressed ? 'inset 0px 3px 5px -4px rgba(0,0,0,0.50)' : undefined,
      color: isPressed ? '#4A5568' : isDisabled ? '#CBD5E0' : '#718096',
      marginRight: 4,
      padding: '4px 8px',
      pointerEvents: isDisabled ? 'none' : undefined,
      ':hover': {
        color: isPressed ? '#4A5568' : '#718096',
        borderColor: isPressed ? '#718096' : '#A0AEC0',
      },
    }}
    {...props}
  />
);
