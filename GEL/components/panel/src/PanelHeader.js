/** @jsx jsx */

import React from 'react';
import { jsx, useBrand, useMediaQuery } from '@westpac/core';
import { usePanelContext } from './Panel';

// ==============================
// Component
// ==============================

export const PanelHeader = props => {
	const { COLORS } = useBrand();
	const mq = useMediaQuery();
	const { appearance } = usePanelContext();

	const appearanceMap = {
		hero: {
			color: '#fff',
			backgroundColor: COLORS.hero,
			borderColor: COLORS.hero,
		},
		faint: {
			color: COLORS.text,
			backgroundColor: COLORS.background,
			borderColor: COLORS.border,
		},
	};

	return (
		<div
			css={mq({
				padding: ['0.625rem 0.75rem', '0.625rem 1.5rem'],
				backgroundColor: appearanceMap[appearance].backgroundColor,
				borderBottom: `1px solid ${appearanceMap[appearance].borderColor}`,
				color: appearanceMap[appearance].color,
				borderTopRightRadius: `calc(0.1875rem - 1px)`,
				borderTopLeftRadius: `calc(0.1875rem - 1px)`,
				fontSize: '1rem',
				'@media print': {
					borderBottom: '1px solid #000',
				},
			})}
			{...props}
		/>
	);
};
