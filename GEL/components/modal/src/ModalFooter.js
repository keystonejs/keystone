/** @jsx jsx */

import React from 'react';
import { jsx, useBrand } from '@westpac/core';

export const ModalFooter = props => {
	const { COLORS } = useBrand();

	return (
		<div
			css={{
				backgroundColor: COLORS.background,
				borderTop: `1px solid ${COLORS.border}`,
				textAlign: 'right',
				padding: '0.75rem 1.125rem',

				'button + button': {
					marginLeft: '0.375rem',
				},
			}}
			{...props}
		/>
	);
};
