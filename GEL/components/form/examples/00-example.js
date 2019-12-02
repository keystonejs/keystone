/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import {
	Form,
	ChitChat,
	ErrorMessage,
	Fieldset,
	FormGroup,
	Hint,
	InputCluster,
	Item,
	FormLabel,
	FormSection,
} from '@westpac/form';
import { Text } from '@westpac/text-input';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Default size and spacing</h2>
			<Form>
				<FormSection>
					<ChitChat>
						Hello, I’m the friendly conversational text component. I live at the top of the form pod
						if required.
					</ChitChat>
				</FormSection>

				<FormSection>
					<FormGroup>
						<FormLabel htmlFor="example-default-1">This is a label</FormLabel>
						<Hint>This is a hint</Hint>
						<ErrorMessage message="This is an error message" />
						<Text name="example-default-1" />
					</FormGroup>

					<FormGroup>
						<FormLabel htmlFor="example-default-2">This is a label</FormLabel>
						<Hint>This is a hint</Hint>
						<ErrorMessage message="This is an error message" />
						<Text name="example-default-2" />
					</FormGroup>
				</FormSection>

				<FormSection>
					<FormGroup>
						<FormLabel htmlFor="example-default-3">This is a label</FormLabel>
						<Hint>This is a hint</Hint>
						<ErrorMessage message="This is an error message" />
						<Text name="example-default-3" />
					</FormGroup>

					<FormGroup>
						<Fieldset legend="This is a legend">
							<Hint>This is a hint</Hint>
							<ErrorMessage
								message={['This is an error message', 'This is another error message']}
							/>
							<InputCluster>
								<Item>
									<Text name="example-default-4-line1" />
								</Item>
								<Item>
									<Text name="example-default-4-line2" />
								</Item>
							</InputCluster>
						</Fieldset>
					</FormGroup>
				</FormSection>
			</Form>

			<hr />

			<h2>Large size with large spacing</h2>
			<Form size="large" spacing="large">
				<FormSection>
					<ChitChat>
						Hello, I’m the friendly conversational text component. I live at the top of the form pod
						if required.
					</ChitChat>
				</FormSection>

				<FormSection>
					<FormGroup>
						<FormLabel htmlFor="example-large-1">This is a label</FormLabel>
						<Hint>This is a hint</Hint>
						<ErrorMessage message="This is an error message" />
						<Text name="example-large-1" />
					</FormGroup>

					<FormGroup>
						<FormLabel htmlFor="example-large-2">This is a label</FormLabel>
						<Hint>This is a hint</Hint>
						<ErrorMessage message="This is an error message" />
						<Text name="example-large-2" />
					</FormGroup>
				</FormSection>

				<FormSection>
					<FormGroup>
						<FormLabel htmlFor="example-large-3">This is a label</FormLabel>
						<Hint>This is a hint</Hint>
						<ErrorMessage message="This is an error message" />
						<Text name="example-large-3" />
					</FormGroup>

					<FormGroup>
						<Fieldset legend="This is a legend">
							<Hint>This is a hint</Hint>
							<ErrorMessage
								message={['This is an error message', 'This is another error message']}
							/>
							<InputCluster>
								<Item>
									<Text name="example-large-4-line1" />
								</Item>
								<Item>
									<Text name="example-large-4-line2" />
								</Item>
							</InputCluster>
						</Fieldset>
					</FormGroup>
				</FormSection>
			</Form>
		</GEL>
	);
}

export default Example;
