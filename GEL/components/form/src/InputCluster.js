/** @jsx jsx */

import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { jsx } from '@westpac/core';

// ==============================
// Context and consumer hook
// ==============================

const InputClusterContext = createContext();

export const useInputClusterContext = () => {
	const context = useContext(InputClusterContext);
	if (!context) {
		throw new Error('InputCluster sub-components should be wrapped in a <InputCluster>.');
	}
	return context;
};

// ==============================
// Component
// ==============================

export const InputCluster = ({ horizontal, children, ...props }) => (
	<InputClusterContext.Provider value={{ horizontal }}>
		<div
			css={{
				display: horizontal && 'flex',
				flexWrap: horizontal && 'wrap',
			}}
			{...props}
		>
			{children}
		</div>
	</InputClusterContext.Provider>
);

// ==============================
// Types
// ==============================

InputCluster.propTypes = {
	/**
	 * Horizontal mode.
	 *
	 * This prop is passed to child elements.
	 */
	horizontal: PropTypes.bool,

	/**
	 * Component children
	 */
	children: PropTypes.node,
};

InputCluster.defaultProps = {
	horizontal: false,
};
