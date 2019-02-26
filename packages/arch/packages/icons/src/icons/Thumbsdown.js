// @flow
import React from 'react';
import { style } from '../style';

const svgContent = (
  <path
    fillRule="evenodd"
    d="M15.97 7.825L15 1.88C14.83.499 13.123 0 11.994 0H5.686c-.2 0-.38.05-.53.14L3.719 1h-1.72C.94 1 0 1.938 0 2.997v3.998c0 1.059.94 2.018 1.999 1.998h1.999c.909 0 1.389.45 2.388 1.55.91.999.88 1.798.63 3.267-.08.5.06 1 .42 1.42.39.47.979.769 1.558.769 1.83 0 2.999-3.718 2.999-5.017l-.02-.98h2.038c1.16 0 1.949-.799 1.979-1.968 0-.06.02-.13-.02-.2v-.01zm-1.969 1.19h-1.989c-.7 0-1.029.28-1.029.969l.03 1.03c0 1.268-1.17 3.997-1.999 3.997-.5 0-1.079-.5-.999-1 .25-1.579.34-2.778-.89-4.137-1.019-1.13-1.768-1.879-3.127-1.879V1.999l1.668-1h6.327c.729 0 1.948.31 1.998 1l.02.02 1 5.996c-.03.64-.38 1-1 1h-.01z"
  />
);

const ThumbsdownIcon = React.memo<{ title?: string }>(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={16} viewBox="0 0 16 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default ThumbsdownIcon;
