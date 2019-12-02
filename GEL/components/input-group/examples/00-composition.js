/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { InputGroup, Left, Right } from '@westpac/input-group';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Single add-on</h2>

			<InputGroup>
				<Left type="label" data="AUS $" />
			</InputGroup>
			<br />

			<hr />
			<br />

			<InputGroup>
				<Right type="button" data="Go" />
			</InputGroup>
			<br />

			<hr />
			<br />

			<InputGroup>
				<Right
					type="select"
					data={[
						{ label: 'Select', value: '' },
						{ label: '1', value: '', onClick: () => console.log('Selected 1') },
						{ label: '2', value: '', onClick: () => console.log('Selected 2') },
						{ label: '3', value: '', onClick: () => console.log('Selected 3') },
					]}
				/>
			</InputGroup>
			<br />

			<hr />
			<br />

			<h2>Single add-on data-driven</h2>
			<InputGroup
				name="input name"
				data={{
					right: { type: 'label', data: 'EUR €' },
				}}
			/>
			<br />

			<hr />
			<br />

			<InputGroup
				name="input name"
				data={{
					left: { type: 'button', data: 'Submit' },
				}}
			/>
			<br />

			<hr />
			<br />

			<InputGroup
				name="input name"
				data={{
					left: {
						type: 'select',
						data: [
							{ label: 'Select', value: '' },
							{ label: '1', value: '', onClick: () => console.log('Selected 1') },
							{ label: '2', value: '', onClick: () => console.log('Selected 2') },
							{ label: '3', value: '', onClick: () => console.log('Selected 3') },
						],
					},
				}}
			/>
			<br />

			<hr />
			<br />

			<h2>Combination</h2>
			<InputGroup>
				<Left type="label" data="AUS $" />
				<Right type="button" data="Go" onClick={() => console.log('Go clicked')} />
			</InputGroup>
			<br />

			<hr />
			<br />

			<InputGroup>
				<Left
					type="select"
					data={[
						{ label: 'AUD $', onClick: () => console.log('Selected AUD') },
						{ label: 'USD $', onClick: () => console.log('Selected USD') },
						{ label: 'EUR €', onClick: () => console.log('Selected EUR') },
					]}
				/>
				<Right type="button" data="Go" onClick={() => console.log('Go clicked')} />
			</InputGroup>
			<br />

			<hr />
			<br />

			<h2>Combination data-driven</h2>
			<InputGroup
				data={{
					left: { type: 'label', data: 'AUS $' },
					right: { type: 'button', data: 'Go', onClick: () => console.log('Go clicked') },
				}}
			/>
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
