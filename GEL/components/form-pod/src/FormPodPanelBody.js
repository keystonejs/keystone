/** @jsx jsx */

import React from 'react';
import PropTypes from 'prop-types';
import { jsx, useMediaQuery } from '@westpac/core';

// ==============================
// Component
// ==============================

export const FormPodPanelBody = ({ expanded, ...props }) => {
	const mq = useMediaQuery();

	return (
		<div
			css={mq({
				padding: expanded
					? ['1.875rem 0.75rem', '3rem 2.25rem']
					: ['1.875rem 0.75rem', '3.75rem 13%', '3.75rem 6%', '3.75rem 13%'],
			})}
			{...props}
		/>
	);
};

// ==============================
// Types
// ==============================

FormPodPanelBody.propTypes = {
	/**
	 * Expanded body mode (less horizontal padding)
	 */
	expanded: PropTypes.bool,
};
FormPodPanelBody.defaultProps = {
	expanded: false,
};
