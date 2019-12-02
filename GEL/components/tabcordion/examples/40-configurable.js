/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { useState } from 'react';
import { Tab, Tabcordion } from '@westpac/tabcordion';
import { data } from './_data';
import { Row } from './_utils';

const modes = ['responsive', 'accordion', 'tabs'];
const appearances = ['soft', 'lego'];

const Control = ({ children, ...props }) => (
	<label>
		<input {...props} />
		{children}
	</label>
);
const Radio = p => <Control {...p} />;
Radio.defaultProps = { type: 'radio' };
const Checkbox = p => <Control {...p} />;
Checkbox.defaultProps = { type: 'checkbox' };

function Example({ brand }) {
	const [appearance, setAppearance] = useState(appearances[0]);
	const [mode, setMode] = useState(modes[0]);
	const [justify, setJustify] = useState(false);

	const changeJustify = () => setJustify(!justify);
	const changeAppearance = v => () => setAppearance(v);
	const changeMode = v => () => setMode(v);

	return (
		<GEL brand={brand}>
			<Row>
				Appearance:
				{appearances.map(v => (
					<Radio
						key={v}
						value={v}
						name="appearance"
						checked={v === appearance}
						onChange={changeAppearance(v)}
					>
						{v}
					</Radio>
				))}
			</Row>
			<Row>
				Mode:
				{modes.map(v => (
					<Radio key={v} value={v} name="mode" checked={v === mode} onChange={changeMode(v)}>
						{v}
					</Radio>
				))}
			</Row>
			<Row>
				<Checkbox value={true} name="mode" checked={justify} onChange={changeJustify}>
					Justify
				</Checkbox>
			</Row>

			<Tabcordion
				appearance={appearance}
				ariaLabel="Configurable Tablist"
				justifyTabs={justify}
				mode={mode}
			>
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
