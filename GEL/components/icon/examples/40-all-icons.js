/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import * as components from '@westpac/icon';
import { Cell, Grid, Name } from './_util';
import { useState } from 'react';

// can't believe this works...
const icons = Object.keys(components);

const Search = props => (
	<input
		css={{
			border: 0,
			borderBottom: '3px solid #EBECF0',
			boxSizing: 'border-box',
			fontSize: 24,
			marginBottom: 24,
			outline: 0,
			paddingBottom: 12,
			paddingTop: 12,
			width: '100%',

			':focus': {
				borderBottomColor: '#C1C7D0',
			},
		}}
		{...props}
	/>
);

function Example({ brand }) {
	const [inputValue, setInputValue] = useState('');
	const filteredIcons = inputValue.length
		? icons.filter(p =>
				p
					.slice(0, p.length - 4)
					.toLowerCase()
					.includes(inputValue.toLowerCase())
		  )
		: icons;

	return (
		<GEL brand={brand}>
			<Search
				autoFocus
				onChange={e => setInputValue(e.target.value)}
				placeholder="Search..."
				type="search"
				value={inputValue}
			/>
			<Grid>
				{filteredIcons.map(icon => {
					const Icon = components[icon];
					return (
						<Cell key={icon}>
							<Icon />
							<Name>{icon}</Name>
						</Cell>
					);
				})}
			</Grid>
		</GEL>
	);
}

export default Example;
