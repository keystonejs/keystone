/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Button } from '@westpac/button';

// Examples
const sizes = [
	['small', 'medium', 'large', 'xlarge'],
	['large', 'medium'],
	['small', null, 'large'],
];
const blocks = [[true, false, true, false], [true, false], [true, null, false]];

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Responsive sizing</h2>
			{sizes.map((s, i) => (
				<p key={i}>
					<Button look="primary" size={s}>
						[{s.map(v => String(v)).join(', ')}]
					</Button>
				</p>
			))}

			<hr />

			<h2>Responsive block</h2>
			{blocks.map((b, i) => (
				<p key={i}>
					<Button look="primary" size="xlarge" block={b}>
						[{b.map(v => String(v)).join(', ')}]
					</Button>
				</p>
			))}
		</GEL>
	);
}

export default Example;
