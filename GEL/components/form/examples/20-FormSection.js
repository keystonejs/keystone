/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Form, FormGroup, FormSection, FormSectionImg } from '@westpac/form';
import { Box } from './_utils';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Default</h2>
			<Form>
				<FormSection>
					<FormGroup>
						<Box>FormGroup content</Box>
					</FormGroup>
					<FormGroup>
						<Box>FormGroup content</Box>
					</FormGroup>
				</FormSection>
				<FormSection>
					<FormGroup>
						<Box>FormGroup content</Box>
					</FormGroup>
					<FormGroup>
						<Box>FormGroup content</Box>
					</FormGroup>
				</FormSection>
			</Form>

			<hr />

			<h2>FormSection with image</h2>
			<Form>
				<FormSection>
					<FormSectionImg src="https://placehold.co/190x120/eee/ddd" alt="Alternative text here" />
					<FormGroup>
						<Box>FormGroup content</Box>
					</FormGroup>
				</FormSection>
			</Form>

			<hr />

			<h2>FormSection with no padding</h2>
			<Form>
				<FormSection noPadding>
					<FormGroup>
						<Box>FormGroup content</Box>
					</FormGroup>
					<FormGroup>
						<Box>FormGroup content</Box>
					</FormGroup>
				</FormSection>
				<FormSection noPadding>
					<FormGroup>
						<Box>FormGroup content</Box>
					</FormGroup>
					<FormGroup>
						<Box>FormGroup content</Box>
					</FormGroup>
				</FormSection>
			</Form>
		</GEL>
	);
}

export default Example;
