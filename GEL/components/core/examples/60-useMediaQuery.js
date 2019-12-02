/** @jsx jsx */

import { GEL, jsx, useMediaQuery } from '@westpac/core';
import { Code } from './_utils';

function Example({ brand }) {
	const mq = useMediaQuery();

	return (
		<GEL brand={brand}>
			<strong>[1,2,3,4]</strong>
			<Code>{JSON.stringify(mq({ thing: [1, 2, 3, 4] }), null, 2)}</Code>

			<hr />

			<strong>[null,2,3,4]</strong>
			<Code>{JSON.stringify(mq({ thing: [null, 2, 3, 4] }), null, 2)}</Code>

			<hr />

			<strong>[1,null,3,4]</strong>
			<Code>{JSON.stringify(mq({ thing: [1, null, 3, 4] }), null, 2)}</Code>

			<hr />

			<strong>[1,2,null,4]</strong>
			<Code>{JSON.stringify(mq({ thing: [1, 2, null, 4] }), null, 2)}</Code>

			<hr />

			<strong>[1,2,3]</strong>
			<Code>{JSON.stringify(mq({ thing: [1, 2, 3] }), null, 2)}</Code>

			<hr />

			<strong>[1,2]</strong>
			<Code>{JSON.stringify(mq({ thing: [1, 2] }), null, 2)}</Code>

			<hr />

			<strong>[1]</strong>
			<Code>{JSON.stringify(mq({ thing: [1] }), null, 2)}</Code>

			<hr />

			<strong>1</strong>
			<Code>{JSON.stringify(mq({ thing: 1 }), null, 2)}</Code>
		</GEL>
	);
}

export default Example;
