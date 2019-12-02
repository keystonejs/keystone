/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Cell, Grid } from '@westpac/grid';
import { Box } from './_utils';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<Grid
				columns={'10rem 1fr 10rem'}
				areas={['header header header', 'menu content ads', 'footer footer footer']}
			>
				<Cell area="header">
					<Box>Header</Box>
				</Cell>
				<Cell area="footer">
					<Box>Footer</Box>
				</Cell>

				<Cell area="menu">
					<Box>Menu</Box>
				</Cell>
				<Cell area="ads">
					<Box>Ads</Box>
				</Cell>

				<Cell area="content">
					<Box>Content</Box>
				</Cell>
			</Grid>
		</GEL>
	);
}

export default Example;
