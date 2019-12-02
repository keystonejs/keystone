/** @jsx jsx */

import React from 'react';
import PropTypes from 'prop-types';
import { jsx, useBrand } from '@westpac/core';
import { VisuallyHidden } from '@westpac/a11y';

// ==============================
// Utils
// ==============================

const round = value => Math.round(value);

// ==============================
// Component
// ==============================

/**
 * Progress Bar: A visual indication of progress.
 * Use when loading content or to indicate how far along
 * the user is in a journey.
 */
export const ProgressBar = ({ value, skinny, ...props }) => {
	const { COLORS, TYPE } = useBrand();

	const roundedValue = round(value);

	return (
		<div
			css={{
				height: skinny ? '0.625rem' : '1.5rem',
				marginBottom: '1.3125rem',
				overflow: 'hidden',
				backgroundColor: '#fff',
				borderRadius: skinny ? '0.625rem' : '1.5rem',
				border: `1px solid ${COLORS.border}`,
				padding: '0.0625rem',
				position: 'relative',

				'::after': {
					display: skinny && 'none',
					content: '"0%"',
					position: 'absolute',
					left: '0.625rem',
					top: 0,
					height: '100%',
					color: COLORS.muted,
					fontSize: '0.875rem',
					zIndex: 1,
					...TYPE.bodyFont[700],
				},
			}}
			{...props}
		>
			<div
				css={{
					display: 'flex',
					justifyContent: 'flex-end',
					alignItems: 'center',
					position: 'relative',
					float: 'left',
					width: 0,
					height: '100%',
					fontSize: '0.875rem',
					lineHeight: '1.25rem',
					color: '#fff',
					textAlign: 'right',
					backgroundColor: COLORS.hero,
					borderRadius: skinny ? '0.625rem' : '1.5rem',
					zIndex: 2,
					overflow: 'hidden',
					transition: 'width .6s ease',
					...TYPE.bodyFont[700],

					'@media print': {
						backgroundColor: '#000 !important',
					},
				}}
				style={{ width: `${roundedValue}%` }}
				role="progressbar"
				aria-valuemin="0"
				aria-valuemax="100"
				aria-valuenow={value}
				aria-live="polite"
			>
				{!skinny && (
					<span
						css={{
							display: 'inline-block',
							margin: '0 0.75rem',
							'@media print': {
								backgroundColor: '#000 !important',
								color: '#fff !important',
							},
						}}
					>
						{roundedValue}%
					</span>
				)}
				<VisuallyHidden>Complete</VisuallyHidden>
			</div>
		</div>
	);
};

// ==============================
// Types
// ==============================

ProgressBar.propTypes = {
	/**
	 * The progress bar value as a percentage. Decimal numbers are rounded.
	 */
	value: PropTypes.number,

	/**
	 * Enable skinny mode
	 */
	skinny: PropTypes.bool,
};

ProgressBar.defaultProps = {
	value: 0,
	skinny: false,
};
