/** @jsx jsx */

import React from 'react';
import PropTypes from 'prop-types';
import { jsx, useBrand } from '@westpac/core';

// ==============================
// Utils
// ==============================

const TableWrapper = ({ bordered, responsive, wrappingStyles, ...props }) => {
	const {
		COLORS,
		LAYOUT: { breakpoints },
	} = useBrand();

	const maxWidth = width => `@media (max-width: ${width}px)`;
	const xsOnly = maxWidth(breakpoints.sm - 1);

	return responsive ? (
		<div
			css={[
				wrappingStyles,
				{
					[xsOnly]: {
						width: '100%',
						marginBottom: '1.125rem',
						overflowY: 'hidden',
						overflowX: 'auto',
						border: `1px solid ${COLORS.border}`,

						'> table': {
							marginBottom: 0,
							border: bordered && 0,

							caption: {
								padding: '0.75rem',
							},
							'tbody, tfoot': {
								'tr:last-child': {
									'th, td': {
										borderBottom: bordered && 0,
									},
								},
							},
							'th, td': {
								whiteSpace: 'nowrap',

								':first-of-type': {
									borderLeft: bordered && 0,
								},
								':last-child': {
									borderRight: bordered && 0,
								},
							},
						},
					},
				},
			]}
			{...props}
		/>
	) : (
		props.children
	);
};

// ==============================
// Component
// ==============================

export const Table = ({ striped, bordered, responsive, wrappingStyles, ...props }) => {
	const { COLORS, TYPE } = useBrand();

	return (
		<TableWrapper bordered={bordered} responsive={responsive} wrappingStyles={wrappingStyles}>
			<table
				css={{
					width: '100%',
					maxWidth: '100%',
					marginBottom: '1.3125rem',
					backgroundColor: '#fff',
					borderCollapse: 'collapse',

					caption: {
						fontSize: '1.125rem',
						textAlign: 'left',
						marginBottom: '0.75rem',
						...TYPE.bodyFont[300],
					},

					// All child rows in the tbody
					'tbody > tr': {
						transition: !striped && 'background 0.2s ease',

						// Hovered row
						':hover': {
							backgroundColor: !striped && COLORS.background,
						},
						// Odd row
						':nth-of-type(even)': {
							backgroundColor: striped && COLORS.light,
						},
						// Highlighted row or cell
						'&.table-highlight, > th.table-highlight, > td.table-highlight': {
							borderLeft: `6px solid ${COLORS.primary}`,
						},
						// Highlighted row's cell or highlighted cell
						'&.table-highlight > th, &.table-highlight > td, > th.table-highlight, > td.table-highlight': {
							borderBottom: `1px solid ${COLORS.primary}`,
						},

						// Adjacent highlighted cells
						'> th.table-highlight, > td.table-highlight': {
							'+ th.table-highlight, + td.table-highlight': {
								borderLeft: 0,
							},
						},
					},

					// All cells
					'th, td': {
						padding: '0.75rem',
						verticalAlign: 'top',
						border: `1px solid ${COLORS.border}`,
						borderLeft: !bordered && 0,
						borderRight: !bordered && 0,
					},
					// All child cells in the thead
					'thead > tr': {
						'th, td': {
							borderTop: !bordered && 0,
						},
					},
					// All child cells in the tfoot
					'tfoot > tr': {
						'> th, > td': {
							borderBottom: !bordered && 0,
						},
					},

					// All `th` cells
					th: {
						textAlign: 'left',
					},
					// `th` cells in the `thead`
					'thead > tr > th': {
						verticalAlign: 'bottom',
						borderBottom: `${bordered ? '2px' : '3px'} solid ${COLORS.hero}`,
						color: COLORS.text,
						...TYPE.bodyFont[500],
					},

					tfoot: {
						color: COLORS.muted,
					},
					// Adjacent `tbody` elements
					'tbody + tbody': {
						borderTop: `2px solid ${COLORS.hero}`,
					},
				}}
				{...props}
			/>
		</TableWrapper>
	);
};

// ==============================
// Types
// ==============================

Table.propTypes = {
	/**
	 * Striped mode
	 */
	striped: PropTypes.bool,

	/**
	 * Bordered mode
	 */
	bordered: PropTypes.bool,

	/**
	 * Responsive mode
	 */
	responsive: PropTypes.bool,
};

Table.defaultProps = {
	striped: false,
	bordered: false,
	responsive: false,
};
