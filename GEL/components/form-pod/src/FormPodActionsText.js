/** @jsx jsx */

import React from 'react';
import { jsx, useMediaQuery } from '@westpac/core';

// ==============================
// Component
// ==============================

export const FormPodActionsText = props => {
	const mq = useMediaQuery();

	return (
		<div
			css={mq({
				fontSize: '1rem',
				textAlign: ['center', 'left'],
				marginBottom: ['1.5rem', 0],
			})}
			{...props}
		/>
	);
};
