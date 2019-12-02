/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Switch } from '@westpac/switch';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>This breakpoint and wider</h2>
			<Switch
				name="example-responsive-1"
				label="Extra large for MD breakpoint and wider"
				size={['medium', 'xlarge']}
				block
			/>
			<Switch
				name="example-responsive-2"
				label="Small but Extra large for LG breakpoint"
				size={['small', null, 'xlarge']}
				block
			/>
			<hr />
			<h2>This breakpoint only</h2>
			<Switch
				name="example-responsive-3"
				label="Extra large for LG breakpoint only"
				size={['medium', null, 'xlarge', 'medium']}
				block
			/>
			<Switch
				name="example-responsive-4"
				label="Small for LG breakpoint only"
				size={['medium', null, 'small', 'medium']}
				block
			/>
			<Switch
				name="example-responsive-5"
				label="Small but Extra large for SM breakpoint only"
				size={['small', 'xlarge', 'small']}
				block
			/>
		</GEL>
	);
}

export default Example;
