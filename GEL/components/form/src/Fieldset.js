/** @jsx jsx */

import React from 'react';
import PropTypes from 'prop-types';
import { jsx } from '@westpac/core';
import { FormLabel } from './FormLabel';

import { useFormContext } from './Form';

// ==============================
// Component
// ==============================

export const Fieldset = ({ legend, children, ...props }) => {
	// Consume FormContext
	const formContext = useFormContext();
	const spacing = (formContext && formContext.spacing) || 'medium';

	return (
		<fieldset {...props}>
			<FormLabel tag="legend" spacing={spacing}>
				{legend}
			</FormLabel>
			{children}
		</fieldset>
	);
};

// ==============================
// Types
// ==============================

Fieldset.propTypes = {
	/**
	 * Fieldset legend text
	 */
	legend: PropTypes.string.isRequired,

	/**
	 * Component children
	 */
	children: PropTypes.node,
};

Fieldset.defaultProps = {};
