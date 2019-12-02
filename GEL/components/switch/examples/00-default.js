/** @jsx jsx */

import { useState } from 'react';
import { GEL, jsx } from '@westpac/core';
import { Switch } from '@westpac/switch';

function Example({ brand }) {
	const [checked, setChecked] = useState(false);

	return (
		<GEL brand={brand}>
			<h2>Default instance (no styling props)</h2>
			<Switch name="example-default" label="Turn notifications" />
			<h2>Controlled</h2>
			<Switch
				name="example-checked"
				label={'Turn notifications'}
				checked={checked}
				onChange={() => {
					console.log('Controlled');
					setChecked(!checked);
				}}
			/>
		</GEL>
	);
}

export default Example;
