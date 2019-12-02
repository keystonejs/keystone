/** @jsx jsx */

import React, { Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { jsx } from '@westpac/core';

// ==============================
// Component
// ==============================

/**
 * Pagination: Pagination is used to navigate within a set of related views. This element allows navigation within both finite (a set number) and infinite (unknown number) of views.
 */
export const Pagination = ({ children, ...props }) => {
	const childrenWithProps = Children.map(children, (child, index) => {
		if (!child.type.isItem) {
			throw new Error('<Pagination /> only accepts <Item /> as direct children.');
		}
		if (index === 0) {
			return cloneElement(child, { first: true });
		}
		if (index === Children.count(children) - 1) {
			return cloneElement(child, { last: true });
		}

		return child;
	});

	return (
		<ul
			css={{
				display: 'flex',
				paddingLeft: 0,
				margin: '1.3125rem 0',
				borderRadius: '0.1875rem',
				listStyle: 'none',
			}}
			{...props}
		>
			{childrenWithProps}
		</ul>
	);
};

// ==============================
// Types
// ==============================

Pagination.propTypes = {
	/**  Any renderable child */
	children: PropTypes.node,
};
