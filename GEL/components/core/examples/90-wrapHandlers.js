/** @jsx jsx */

import { GEL, jsx, wrapHandlers } from '@westpac/core';
import { Code } from './_utils';

function one() {
	console.log('one called!');
}
function two() {
	console.log('two called!');
}
function three() {
	console.log('three called!');
}
function four(event) {
	event.preventDefault();
	console.log('This should not be called');
}

function Example({ brand }) {
	wrapHandlers(one, two)({});

	return (
		<GEL brand={brand}>
			<Code>
				{`function one() {
	console.log('one called!')
}

function two() {
	console.log('two called!')
}

wrapHandlers( one, two );`}
			</Code>
			=>
			<Code>> one called! > two called!</Code>
			<hr />
			<button onClick={wrapHandlers(three, () => console.log('button clicked'))} type="button">
				Click me!
			</button>
			<hr />
			<button onClick={wrapHandlers(four, () => console.log('button clicked again'))} type="button">
				Click me!
			</button>
		</GEL>
	);
}

export default Example;
