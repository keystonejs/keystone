/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { TextInput } from '@westpac/text-input';

// Example options
const options = ['Select', '1', '2', '3'];

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Default</h2>
			<fieldset>
				<legend>Legend</legend>
				<TextInput />
				<br />
				<TextInput tag="select">
					{options.map((v, i) => (
						<option key={i}>{v}</option>
					))}
				</TextInput>
				<br />
				<TextInput tag="textarea" />
			</fieldset>

			<hr />

			<h2>Disabled</h2>
			<fieldset disabled>
				<legend>Legend</legend>
				<TextInput />
				<br />
				<TextInput tag="select">
					{options.map((v, i) => (
						<option key={i}>{v}</option>
					))}
				</TextInput>
				<br />
				<TextInput tag="textarea" />
			</fieldset>
		</GEL>
	);
}

export default Example;
