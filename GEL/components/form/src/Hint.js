/** @jsx jsx */

import React from 'react';
import PropTypes from 'prop-types';
import { jsx, useBrand } from '@westpac/core';
import { useFormContext } from './Form';

// ==============================
// Component
// ==============================

export const Hint = ({ tag: Tag, ...props }) => {
	const { COLORS } = useBrand();

	// Consume FormContext
	const formContext = useFormContext();
	const spacing = (formContext && formContext.spacing) || 'medium';

	const spacingMap = {
		medium: {
			marginTop: '-0.375rem',
			marginBottom: '0.75rem',
		},
		large: {
			marginTop: '-0.75rem',
			marginBottom: '1.125rem',
		},
	};

	return (
		<Tag
			css={{
				color: COLORS.muted,
				fontSize: '0.875rem',
				...spacingMap[spacing],
			}}
			{...props}
		/>
	);
};

// ==============================
// Types
// ==============================

Hint.propTypes = {
	/**
	 * Component tag
	 */
	tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),

	/**
	 * Component text
	 */
	children: PropTypes.string.isRequired,
};

Hint.defaultProps = {
	tag: 'p',
};
