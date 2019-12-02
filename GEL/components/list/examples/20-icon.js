/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { AndroidIcon, GithubIcon } from '@westpac/icon';
import { List, Item } from '@westpac/list';
import { listGenerator } from './_utils';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h3>Icon</h3>
			<List type="icon" icon={AndroidIcon}>
				{listGenerator('Styled icon list', 3)}
				<Item>
					Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo dolor provident quasi nisi
					officia tempore fuga autem, animi iste molestiae, qui omnis doloribus aliquid ipsam rem
					fugiat veniam voluptatem accusamus! Lorem ipsum dolor sit amet, consectetur adipisicing
					elit. Est, unde quis, molestias nisi quae voluptates nemo quaerat nihil, consequuntur
					nobis ratione rerum asperiores eveniet dicta maiores quia nostrum
					<List>{listGenerator('Styled icon list', 3)}</List>
				</Item>
			</List>
			<hr />
			<List type="icon" icon={AndroidIcon}>
				{listGenerator('Styled icon list', 3)}
				<Item type="icon" icon={GithubIcon}>
					Styled icon list
					<List>{listGenerator('Styled icon list', 3)}</List>
				</Item>
			</List>
		</GEL>
	);
}

export default Example;
