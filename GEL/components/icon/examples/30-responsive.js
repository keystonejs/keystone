/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Fragment, useState } from 'react';
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

const sizes = [
	['small', 'medium', 'large', 'xlarge'],
	['large', 'medium'],
	['small', null, 'large'],
];

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

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Size</h2>
			{sizes.map((s, i) => (
				<Fragment key={i}>
					<h3>[{s.map(v => String(v)).join(', ')}]</h3>
					<Row style={{ gridGap: (i + 1) * 4, marginBottom: '2em' }}>
						{icons.map((I, x) => (
							<I key={x} size={s} />
						))}
					</Row>
				</Fragment>
			))}
		</GEL>
	);
}

export default Example;
