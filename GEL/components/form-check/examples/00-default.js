/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { FormCheck, Option } from '@westpac/form-check';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Default instance (no styling props)</h2>
			<FormCheck name="example-default">
				<Option value="1">Option 1</Option>
				<Option value="2">Option 2</Option>
			</FormCheck>

			<hr />

			<h2>Checkbox</h2>
			<FormCheck type="checkbox" name="example-checkbox">
				<Option value="1">Option 1</Option>
				<Option value="2">Option 2</Option>
				<Option value="3">
					Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et odit labore illo sint tempora
					magnam modi nesciunt consectetur vitae maiores itaque reiciendis sunt nisi ullam officiis,
					provident fugiat, esse iste adipisci repellat! Incidunt delectus, pariatur quaerat vitae
					aspernatur eveniet libero.
				</Option>
			</FormCheck>

			<hr />

			<h2>Radio</h2>
			<FormCheck type="radio" name="example-radio">
				<Option value="1">Option 1</Option>
				<Option value="2">Option 2</Option>
				<Option value="3">
					Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et odit labore illo sint tempora
					magnam modi nesciunt consectetur vitae maiores itaque reiciendis sunt nisi ullam officiis,
					provident fugiat, esse iste adipisci repellat! Incidunt delectus, pariatur quaerat vitae
					aspernatur eveniet libero.
				</Option>
			</FormCheck>
		</GEL>
	);
}

export default Example;
