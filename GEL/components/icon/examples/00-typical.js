/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { HouseIcon } from '@westpac/icon';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<HouseIcon />
		</GEL>
	);
}

export default Example;
