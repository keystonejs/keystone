/** @jsx jsx */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { jsx } from '@westpac/core';
import shortid from 'shortid';

// ==============================
// Component
// ==============================
export const Tooltip = ({ text, children, ...props }) => {
	const [visible, setVisible] = useState(false);
	const [tooltipId] = useState(`tooltipBubble-${shortid.generate()}`);

	const handleMouseEnter = () => setVisible(true);
	const handleMouseLeave = () => setVisible(false);

	return (
		<span
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			aria-describedby={tooltipId}
			tabIndex={0}
			css={{ display: 'inline-block', position: 'relative', cursor: 'help', borderBottom: 'none' }}
			{...props}
		>
			{children}
			<span
				id={tooltipId}
				css={{
					visibility: visible ? 'visible' : 'hidden',
					position: 'absolute',
					left: '50%',
					bottom: '110%',
					transform: 'translate(-50%)',
					margin: '0 0 0.375rem 0',
					borderRadius: 3,
					padding: '0.4375rem',
					width: '18.75rem',
					color: '#fff',
					backgroundColor: '#000',
					fontSize: '0.75rem',
					textAlign: 'center',
					lineHeight: 1.2,
					whiteSpace: 'normal',
					pointerEvents: 'none',
					transition: 'opacity 0.2 ease, visibility 0.2 ease',
					transitionDelay: '100ms',
					zIndex: 100,

					'::after': {
						content: "''",
						marginLeft: '-0.3125rem',
						width: 0,
						borderTop: '0.3125rem solid #000',
						borderRight: '0.3125rem solid transparent',
						borderLeft: '0.3125rem solid transparent',
						fontSize: 0,
						lineHeight: 0,
						position: 'absolute',
						bottom: '-0.3125rem',
						left: '50%',
					},
				}}
			>
				{text}
			</span>
		</span>
	);
};

// ==============================
// Types
// ==============================
Tooltip.propTypes = {
	/** Tooltip text */
	text: PropTypes.string.isRequired,
};
