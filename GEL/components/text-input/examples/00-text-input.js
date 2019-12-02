/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Text } from '@westpac/text-input';
import { Button } from '@westpac/button';
import { Form } from '@westpac/form';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Default instance</h2>
			<Text />
			<br />

			<hr />

			<h2>Size</h2>
			<Text size="small" placeholder="small" />
			<br />
			<Text size="medium" placeholder="medium" />
			<br />
			<Text size="large" placeholder="large" />
			<br />
			<Text size="xlarge" placeholder="xlarge" />
			<br />

			<hr />

			<h2>Invalid</h2>
			<Text invalid />
			<br />

			<hr />

			<h2>Disabled</h2>
			<Text disabled />
			<br />
			<Text disabled value="This input is disabled and contains a value" />
			<br />

			<hr />

			<h2>Readonly</h2>
			<Text readOnly value="This value is readonly" />
			<br />

			<hr />

			<h2>Inline</h2>
			<Form action="#">
				<Text inline /> <Text inline /> <Button type="submit">Submit</Button>
			</Form>
			<br />

			<hr />

			<h2>Fixed width</h2>
			<Text width={2} placeholder={2} />
			<br />
			<Text width={3} placeholder={3} />
			<br />
			<Text width={4} placeholder={4} />
			<br />
			<Text width={5} placeholder={5} />
			<br />
			<Text width={10} placeholder={10} />
			<br />
			<Text width={20} placeholder={20} />
			<br />
			<Text width={30} placeholder={30} />
		</GEL>
	);
}

export default Example;
