/** @jsx jsx */

import { useState } from 'react';
import { GEL, jsx } from '@westpac/core';
import { Button, ButtonGroup } from '@westpac/button';

function ButtonGroupExample({ brand }) {
	const [controlled, setControlled] = useState();
	const [value, setValue] = useState('');
	const [index, setIndex] = useState(-1);

	return (
		<GEL brand={brand}>
			<ButtonGroup>
				<Button>Left</Button>
				<Button>Middle</Button>
				<Button>Right</Button>
			</ButtonGroup>

			<h2>Responsive</h2>

			<ButtonGroup block={[true, false, true, false, true]}>
				<Button>Left</Button>
				<Button>Middle</Button>
				<Button>Right</Button>
			</ButtonGroup>

			<h2>Click Handlers Preserved</h2>

			<ButtonGroup>
				<Button onClick={() => console.log('You clicked "Left"')}>Left</Button>
				<Button onClick={() => console.log('You clicked "Middle"')}>Middle</Button>
				<Button onClick={() => console.log('You clicked "Right"')}>Right</Button>
			</ButtonGroup>

			<h2>Data</h2>

			<ButtonGroup
				name="data-group"
				data={[
					{ children: 'Left', value: 'left' },
					{ children: 'Middle', value: 'middle' },
					{ children: 'Right', value: 'right' },
				]}
			/>

			<h2>Controlled</h2>

			<button type="button" onClick={() => setControlled('yes')}>
				Set to "yes"
			</button>
			<button type="button" onClick={() => setControlled('maybe')}>
				Set to "maybe"
			</button>
			<button type="button" onClick={() => setControlled('no')}>
				Set to "no"
			</button>
			<button type="button" onClick={() => setControlled('')}>
				reset
			</button>
			<br />
			<br />
			<ButtonGroup value={controlled} onChange={v => setControlled(v)}>
				<Button value="yes">Yes</Button>
				<Button value="maybe">Maybe</Button>
				<Button value="no">No</Button>
			</ButtonGroup>

			<h3>Index (integer)</h3>
			<ButtonGroup value={index} onChange={v => setIndex(v)}>
				<Button>Left</Button>
				<Button>Middle</Button>
				<Button>Right</Button>
			</ButtonGroup>

			<h3>Key (string)</h3>
			<ButtonGroup value={value} onChange={v => setValue(v)}>
				<Button value="left">Left</Button>
				<Button value="middle">Middle</Button>
				<Button value="right">Right</Button>
			</ButtonGroup>

			<h2>Form Use (name prop)</h2>

			<ButtonGroup name="radio-group">
				<Button value="9d8f2fc8">Left</Button>
				<Button value="3df9722d">Middle</Button>
				<Button value="f881356f">Right</Button>
			</ButtonGroup>

			<h2>Default Value</h2>

			<h3>Index (integer)</h3>
			<ButtonGroup defaultValue={0}>
				<Button>Left</Button>
				<Button>Middle</Button>
				<Button>Right</Button>
			</ButtonGroup>

			<h3>Key (string)</h3>
			<ButtonGroup defaultValue={'right'}>
				<Button value="left">Left</Button>
				<Button value="middle">Middle</Button>
				<Button value="right">Right</Button>
			</ButtonGroup>

			<h2>Block</h2>

			<ButtonGroup block>
				<Button>Left</Button>
				<Button>Middle</Button>
				<Button>Right</Button>
			</ButtonGroup>

			<h2>Look</h2>

			<h3>Primary</h3>
			<ButtonGroup look="primary">
				<Button>Left</Button>
				<Button>Middle</Button>
				<Button>Right</Button>
			</ButtonGroup>

			<h3>Hero</h3>
			<ButtonGroup look="hero">
				<Button>Left</Button>
				<Button>Middle</Button>
				<Button>Right</Button>
			</ButtonGroup>

			<h2>Disabled</h2>

			<ButtonGroup disabled>
				<Button>Left</Button>
				<Button>Middle</Button>
				<Button>Right</Button>
			</ButtonGroup>

			<h2>Size</h2>

			<h3>Small</h3>
			<ButtonGroup size="small">
				<Button>Left</Button>
				<Button>Middle</Button>
				<Button>Right</Button>
			</ButtonGroup>

			<h3>Medium</h3>
			<ButtonGroup size="medium">
				<Button>Left</Button>
				<Button>Middle</Button>
				<Button>Right</Button>
			</ButtonGroup>

			<h3>Large</h3>
			<ButtonGroup size="large">
				<Button>Left</Button>
				<Button>Middle</Button>
				<Button>Right</Button>
			</ButtonGroup>

			<h3>Extra large</h3>
			<ButtonGroup size="xlarge">
				<Button>Left</Button>
				<Button>Middle</Button>
				<Button>Right</Button>
			</ButtonGroup>
		</GEL>
	);
}

export default ButtonGroupExample;
