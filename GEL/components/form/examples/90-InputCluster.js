/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Form, FormGroup, InputCluster, Item, FormLabel } from '@westpac/form';
import { Text } from '@westpac/text-input';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Default instance (no styling props)</h2>
			<Form>
				<FormGroup>
					<InputCluster>
						<Item>
							<FormLabel htmlFor="example-1" sublabel>
								This is a sub-label
							</FormLabel>
							<Text />
						</Item>
						<Item>
							<FormLabel htmlFor="example-2" sublabel>
								This is a sub-label
							</FormLabel>
							<Text />
						</Item>
					</InputCluster>
				</FormGroup>
			</Form>

			<hr />

			<h2>Horizontal mode</h2>
			<p>Note: Will wrap when available space is limited, but a vertical gap is not provided.</p>

			<Form>
				<FormGroup>
					<InputCluster horizontal>
						<Item>
							<FormLabel htmlFor="example-3" sublabel>
								This is a sub-label
							</FormLabel>
							<Text />
						</Item>
						<Item>
							<FormLabel htmlFor="example-4" sublabel>
								This is a sub-label
							</FormLabel>
							<Text />
						</Item>
					</InputCluster>
				</FormGroup>
			</Form>
		</GEL>
	);
}

export default Example;
