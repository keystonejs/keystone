/** @jsx jsx */

import React, { forwardRef } from 'react';
import { jsx, useBrand } from '@westpac/core';

export const TabRow = forwardRef((props, ref) => (
	<div
		ref={ref}
		css={{
			display: 'flex',
			whiteSpace: 'nowrap',
			position: 'relative',
		}}
		{...props}
	/>
));

export const TabItem = ({ appearance, isJustified, isLast, isSelected, ...props }) => {
	const { COLORS: colors } = useBrand();
	const common = {
		flex: isJustified ? 1 : 0,
		fontSize: '1.6rem',
		marginRight: '0.2rem',
		outline: 0,
		padding: '1.4rem 1.8rem',
		textAlign: 'left',
		textDecoration: 'none',
		transition: 'background .3s ease',
		width: '100%',

		'&:last-child': {
			marginRight: 0,
		},
	};
	const styles = {
		soft: {
			backgroundColor: isSelected ? '#fff' : colors.background,
			borderTopLeftRadius: 3,
			borderTopRightRadius: 3,
			border: `1px solid ${colors.border}`,
			borderBottom: 0,
			color: '#333',
			cursor: 'pointer',
			marginBottom: isSelected ? '-0.1rem' : null,
			paddingBottom: isSelected ? '1.5rem' : null,
		},
		lego: {
			backgroundColor: isSelected ? '#fff' : colors.hero.default,
			border: `1px solid ${isSelected ? colors.border : 'transparent'}`,
			borderBottom: 0,
			color: isSelected ? colors.text : colors.hero.foreground,
			cursor: 'pointer',
			marginBottom: isSelected ? '-0.1rem' : '0.2rem',
			paddingBottom: isSelected ? '1.7rem' : null,
		},
	};

	return <button css={{ ...common, ...styles[appearance] }} {...props} />;
};

export const AccordionLabel = ({ appearance, isLast, isSelected, ...props }) => {
	const { COLORS: colors } = useBrand();
	const common = {
		alignItems: 'center',
		backgroundColor: colors.background,
		border: 0,
		borderTop: `1px solid ${colors.border}`,
		borderLeft: `1px solid ${colors.border}`,
		borderRight: `1px solid ${colors.border}`,
		cursor: 'pointer',
		display: 'flex',
		fontSize: '1.6rem',
		justifyContent: 'space-between',
		outline: 0,
		padding: '1.2rem 1.8rem',
		position: 'relative',
		textAlign: 'left',
		width: '100%',
	};
	const lastStyles =
		isLast && !isSelected
			? {
					borderBottom: `1px solid ${colors.border}`,
					borderBottomLeftRadius: 3,
					borderBottomRightRadius: 3,
			  }
			: {};
	const styles = {
		soft: {
			borderBottom: isSelected && `1px solid ${colors.border}`,
			...lastStyles,

			'&:first-of-type': {
				borderTopLeftRadius: 3,
				borderTopRightRadius: 3,
			},
		},
		lego: {
			borderBottom: isSelected && `1px solid ${colors.border}`,
			borderLeftWidth: 6,
			borderLeftColor: isSelected ? colors.border : colors.hero.default,

			'&:last-of-type': {
				borderBottom: `1px solid ${colors.border}`,
			},
		},
	};

	return <button css={{ ...common, ...styles[appearance] }} {...props} />;
};

export const Panel = forwardRef(({ appearance, isLast, isSelected, mode, ...props }, ref) => {
	const { COLORS: colors, PACKS: packs } = useBrand();
	const common = {
		borderLeft: `1px solid ${colors.border}`,
		borderRight: `1px solid ${colors.border}`,
		borderBottom: mode === 'tabs' || isLast ? `1px solid ${colors.border}` : null,
		borderTop: mode === 'tabs' ? `1px solid ${colors.border}` : null,
		padding: '2.4rem 3.22%',

		'&:focus': {
			color: packs.link.color,
		},
	};
	const styles =
		mode === 'accordion'
			? {
					lego: {
						borderLeftWidth: 6,
						borderLeftColor: colors.border,
					},
					soft: isLast
						? {
								borderBottomLeftRadius: 3,
								borderBottomRightRadius: 3,
						  }
						: {},
			  }
			: {};

	return <div ref={ref} css={{ ...common, ...styles[appearance] }} {...props} />;
});
