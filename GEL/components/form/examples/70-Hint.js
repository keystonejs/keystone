/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Form, FormGroup, FormLabel, Hint } from '@westpac/form';
import { Box } from './_utils';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Spacing</h2>

			<h3>Medium</h3>
			<Form spacing="medium">
				<FormGroup>
					<FormLabel htmlFor="example-hint">This is a label</FormLabel>
					<Hint>This is a hint</Hint>
					<Box>Form input here</Box>
				</FormGroup>
			</Form>

			<h3>Large</h3>
			<Form spacing="large">
				<FormGroup>
					<FormLabel htmlFor="example-hint">This is a large spaced label</FormLabel>
					<Hint>This is a hint</Hint>
					<Box>Form input here</Box>
				</FormGroup>
			</Form>
		</GEL>
	);
}

export default Example;
