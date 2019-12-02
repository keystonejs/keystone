/** @jsx jsx */

import React from 'react';
import PropTypes from 'prop-types';
import { jsx, useBrand } from '@westpac/core';

// ==============================
// Component
// ==============================

export const FormPodPanelFooter = ({ left, right, ...props }) => {
	const { COLORS } = useBrand();

	return (
		<div
			css={{
				display: 'flex',
				alignItems: 'center',
				height: '3.375rem', //Nb. there's no min-height with flex in IE
				backgroundColor: COLORS.light,
				padding: '0.75rem',
			}}
			{...props}
		>
			{left && <div>{left}</div>}
			{right && <div css={{ marginLeft: 'auto' }}>{right}</div>}
		</div>
	);
};

// ==============================
// Types
// ==============================

FormPodPanelFooter.propTypes = {
	/**
	 * Left 'slot'.
	 */
	left: PropTypes.node,

	/**
	 * Right 'slot'.
	 */
	right: PropTypes.node,
};

FormPodPanelFooter.defaultProps = {};
