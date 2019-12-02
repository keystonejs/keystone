/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { useState } from 'react';
import {
	AddIcon,
	CalendarIcon,
	DeleteIcon,
	FavouriteIcon,
	GridIcon,
	HelpIcon,
	MessageIcon,
	NotificationOffIcon,
	PersonIcon,
	ProgressIcon,
	StarIcon,
	WriteIcon,
} from '@westpac/icon';
import { Row } from './_util';

const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'];
const icons = [
	AddIcon,
	CalendarIcon,
	DeleteIcon,
	FavouriteIcon,
	GridIcon,
	HelpIcon,
	MessageIcon,
	NotificationOffIcon,
	PersonIcon,
	ProgressIcon,
	StarIcon,
	WriteIcon,
];

const Button = ({ children, isActive, ...props }) => (
	<label
		css={{
			backgroundColor: isActive ? '#344563' : '#EBECF0',
			borderRadius: 4,
			border: 0,
			color: isActive ? 'white' : '#344563',
			cursor: 'pointer',
			display: 'inline-block',
			fontSize: 12,
			padding: '0.4rem 0.8rem',
		}}
		{...props}
	>
		<input
			autoFocus={isActive}
			type="radio"
			defaultChecked={isActive}
			name="size"
			css={{ position: 'absolute', height: 1, width: 1, opacity: 0.001 }}
		/>
		{children}
	</label>
);

function Example({ brand }) {
	const [activeSize, setSize] = useState(2);

	return (
		<GEL brand={brand}>
			<Row>
				{sizes.map((s, i) => (
					<Button key={s} onClick={() => setSize(i)} isActive={i === activeSize}>
						{s}
					</Button>
				))}
			</Row>
			<Row style={{ gridGap: (activeSize + 1) * 4, marginTop: '2em' }}>
				{icons.map((I, i) => (
					<I key={i} size={sizes[activeSize]} />
				))}
			</Row>
		</GEL>
	);
}

export default Example;
