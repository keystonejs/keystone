/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Button, ButtonGroup } from '@westpac/button';
import { HouseIcon } from '@westpac/icon';
import { Fragment } from 'react';

const TextWrapper = ({ children, ...rest }) => (
	<Fragment>
		{children}
		<HouseIcon size="small" color="currentColor" css={{ marginLeft: '0.5em' }} />
	</Fragment>
);

function Example({ brand }) {
	const overridesWithTokens = { ...brand };
	overridesWithTokens['@westpac/button'] = {
		primary: {
			standardCSS: {
				backgroundColor: 'rebeccapurple',
				outline: '1px solid red',
			},
		},
		buttonGroupCSS: {
			color: 'red',
		},
		TextWrapper,
	};

	return (
		<GEL brand={overridesWithTokens}>
			<h2>With overrides applied</h2>
			<Button>Default standard</Button> <Button look="primary">Primary standard</Button>{' '}
			<Button look="hero">Hero standard</Button> <Button look="faint">Faint standard</Button>{' '}
			<Button look="link">Link</Button>
			<hr />
			<ButtonGroup
				data={[
					{ children: 'Left', value: 'left' },
					{ children: 'Middle', value: 'middle' },
					{ children: 'Right', value: 'right' },
				]}
			/>
		</GEL>
	);
}

export default Example;
