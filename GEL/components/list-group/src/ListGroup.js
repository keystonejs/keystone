/** @jsx jsx */

import React from 'react';
import PropTypes from 'prop-types';
import { jsx, useBrand } from '@westpac/core';

// ==============================
// Component
// ==============================

/**
 * List Group: List groups are a flexible and powerful component for displaying not only simple lists of elements, but complex ones with custom content. Ideal for settings pages or preferences.
 */
export const ListGroup = props => {
	const { COLORS } = useBrand();

	return (
		<ul
			css={{
				listStyle: 'none',
				margin: 0,
				padding: 0,
				display: 'inline-block',
				border: `1px solid ${COLORS.border}`,
				borderBottom: 0,
				borderRadius: '0.1875rem',

				'@media print': {
					borderColor: '#000',
				},
			}}
			{...props}
		/>
	);
};

// ==============================
// Types
// ==============================

ListGroup.propTypes = {
	/**
	 * The content for this list group
	 */
	children: PropTypes.node.isRequired,
};

ListGroup.defaultProps = {};
