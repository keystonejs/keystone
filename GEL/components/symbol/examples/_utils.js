/** @jsx jsx */

import { jsx } from '@westpac/core';

export const RowPrimitive = props => (
	<div
		css={{
			alignItems: 'end',
			display: 'grid',
			gridAutoFlow: 'column',
			gridGap: 8,
			justifyContent: 'start',
		}}
		{...props}
	/>
);
export const RowWrap = props => (
	<div
		css={{
			marginTop: '1em',

			':first-of-type': {
				marginTop: 0,
			},
		}}
		{...props}
	/>
);
export const RowLabel = props => (
	<h4
		css={{
			color: '#6B778C',
			fontSize: '0.625rem',
			fontWeight: 500,
			marginBottom: '0.5em',
			marginTop: 0,
			textTransform: 'uppercase',
		}}
		{...props}
	/>
);

export const Row = ({ children, label, ...props }) =>
	label ? (
		<RowWrap>
			<RowLabel>{label}</RowLabel>
			<RowPrimitive {...props}>{children}</RowPrimitive>
		</RowWrap>
	) : (
		<RowPrimitive {...props}>{children}</RowPrimitive>
	);

export const Grid = props => (
	<div
		css={{
			display: 'grid',
			gridAutoFlow: 'row',
			gridAutoRows: 'minmax(120px,auto)',
			gridGap: 12,
			gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
		}}
		{...props}
	/>
);

export const Cell = props => (
	<div
		css={{
			alignItems: 'center',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
		}}
		{...props}
	/>
);

export const Name = props => (
	<div
		css={{
			color: '#6B778C',
			fontSize: '0.75rem',
			marginTop: '1em',
		}}
		{...props}
	/>
);
