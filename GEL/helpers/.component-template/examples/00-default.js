/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { _COMPONENT_NAME_ } from '@westpac/_COMPONENT_KEY_';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<_COMPONENT_NAME_ />
		</GEL>
	);
}

export default Example;
