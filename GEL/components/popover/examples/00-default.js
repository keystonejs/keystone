/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Popover } from '@westpac/popover';
import { Button } from '@westpac/button';

const content =
	'Hello vivamus sagittis lacus vel augue laoreet rutrum faucibus. Lorem ipsum dolor sit amet, consectetur adipisicing elit. ' +
	'Nesciunt laboriosam, mollitia magnam ad magni consequuntur hic et quos optio corrupti praesentium veniam aspernatur minima aperiam ut quas, ' +
	'possimus non architecto. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aut animi velit in? Suscipit nostrum itaque voluptatibus ' +
	'dolorem qui soluta nobis modi officia incidunt eos dolores atque, unde error delectus officiis.';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<Popover title="Popover Title" content={content}>
				<Button>Click Me</Button>
			</Popover>
			<div style={{ marginTop: '50rem' }} />
			<Popover title="Popover Title" content={content}>
				<Button>Click Me</Button>
			</Popover>
		</GEL>
	);
}

export default Example;
