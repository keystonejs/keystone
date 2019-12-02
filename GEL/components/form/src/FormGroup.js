/** @jsx jsx */

import React from 'react';
import PropTypes from 'prop-types';
import { jsx, useMediaQuery } from '@westpac/core';
import { useFormContext } from './Form';

// ==============================
// Component
// ==============================

export const FormGroup = ({ primary, ...props }) => {
	const mq = useMediaQuery();

	// Consume FormContext
	const formContext = useFormContext();
	const isInline = (formContext && formContext.inline) || false;
	const spacing = (formContext && formContext.spacing) || 'medium';

	const mapSpacing = {
		medium: {
			marginBottom: '1.125rem',
		},
		large: {
			marginBottom: ['1.5rem', '1.875rem'],
		},
	};

	return (
		<div
			css={mq({
				display: isInline && [null, 'inline-block'],
				verticalAlign: isInline && [null, 'middle'],
				marginBottom: isInline
					? [(mb => (Array.isArray(mb) ? mb[0] : mb))(mapSpacing[spacing].marginBottom), 0]
					: mapSpacing[spacing].marginBottom,
				textAlign: primary && 'center',

				'& + &': {
					marginLeft: isInline && [null, '0.375rem'],
				},
			})}
			{...props}
		/>
	);
};

// ==============================
// Types
// ==============================

FormGroup.propTypes = {
	/**
	 * Primary mode.
	 *
	 * Used exclusively to render the ‘Fork’ pattern.
	 */
	primary: PropTypes.bool,

	/**
	 * Component children
	 */
	children: PropTypes.node,
};

FormGroup.defaultProps = {
	primary: false,
};
