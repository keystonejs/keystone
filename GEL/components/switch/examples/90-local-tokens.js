/** @jsx jsx */

import { useState } from 'react';
import { GEL, jsx } from '@westpac/core';
import { Switch } from '@westpac/switch';

const Label = props => <strong css={{ color: 'palevioletred', paddingRight: '2rem' }} {...props} />;

function Example({ brand }) {
	const [checked, setChecked] = useState(false);
	const overridesWithTokens = { ...brand };

	overridesWithTokens['@westpac/switch'] = {
		toggleCSS: {
			borderColor: 'mediumvioletred',
			backgroundColor: checked ? 'palevioletred' : 'white',
		},
		toggleTextCSS: { color: checked ? 'white' : 'firebrick' },
		CSS: { paddingBottom: '1rem', borderBottom: '2px solid palevioletred' },
		Label,
	};

	return (
		<GEL brand={overridesWithTokens}>
			<h2>With local tokens applied</h2>
			<Switch
				name="example-default"
				label="Turn notifications"
				checked={checked}
				onChange={() => setChecked(!checked)}
			/>
			<Switch
				name="example-default2"
				label="Turn notifications"
				checked={checked}
				onChange={() => setChecked(!checked)}
				css={{ borderBottom: '2px solid red' }}
			/>
		</GEL>
	);
}

export default Example;
