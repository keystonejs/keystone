// @flow
import React from 'react';
import { style } from '../style';

const svgContent = (
  <path
    fillRule="evenodd"
    d="M0 2.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zm0 5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zM1.5 14a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"
  />
);

const KebabVerticalIcon = React.memo<{ title?: string }>(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={3} viewBox="0 0 3 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default KebabVerticalIcon;
