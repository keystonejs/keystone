/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Tab, Tabcordion } from '@westpac/tabcordion';
import { data } from './_data';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h3>Responsive</h3>
			<Tabcordion>
				{data.map(t => (
					<Tab key={t.label} label={t.label}>
						{t.content}
					</Tab>
				))}
			</Tabcordion>

			<h3>Always accordion</h3>
			<Tabcordion mode="accordion" instanceId="always-accordion">
				{data.map(t => (
					<Tab key={t.label} label={t.label}>
						{t.content}
					</Tab>
				))}
			</Tabcordion>

			<h3>Always tabs</h3>
			<Tabcordion mode="tabs" instanceId="always-tabs">
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
