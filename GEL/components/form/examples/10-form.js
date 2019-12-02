/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Form, FormGroup } from '@westpac/form';
import { Text } from '@westpac/text-input';
import { Button } from '@westpac/button';
import { Box } from './_utils';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Default instance (no styling props)</h2>
			<Form>
				<FormGroup>
					<Box>FormGroup content</Box>
				</FormGroup>
				<FormGroup>
					<Box>FormGroup content</Box>
				</FormGroup>
			</Form>

			<hr />

			<h2>Spacing</h2>

			<h3>Medium</h3>
			<Form spacing="medium">
				<FormGroup>
					<Box>FormGroup content</Box>
				</FormGroup>
				<FormGroup>
					<Box>FormGroup content</Box>
				</FormGroup>
			</Form>

			<h3>Large</h3>
			<Form spacing="large">
				<FormGroup>
					<Box>FormGroup content</Box>
				</FormGroup>
				<FormGroup>
					<Box>FormGroup content</Box>
				</FormGroup>
			</Form>

			<hr />

			<h2>Size</h2>

			<h3>Small</h3>
			<Form size="small">
				<FormGroup>
					<Text />
				</FormGroup>
			</Form>

			<h3>Medium</h3>
			<Form size="medium">
				<FormGroup>
					<Text />
				</FormGroup>
			</Form>

			<h3>Large</h3>
			<Form size="large">
				<FormGroup>
					<Text />
				</FormGroup>
			</Form>

			<h3>XLarge</h3>
			<Form size="xlarge">
				<FormGroup>
					<Text />
				</FormGroup>
			</Form>

			<hr />

			<h2>Inline mode (SM+)</h2>
			<Form inline>
				<FormGroup>
					<Text />
				</FormGroup>
				<FormGroup>{/* <Button>Go</Button> */}</FormGroup>
			</Form>
		</GEL>
	);
}

export default Example;
