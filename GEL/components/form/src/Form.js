/** @jsx jsx */

import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { jsx } from '@westpac/core';

// ==============================
// Context and consumer hook
// ==============================

const FormContext = createContext();

export const useFormContext = () => useContext(FormContext);

// ==============================
// Component
// ==============================

export const Form = ({ size, spacing, inline, tag: Tag, ...props }) => {
	return (
		<FormContext.Provider value={{ size, spacing, inline }}>
			<Tag {...props} />
		</FormContext.Provider>
	);
};

// ==============================
// Types
// ==============================

const options = {
	size: ['small', 'medium', 'large', 'xlarge'],
	spacing: ['medium', 'large'],
};

Form.propTypes = {
	/**
	 * Size of children components.
	 *
	 * This prop is available to children components via `FormContext`.
	 */
	size: PropTypes.oneOf(options.size),

	/**
	 * Vertical spacing of children components.
	 *
	 * This prop is available to children components via `FormContext`.
	 */
	spacing: PropTypes.oneOf(options.spacing),

	/**
	 * Inline children mode (SM+).
	 *
	 * This prop is available to children components via `FormContext`.
	 */
	inline: PropTypes.bool,

	/**
	 * Component tag
	 */
	tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),

	/**
	 * Form children
	 */
	children: PropTypes.node,
};

export const defaultProps = {
	size: 'medium',
	spacing: 'medium',
	inline: false,
	tag: 'form',
};
Form.defaultProps = defaultProps;
