/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { List, Item } from '@westpac/list';
import { listGenerator } from './_utils';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h3>Link List</h3>
			<List type="link">
				{listGenerator('Styled link list', 3)}
				<Item>
					Styled link list
					<List>{listGenerator('Styled link list', 3)}</List>
				</Item>
				<Item>Styled link list</Item>
			</List>
			<hr />
			<h3>Tick List</h3>
			<List type="tick">
				{listGenerator('Styled tick list', 3)}
				<Item>
					Styled tick list
					<List>{listGenerator('Styled tick list', 3)}</List>
				</Item>
				<Item>Styled tick list</Item>
			</List>
			<hr />
			<h3>Unstyled</h3>
			<List type="unstyled">
				{listGenerator('Unstyled list', 3)}
				<Item>
					Unstyled list
					<List>
						{listGenerator('Unstyled list', 3)}
						<Item>
							Unstyled list<List>{listGenerator('Unstyled list', 3)}</List>
						</Item>
					</List>
				</Item>
				<Item>Unstyled list</Item>
			</List>
			<hr />
			<h3>Large</h3>
			<List size="large">
				{listGenerator('Large list', 3)}
				<Item>
					Large list
					<List>
						{listGenerator('Large list', 3)}
						<Item>
							Large list<List>{listGenerator('Large list', 3)}</List>
						</Item>
					</List>
				</Item>
				<Item>Large list</Item>
			</List>
		</GEL>
	);
}

export default Example;
