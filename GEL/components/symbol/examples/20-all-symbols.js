/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import * as components from '@westpac/symbol';
import { Cell, Grid, Name } from './_utils';

const symbols = Object.keys(components).filter(s => s.includes('Symbol'));

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<Grid>
				{symbols.map(s => {
					const Symbol = components[s];
					return (
						<Cell key={s}>
							<Symbol />
							<Name>{s}</Name>
						</Cell>
					);
				})}
			</Grid>
		</GEL>
	);
}

export default Example;
