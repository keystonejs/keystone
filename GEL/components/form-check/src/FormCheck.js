/** @jsx jsx */

import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { jsx } from '@westpac/core';

// ==============================
// Context and consumer hook
// ==============================

const FormCheckContext = createContext();

export const useFormCheckContext = () => {
	const context = useContext(FormCheckContext);
	if (!context) {
		throw new Error('Form check sub-components should be wrapped in a <FormCheck>.');
	}
	return context;
};

// ==============================
// Component
// ==============================

export const FormCheck = ({ type, name, size, inline, flipped, ...props }) => (
	<FormCheckContext.Provider value={{ type, name, size, inline, flipped }}>
		<div {...props} />
	</FormCheckContext.Provider>
);

// ==============================
// Types
// ==============================

const options = {
	type: ['checkbox', 'radio'],
	size: ['medium', 'large'],
};

FormCheck.propTypes = {
	/**
	 * Form check type.
	 *
	 * This prop is passed to children.
	 */
	type: PropTypes.oneOf(options.type),

	/**
	 * The form check input element’s name.
	 *
	 * This prop is passed to children.
	 */
	name: PropTypes.string.isRequired,

	/**
	 * Form check size.
	 *
	 * This prop is passed to children.
	 */
	size: PropTypes.oneOf(options.size),

	/**
	 * Form check orientation (control on the right).
	 *
	 * This prop is passed to children.
	 */
	flipped: PropTypes.bool,

	/**
	 * Form check item(s)
	 */
	children: PropTypes.node.isRequired,
};

FormCheck.defaultProps = {
	type: 'checkbox',
	size: 'medium',
	flipped: false,
};
