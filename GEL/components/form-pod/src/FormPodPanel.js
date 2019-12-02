/** @jsx jsx */

import React, { Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { jsx, useBrand } from '@westpac/core';

// ==============================
// Component
// ==============================

export const FormPodPanel = ({ noBorderTop, ...props }) => {
	const { COLORS } = useBrand();

	return (
		<div
			css={{
				backgroundColor: '#fff',
				borderTop: !noBorderTop && `1px solid ${COLORS.hero}`,
				borderBottom: `1px solid ${COLORS.border}`,
			}}
			{...props}
		/>
	);
};

// ==============================
// Types
// ==============================

FormPodPanel.propTypes = {
	/**
	 * Remove top border.
	 *
	 * Enable when the 'Error summary' alert is shown.
	 */
	noBorderTop: PropTypes.bool,
};
FormPodPanel.defaultProps = {
	noBorderTop: false,
};
