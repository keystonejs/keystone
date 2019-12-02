/** @jsx jsx */

import React, { forwardRef } from 'react';
import ReactDOM from 'react-dom';
import { jsx, useBrand } from '@westpac/core';

export const PopoverPanel = forwardRef(({ open, position, title, content, ...props }, ref) => {
	const { COLORS } = useBrand();

	return (
		open &&
		ReactDOM.createPortal(
			<div
				ref={ref}
				tabIndex="-1"
				aria-label="Use the ESC key to close"
				css={{
					position: 'absolute',
					top: `${position.top}rem`,
					left: `${position.left}rem`,
					boxShadow: '0 5px 10px rgba(0, 0, 0, 0.2)',
					border: `1px solid ${COLORS.muted}`,
					borderRadius: 3,
					width: '17.625rem',
					backgroundColor: '#fff',
					pointerEvents: 'all',
					textAlign: 'left',

					'::before': {
						content: '""',
						position: 'absolute',
						[position.placement === 'top' ? 'bottom' : 'top']: '-0.8125rem',
						left: '50%',
						marginLeft: '-0.5rem',
						width: 0,
						[position.placement === 'top'
							? 'borderTop'
							: 'borderBottom']: `0.75rem solid ${COLORS.muted}`,
						borderRight: '0.5rem solid transparent',
						borderLeft: '0.5rem solid transparent',
						fontSize: 0,
						lineHeight: 0,
					},

					...(position.placement === 'top' && {
						'::after': {
							content: '""',
							position: 'absolute',
							bottom: '-0.6875rem',
							left: '50%',
							marginLeft: '-0.5rem',
							width: 0,
							borderTop: '0.75rem solid #fff',
							borderRight: '0.5rem solid transparent',
							borderLeft: '0.5rem solid transparent',
							fontSize: 0,
							lineHeight: 0,
						},
					}),
				}}
				{...props}
			>
				<p
					css={{
						margin: 0,
						padding: '0.625rem 0.75rem',
						backgroundColor: COLORS.muted,
						color: '#fff',
						fontSize: '1rem',
					}}
				>
					{title}
				</p>
				<p css={{ margin: 0, padding: '0.625rem 0.75rem', color: COLORS.neutral }}>{content}</p>
			</div>,
			document.body
		)
	);
});
