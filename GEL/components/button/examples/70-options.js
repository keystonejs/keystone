/** @jsx jsx */

import { HouseIcon } from '@westpac/icon';
import { GEL, jsx } from '@westpac/core';
import { Button } from '@westpac/button';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>‘Screen reader only’ text mode</h2>

			<Button iconAfter={HouseIcon} srOnlyText>
				Screen reader only text
			</Button>
		</GEL>
	);
}

export default Example;
