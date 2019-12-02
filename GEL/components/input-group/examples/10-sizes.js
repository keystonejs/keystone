/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { InputGroup, Left, Right } from '@westpac/input-group';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Small size</h2>
			<InputGroup size="small">
				<Left type="label" data="AUS $" />
			</InputGroup>
			<br />

			<InputGroup size="small">
				<Right type="button" data="Go" />
			</InputGroup>
			<br />

			<InputGroup size="small">
				<Left type="label" data="AUS $" />
				<Right type="button" data="Go" onClick={() => console.log('Go clicked')} />
			</InputGroup>
			<br />

			<InputGroup size="small">
				<Left type="select" data={[{ label: 'AUD $' }, { label: 'USD $' }, { label: 'EUR €' }]} />
				<Right type="button" data="Go" />
			</InputGroup>
			<br />

			<InputGroup size="small">
				<Right type="select" data={[{ label: 'AUD $' }, { label: 'USD $' }, { label: 'EUR €' }]} />
			</InputGroup>
			<br />

			<hr />

			<h2>Medium size</h2>
			<InputGroup size="medium">
				<Left type="label" data="AUS $" />
			</InputGroup>
			<br />

			<InputGroup size="medium">
				<Right type="button" data="Go" />
			</InputGroup>
			<br />

			<InputGroup size="medium">
				<Left type="label" data="AUS $" />
				<Right type="button" data="Go" onClick={() => console.log('Go clicked')} />
			</InputGroup>
			<br />

			<InputGroup size="medium">
				<Left type="select" data={[{ label: 'AUD $' }, { label: 'USD $' }, { label: 'EUR €' }]} />
				<Right type="button" data="Go" />
			</InputGroup>
			<br />

			<InputGroup size="medium">
				<Right type="select" data={[{ label: 'AUD $' }, { label: 'USD $' }, { label: 'EUR €' }]} />
			</InputGroup>
			<br />

			<hr />

			<h2>Large size</h2>
			<InputGroup size="large">
				<Left type="label" data="AUS $" />
			</InputGroup>
			<br />

			<InputGroup size="large">
				<Right type="button" data="Go" />
			</InputGroup>
			<br />

			<InputGroup size="large">
				<Left type="label" data="AUS $" />
				<Right type="button" data="Go" onClick={() => console.log('Go clicked')} />
			</InputGroup>
			<br />

			<InputGroup size="large">
				<Left type="select" data={[{ label: 'AUD $' }, { label: 'USD $' }, { label: 'EUR €' }]} />
				<Right type="button" data="Go" />
			</InputGroup>
			<br />

			<InputGroup size="large">
				<Right type="select" data={[{ label: 'AUD $' }, { label: 'USD $' }, { label: 'EUR €' }]} />
			</InputGroup>
			<br />

			<hr />

			<h2>XLarge size</h2>
			<InputGroup size="xlarge">
				<Left type="label" data="AUS $" />
			</InputGroup>
			<br />

			<InputGroup size="xlarge">
				<Right type="button" data="Go" />
			</InputGroup>
			<br />

			<InputGroup size="xlarge">
				<Left type="label" data="AUS $" />
				<Right type="button" data="Go" onClick={() => console.log('Go clicked')} />
			</InputGroup>
			<br />

			<InputGroup size="xlarge">
				<Left type="select" data={[{ label: 'AUD $' }, { label: 'USD $' }, { label: 'EUR €' }]} />
				<Right type="button" data="Go" />
			</InputGroup>
			<br />

			<InputGroup size="xlarge">
				<Right type="select" data={[{ label: 'AUD $' }, { label: 'USD $' }, { label: 'EUR €' }]} />
			</InputGroup>
		</GEL>
	);
}

export default Example;
