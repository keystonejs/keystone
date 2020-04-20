import React from 'react';
import { style } from '../style';

const svgContent = (
  <path
    fillRule="evenodd"
    d="M10 8A5 5 0 110 8a5 5 0 0110 0zM3.5 5.5l4 2.5-4 2.5v-5zm3.75 7.444a5.001 5.001 0 000-9.888 5 5 0 110 9.888zm3 0a5.001 5.001 0 000-9.888 5 5 0 110 9.888z"
  />
);

const WorkflowAllIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={16} viewBox="0 0 16 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default WorkflowAllIcon;
