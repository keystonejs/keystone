/** @jsx jsx */

import { jsx, useBrand } from '@westpac/core';
import { Cell, Grid } from '../src';

export const Box = props => {
	const { COLORS } = useBrand();

	return (
		<div
			css={{
				alignItems: 'center',
				backgroundColor: COLORS.tints.hero10,
				borderRadius: 1,
				color: COLORS.hero,
				display: 'flex',
				height: '100%',
				justifyContent: 'center',
				minHeight: 60,
			}}
			{...props}
		/>
	);
};

export const GridOverlay = ({ children, columns = 12, gap }) => (
	<div css={{ height: '100%', position: 'relative' }}>
		<Grid
			columns={columns}
			gap={gap}
			css={{
				bottom: '-1.5em',
				height: 'auto',
				left: 0,
				opacity: 0.1,
				pointerEvents: 'none',
				position: 'absolute',
				right: 0,
				top: '-1.5em',

				'@media (min-width: 420px)': {
					bottom: '-2em',
					top: '-2em',
				},
			}}
		>
			{new Array(columns).fill(1).map((c, i) => (
				<Cell key={i} css={{ backgroundColor: 'rgba(0, 116, 196, 0.3)' }} />
			))}
		</Grid>
		{children}
	</div>
);
