/** @jsx jsx */
import { jsx } from '@emotion/core';

let preventDefault = e => {
  e.preventDefault();
};

export let ToolbarButton = ({ isActive, ...props }) => {
  return (
    <button
      type="button"
      // prevent the text from being deselected when the user clicks the button
      onMouseDown={preventDefault}
      {...(typeof isActive === 'boolean'
        ? {
            role: 'checkbox',
            'aria-checked': isActive,
          }
        : {})}
      css={{ color: isActive ? 'lightgreen' : 'black' }}
      {...props}
    />
  );
};
