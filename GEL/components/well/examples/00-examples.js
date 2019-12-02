/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Well } from '@westpac/well';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h3>Default</h3>
			<Well>Look, I'm in a well.</Well>

			<hr />

			<h3>Nested</h3>
			<Well>
				I am outside
				<Well>I am inside</Well>
			</Well>
		</GEL>
	);
}

export default Example;
