/** @jsx jsx */

import React from 'react';
import PropTypes from 'prop-types';
import { jsx, useMediaQuery } from '@westpac/core';

// ==============================
// Component
// ==============================

export const FormSectionImg = props => {
	const mq = useMediaQuery();

	return (
		<img
			css={mq({
				display: 'block',
				margin: ['0 auto 1.125rem', '0 auto 2.625rem'],
				maxWidth: '100%',
			})}
			{...props}
		/>
	);
};

// ==============================
// Types
// ==============================

FormSectionImg.propTypes = {
	/**
	 * Component img src
	 */
	src: PropTypes.string.isRequired,
};

FormSectionImg.defaultProps = {};
