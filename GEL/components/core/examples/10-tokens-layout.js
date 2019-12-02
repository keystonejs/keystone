/** @jsx jsx */

import { GEL, jsx, useBrand } from '@westpac/core';

function Example({ brand }) {
	const { LAYOUT } = useBrand();

	return (
		<GEL brand={brand}>
			<h2>Layout</h2>
			Breakpoints:
			<ul
				css={{
					listStyle: 'none',
					margin: 0,
					padding: 0,
				}}
			>
				{Object.entries(LAYOUT.breakpoints).map(([name, breakpoint], i) => (
					<li key={i}>
						{name}: {breakpoint}px
					</li>
				))}
			</ul>
		</GEL>
	);
}

export default Example;
