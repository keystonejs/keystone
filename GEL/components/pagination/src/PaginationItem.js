/** @jsx jsx */

import React from 'react';
import PropTypes from 'prop-types';
import { jsx, useBrand } from '@westpac/core';
import { VisuallyHidden } from '@westpac/a11y';

// ==============================
// Component
// ==============================

/**
 * Pagination: Pagination is used to navigate within a set of related views. This element allows navigation within both finite (a set number) and infinite (unknown number) of views.
 */
export const PaginationItem = ({ first, last, active, disabled, children, ...props }) => {
	const { COLORS } = useBrand();

	return (
		<>
			<li
				css={{
					'a, span': {
						padding: '0.4375rem 0.75rem',
						border: `1px solid ${COLORS.border}`,
						marginLeft: -1,
						fontSize: '0.875rem',
						color: active ? '#fff' : COLORS.neutral,
						zIndex: active && 2,
						backgroundColor: active && COLORS.hero,

						...(first && {
							marginLeft: 0,
							borderTopLeftRadius: '0.1875rem',
							borderBottomLeftRadius: '0.1875rem',
						}),
						...(last && {
							borderTopRightRadius: '0.1875rem',
							borderBottomRightRadius: '0.1875rem',
						}),
						...(disabled && {
							color: COLORS.muted,
							backgroundColor: COLORS.light,
							cursor: 'not-allowed',
							opacity: '0.5',
						}),
					},

					a: {
						transition: 'background .2s ease',
						textDecoration: 'none',

						':hover': {
							backgroundColor: !active ? COLORS.background : COLORS.hero,
						},
					},
				}}
				{...props}
			>
				{!first && !last && <VisuallyHidden>Go to page</VisuallyHidden>}
				{children}
			</li>
		</>
	);
};

PaginationItem.isItem = true;

// ==============================
// Types
// ==============================

PaginationItem.propTypes = {
	/**  Enable first prop.
	 *   The system adds a 'first' prop to the first Item
	 *	 */
	first: PropTypes.bool,

	/**  Enable last prop.
	 *   The system adds a 'last' prop to the last Item
	 */
	last: PropTypes.bool,

	/**  Any renderable child */
	children: PropTypes.node,
};

PaginationItem.defaultProps = {
	first: false,
	last: false,
};
