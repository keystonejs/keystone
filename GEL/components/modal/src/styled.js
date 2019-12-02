/** @jsx jsx */

import React from 'react';
import { jsx, useBrand, useMediaQuery } from '@westpac/core';

export const Backdrop = props => (
	<div
		css={{
			position: 'fixed',
			zIndex: '1001',
			backgroundColor: 'rgba(0,0,0,0.5)',
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'baseline',
			transition: 'all 0.3s ease',

			'&.modal-backdrop-enter': {
				opacity: 0,
			},

			'&.modal-backdrop-enter-active': {
				opacity: 1,
			},

			'&.modal-backdrop-exit': {
				opacity: 1,
			},

			'&.modal-backdrop-exit-active': {
				opacity: 0,
			},
		}}
		{...props}
	/>
);

export const StyledModal = ({ size, ...props }) => {
	const mq = useMediaQuery();

	return (
		<div
			css={mq({
				overflow: 'auto',
				maxHeight: '85%',
				margin: '0 0.75rem',
				backgroundColor: '#fff',
				borderRadius: 3,
				boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
				transition: 'all 0.3s ease',
				width: ['auto', size === 'small' ? '18.75rem' : '37.5rem', size === 'large' && '56.25rem'],

				'&.modal-appear': {
					opacity: 0,
				},

				'&.modal-appear-done': {
					transform: 'translate(0rem,1.875rem)',
				},
			})}
			{...props}
		/>
	);
};

export const Title = props => {
	const { COLORS } = useBrand();
	return (
		<span
			css={{
				fontSize: '1.125rem',
				fontWeight: 700,
				color: COLORS.text,
			}}
			{...props}
		/>
	);
};
