/** @jsx jsx */

import React from 'react';
import PropTypes from 'prop-types';
import { jsx, useBrand, useMediaQuery } from '@westpac/core';

// ==============================
// Component
// ==============================

export const FormSection = ({ noPadding, ...props }) => {
	const { COLORS } = useBrand();
	const mq = useMediaQuery();

	return (
		<div
			css={mq({
				position: 'relative', //for `.form-section-actions` positioning
				paddingLeft: !noPadding && [null, '3.375rem', '2.875rem', '3.125rem'],
				paddingRight: !noPadding && [null, '3.375rem', '2.875rem', '3.125rem'],

				':not(:first-of-type)': {
					paddingTop: ['1.875rem', '2.25rem'],
				},
				':not(:last-child)': {
					paddingBottom: '0.375rem', //0.6rem assuming there will be a `FormGroup` margin-bottom (3rem)
				},

				// Subequent sections
				'& + &': {
					borderTop: `1px solid ${COLORS.border}`,
				},
			})}
			{...props}
		/>
	);
};

// ==============================
// Types
// ==============================

FormSection.propTypes = {
	/**
	 * Remove section padding
	 */
	noPadding: PropTypes.bool,

	/**
	 * Component children
	 */
	children: PropTypes.node,
};

FormSection.defaultProps = {
	noPadding: false,
};
