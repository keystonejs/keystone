/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Switch } from '@westpac/switch';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Screenreader only text mode</h2>
			<Switch
				name="example-sronlytext-1"
				label="Screen reader only text"
				toggleText={[]}
				srOnlyText
			/>
			<Switch name="example-sronlytext-2" label="Screen reader only text" srOnlyText />
		</GEL>
	);
}

export default Example;
