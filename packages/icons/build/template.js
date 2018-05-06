const template = ({
  componentName,
  height,
  width,
  viewBox,
  ariaHidden,
  svgContents,
}) => `
import React, { Component } from 'react';

class ${componentName} extends Component {
  render() {
    var defaults = {
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
    return (
      <svg {...defaults} {...this.props}>
        ${svgContents}
      </svg>
    );
  }
}
export default ${componentName};
`;

module.exports = template;
