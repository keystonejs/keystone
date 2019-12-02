/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Container, Cell, Grid } from '@westpac/grid';
import { useContainerQuery } from '@westpac/hooks';
import { useRef } from 'react';
import { Box } from './_utils';

function Example({ brand }) {
	const {
		COLORS,
		LAYOUT: { breakpoints },
	} = brand;

	const containerRef = useRef();
	const { width: containerWidth } = useContainerQuery(containerRef);

	let breakpoint;
	if (containerWidth > breakpoints.xl) {
		breakpoint = 'xl';
	} else if (containerWidth > breakpoints.lg) {
		breakpoint = 'lg';
	} else if (containerWidth > breakpoints.md) {
		breakpoint = 'md';
	} else if (containerWidth > breakpoints.sm) {
		breakpoint = 'sm';
	} else {
		breakpoint = 'mobile';
	}

	return (
		<GEL brand={brand}>
			<div
				ref={containerRef}
				css={{
					position: 'fixed',
					left: 0,
					right: 0,
					height: 1,
					top: -4,
				}}
			/>
			<Container css={{ backgroundColor: COLORS.primary }}>
				<Box>
					{containerWidth}px = {breakpoint}
				</Box>
			</Container>
		</GEL>
	);
}

export default Example;
