import React from 'react';
import { style } from '../style';

const svgContent = (
  <path
    fillRule="evenodd"
    d="M3 4.949a2.5 2.5 0 10-1 0v8.049c0 .547.453 1 1 1h2.05a2.5 2.5 0 004.9 0h1.1a2.5 2.5 0 100-1h-1.1a2.5 2.5 0 00-4.9 0H3v-5h2.05a2.5 2.5 0 004.9 0h1.1a2.5 2.5 0 100-1h-1.1a2.5 2.5 0 00-4.9 0H3v-2.05zm9 2.55a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0zm-3 0a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zm4.5 7.499a1.5 1.5 0 110-3.001 1.5 1.5 0 010 3zm-6-3a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"
  />
);

const WorkflowIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={16} viewBox="0 0 16 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default WorkflowIcon;
