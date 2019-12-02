/** @jsx jsx */

import { GEL, jsx, Global, useFonts, useBrand } from '@westpac/core';
import { Code } from './_utils';

function Example({ brand }) {
	const { TYPE } = useBrand();

	return (
		<GEL brand={brand}>
			<div
				css={{
					...useFonts({ path: 'assets/' }),
				}}
			>
				<span
					css={{
						fontSize: '3rem',
						fontFamily: TYPE.brandFont.fontFamily,
					}}
				>
					<span
						css={{
							fontSize: '8rem',
						}}
					>
						ag
					</span>
					- This is the brand font
				</span>
			</div>
			<hr />
			<Code>
				useFonts({'{'} path: 'path/to/my/fonts/' {'}'})
			</Code>
			=>
			<Code>{JSON.stringify(useFonts({ path: 'path/to/my/fonts/' }), null, 2)}</Code>
		</GEL>
	);
}

export default Example;
