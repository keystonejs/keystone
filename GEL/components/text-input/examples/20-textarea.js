/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Textarea } from '@westpac/text-input';
import { Form } from '@westpac/form';

const sizes = ['small', 'medium', 'large', 'xlarge'];
const widths = [2, 3, 4, 5, 10, 20, 30];

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Default instance</h2>
			<Textarea />
			<br />

			<hr />

			<h2>Size</h2>
			<Textarea size="small" placeholder="small" />
			<br />
			<Textarea size="medium" placeholder="medium" />
			<br />
			<Textarea size="large" placeholder="large" />
			<br />
			<Textarea size="xlarge" placeholder="xlarge" />
			<br />

			<hr />

			<h2>Invalid</h2>
			<Textarea placeholder="invalid" invalid />
			<br />

			<hr />

			<h2>Disabled</h2>
			<Textarea
				placeholder="disabled"
				disabled
				defaultValue="This textarea is disabled and contains a value"
			/>
			<br />

			<hr />
			<h2>Readonly</h2>
			<Textarea placeholder="readonly" readOnly defaultValue="This value is readonly" />
			<br />

			<hr />

			<h2>Inline</h2>
			<Form>
				<Textarea inline /> <Textarea inline />
			</Form>
			<br />

			<hr />

			<h2>Fixed width</h2>
			<Textarea width={2} placeholder={'W'.repeat(2)} />
			<br />
			<Textarea width={3} placeholder={'W'.repeat(3)} />
			<br />
			<Textarea width={4} placeholder={'W'.repeat(4)} />
			<br />
			<Textarea width={5} placeholder={'W'.repeat(5)} />
			<br />
			<Textarea width={10} placeholder={'W'.repeat(10)} />
			<br />
			<Textarea width={20} placeholder={'W'.repeat(20)} />
			<br />
			<Textarea width={30} placeholder={'W'.repeat(30)} />
			<br />
		</GEL>
	);
}

export default Example;
