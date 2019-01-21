const template = ({ componentName, height, width, viewBox, ariaHidden, svgContents }) => `
// @flow
import React from 'react';

const ${componentName} = ({ title, ...props }: { title?: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      ${svgContents}
    </svg>
  );
};

${componentName}.defaultProps = {
  'aria-hidden': ${ariaHidden},
  height: ${height},
  width: ${width},
  viewBox: '${viewBox}',
  style: {
    display: 'inline-block',
    verticalAlign: 'text-top',
    fill: 'currentColor',
  },
};

export default ${componentName};
`;

module.exports = template;
