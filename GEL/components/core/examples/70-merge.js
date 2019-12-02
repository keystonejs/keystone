/** @jsx jsx */

import { GEL, jsx, merge } from '@westpac/core';
import { Code } from './_utils';

function Example({ brand }) {
	let object = { a: [{ b: 2 }, { d: 4 }] };
	let other = (other = { a: [{ c: 3 }, { e: 5 }] });

	return (
		<GEL brand={brand}>
			<Code>
				const object = {JSON.stringify(object, null, 2)};{<br css={{ margin: '1rem' }} />}
				const other = {JSON.stringify(other, null, 2)};{<br css={{ margin: '1rem' }} />}
				merge(object, other);
			</Code>
			=>
			<Code>{JSON.stringify(merge(object, other), null, 2)}</Code>
		</GEL>
	);
}

export default Example;
