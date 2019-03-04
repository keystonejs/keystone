// @flow
import React from 'react';
import { style } from '../style';

const svgContent = (
  <path
    fillRule="evenodd"
    d="M1.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM13 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"
  />
);

const KebabHorizontalIcon = React.memo<{ title?: string }>(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={13} viewBox="0 0 13 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default KebabHorizontalIcon;
