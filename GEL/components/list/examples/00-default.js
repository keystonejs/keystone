/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { List, Item } from '@westpac/list';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<List>
				<Item>Styled bullet list - primary</Item>
				<Item>Styled bullet list - primary</Item>
				<Item>Styled bullet list - primary</Item>
			</List>

			<br />
			<hr />
			<br />

			<h3>Bullet List</h3>
			<List look="primary">
				<Item>Styled bullet list - primary</Item>
				<Item>Styled bullet list - primary</Item>
				<Item>Styled bullet list - primary</Item>
				<Item>
					Styled bullet list - primary
					<List>
						<Item>Styled bullet list - primary</Item>
						<Item>Styled bullet list - primary</Item>
						<Item>Styled bullet list - primary</Item>
						<Item>
							Styled bullet list - primary
							<List>
								<Item>Styled bullet list - primary</Item>
								<Item>Styled bullet list - primary</Item>
								<Item>Styled bullet list - primary</Item>
							</List>
						</Item>
						<Item>Styled bullet list - primary</Item>
					</List>
				</Item>
				<Item>Styled bullet list - primary</Item>
			</List>

			<br />
			<hr />
			<br />

			<List look="hero">
				<Item>Styled bullet list - hero</Item>
				<Item>Styled bullet list - hero</Item>
				<Item>Styled bullet list - hero</Item>
				<Item>
					Styled bullet list - hero
					<List>
						<Item>Styled bullet list - hero</Item>
						<Item>Styled bullet list - hero</Item>
						<Item>Styled bullet list - hero</Item>
						<Item>
							Styled bullet list - hero
							<List>
								<Item>Styled bullet list - hero</Item>
								<Item>Styled bullet list - hero</Item>
								<Item>Styled bullet list - hero</Item>
							</List>
						</Item>
					</List>
				</Item>
				<Item>Styled bullet list - hero</Item>
			</List>

			<br />
			<hr />
			<br />

			<List look="neutral">
				<Item>Styled bullet list - neutral</Item>
				<Item>Styled bullet list - neutral</Item>
				<Item>Styled bullet list - neutral</Item>
				<Item>
					Styled bullet list - neutral
					<List>
						<Item>Styled bullet list - neutral</Item>
						<Item>Styled bullet list - neutral</Item>
						<Item>Styled bullet list - neutral</Item>
					</List>
				</Item>
				<Item>Styled bullet list - neutral</Item>
			</List>
		</GEL>
	);
}

export default Example;
