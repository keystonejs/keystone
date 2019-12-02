/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Tab, Tabcordion } from '@westpac/tabcordion';
import { data } from './_data';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h3>Soft</h3>
			<Tabcordion mode="tabs" appearance="soft" justifyTabs>
				{data.map(t => (
					<Tab key={t.label} label={t.label}>
						{t.content}
					</Tab>
				))}
			</Tabcordion>
			<h3>Lego</h3>
			<Tabcordion mode="tabs" appearance="lego" justifyTabs>
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
