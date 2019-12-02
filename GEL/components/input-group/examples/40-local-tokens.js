/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { InputGroup, Left, Right } from '@westpac/input-group';

const Label = props => (
	<span css={{ textAlign: 'center' }} {...props}>
		replaced!
		<br />
		{props.data}
	</span>
);

function Example({ brand }) {
	const overridesWithTokens = { ...brand };
	overridesWithTokens['@westpac/input-group'] = {
		css: {
			outline: '1px dotted red',
			outlineOffset: '5px',
		},
		leftCSS: {
			outline: '4px dotted green',
		},
		textCSS: {
			outline: '4px solid hotpink',
		},
		rightCSS: {
			outline: '4px dotted blue',
		},
		Label,
	};

	return (
		<GEL brand={overridesWithTokens}>
			<h2>With overrides applied</h2>
			<InputGroup>
				<Left type="label" data="AUS $" />
				<Right type="button" data="Go" onClick={() => console.log('Go clicked')} />
			</InputGroup>

			<br />
			<hr />
			<br />

			<InputGroup
				data={{
					left: {
						type: 'label',
						data: 'AUS $',
					},
					right: { type: 'button', data: 'Go', onClick: () => console.log('Go clicked') },
				}}
			/>

			<br />
			<hr />
			<br />

			<InputGroup>
				<Left
					type="select"
					data={[
						{ label: 'Select', value: '' },
						{ label: '1', value: '', onClick: () => console.log('Selected 1') },
						{ label: '2', value: '', onClick: () => console.log('Selected 2') },
						{ label: '3', value: '', onClick: () => console.log('Selected 3') },
					]}
				/>
				<Right type="button" data="Go" onClick={() => console.log('Go clicked')} />
			</InputGroup>

			<br />
			<hr />
			<br />

			<InputGroup
				data={{
					left: {
						type: 'select',
						data: [
							{ label: 'AUD $', onClick: () => console.log('Selected AUD') },
							{ label: 'USD $', onClick: () => console.log('Selected USD') },
							{ label: 'EUR €', onClick: () => console.log('Selected EUR') },
						],
					},
					right: { type: 'button', data: 'Go', onClick: () => console.log('Go clicked') },
				}}
			/>
		</GEL>
	);
}

export default Example;
