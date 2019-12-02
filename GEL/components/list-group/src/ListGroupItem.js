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
export const ListGroupItem = props => {
	const { COLORS } = useBrand();

	return (
		<li
			css={{
				margin: 0,
				borderBottom: `1px solid ${COLORS.border}`,
				padding: '0.75rem',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',

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

ListGroupItem.propTypes = {
	/**
	 * The content for this list group item
	 */
	children: PropTypes.node.isRequired,
};

ListGroupItem.defaultProps = {};
