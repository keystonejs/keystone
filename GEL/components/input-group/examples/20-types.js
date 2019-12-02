/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { InputGroup, Left, Right } from '@westpac/input-group';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Invalid</h2>

			<InputGroup invalid defaultValue="Text that can be edited">
				<Left type="label" data="AUS $" />
			</InputGroup>
			<br />

			<InputGroup
				invalid
				defaultValue="Text that can be edited"
				data={{
					left: { type: 'label', data: 'AUS $' },
				}}
			/>
			<br />

			<hr />

			<h2>Disabled</h2>

			<InputGroup disabled value="This input is disabled and contains a value">
				<Left type="label" data="AUS $" />
			</InputGroup>
			<br />

			<InputGroup
				disabled
				value="This input is disabled and contains a value"
				data={{
					left: { type: 'label', data: 'AUS $' },
				}}
			/>
			<br />

			<hr />

			<h2>Read only</h2>

			<InputGroup readOnly value="This input is read only and contains a value">
				<Left type="label" data="AUS $" />
			</InputGroup>
			<br />

			<InputGroup
				readOnly
				value="This input is read only and contains a value"
				data={{
					left: { type: 'label', data: 'AUS $' },
				}}
			/>
		</GEL>
	);
}

export default Example;
