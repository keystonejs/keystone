/** @jsx jsx */

import { jsx } from '@emotion/core';

export const Button = ({ isDisabled, isPressed, ...props }) => (
  <button
    type="button"
    disabled={isDisabled}
    css={{
      background: isPressed ? '#f3f3f3' : 'white',
      borderColor: isDisabled ? '#eee' : isPressed ? '#aaa' : '#ccc',
      borderStyle: 'solid',
      borderWidth: 1,
      borderRadius: 5,
      boxShadow: isPressed ? 'inset 0px 3px 5px -4px rgba(0,0,0,0.50)' : undefined,
      color: isDisabled ? '#999' : '#172B4D',
      marginRight: 4,
      pointerEvents: isDisabled ? 'none' : undefined,
      ':hover': {
        borderColor: isPressed ? '#666' : '#999',
      },
    }}
    {...props}
  />
);
