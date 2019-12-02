/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Tab, Tabcordion } from '@westpac/tabcordion';
import { data } from './_data';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<Tabcordion>
				{data.map(t => (
					<Tab key={t.label} label={t.label}>
						{t.content}
					</Tab>
				))}
			</Tabcordion>
		</GEL>
	);
}

export default Example;
