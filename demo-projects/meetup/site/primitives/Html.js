import React from 'react';
import PropTypes from 'prop-types';

export const Html = ({ markup }) => (
	<div dangerouslySetInnerHTML={{ __html: markup }} />
);

Html.propTypes = {
	markup: PropTypes.string.isRequired
};
