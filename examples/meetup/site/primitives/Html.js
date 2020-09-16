import React from 'react';
import PropTypes from 'prop-types';

export const Html = ({ markup, ...props }) => {
  if (markup == null) {
    return null;
  }

  return <div dangerouslySetInnerHTML={{ __html: markup }} {...props} />;
};

Html.propTypes = {
  markup: PropTypes.string,
};
