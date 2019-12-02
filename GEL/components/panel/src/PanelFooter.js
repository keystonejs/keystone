/** @jsx jsx */

import React from 'react';
import { jsx, useBrand, useMediaQuery } from '@westpac/core';

// ==============================
// Component
// ==============================

export const PanelFooter = props => {
	const { COLORS } = useBrand();
	const mq = useMediaQuery();

	return (
		<div
			css={mq({
				padding: ['0.625rem 0.75rem', '0.625rem 1.5rem'],
				backgroundColor: COLORS.light,
				borderTop: `1px solid ${COLORS.border}`,
				borderBottomRightRadius: `calc(0.1875rem - 1px)`,
				borderBottomLeftRadius: `calc(0.1875rem - 1px)`,
			})}
			{...props}
		/>
	);
};
