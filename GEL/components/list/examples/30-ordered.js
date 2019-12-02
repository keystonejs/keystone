/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { List, Item } from '@westpac/list';
import { listGenerator } from './_utils';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h3>Ordered</h3>
			<List type="ordered">
				{listGenerator('Ordered', 3)}
				<Item>
					Ordered list
					<List>{listGenerator('Ordered', 3)}</List>
				</Item>
				{listGenerator('Ordered', 3)}
				<Item>
					Ordered list
					<List type="bullet">{listGenerator('Ordered', 3)}</List>
				</Item>
				{listGenerator('Ordered', 3)}
			</List>
		</GEL>
	);
}

export default Example;
