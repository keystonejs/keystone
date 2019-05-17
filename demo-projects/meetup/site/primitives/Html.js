import React from 'react';
import PropTypes from 'prop-types';

export const Html = ({ markup, ...props }) => (
  <div dangerouslySetInnerHTML={{ __html: markup }} {...props} />
);

Html.propTypes = {
  markup: PropTypes.string.isRequired,
};
