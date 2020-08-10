/** @jsx jsx */
import { jsx } from '@emotion/core';

export const BlockMenuItem = ({ icon, text, insertBlock }) => (
  <button
    css={{
      background: 'none',
      fontSize: '1rem',
      padding: `0 15px`,
      margin: 0,
      border: 'none',
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      ':focus,:hover': {
        background: '#eaeaea',
      },
    }}
    type="button"
    onClick={insertBlock}
  >
    <div css={{ padding: '10px 5px' }}>{icon}</div>
    <span css={{ padding: '10px 5px' }}>{text}</span>
  </button>
);
