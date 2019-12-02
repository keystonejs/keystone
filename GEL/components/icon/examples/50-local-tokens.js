/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import {
	AddIcon,
	CalendarIcon,
	DeleteIcon,
	GridIcon,
	HelpIcon,
	MessageIcon,
	StarIcon,
	WriteIcon,
} from '@westpac/icon';
import { Row } from './_util';

const Wrapper = ({ children, icon, ...rest }) => (
	<div>
		{children}
		name: <span css={{}}>{icon}</span>
	</div>
);

function Example({ brand }) {
	const overridesWithTokens = { ...brand };
	overridesWithTokens['@westpac/icon'] = {
		Wrapper,
	};

	return (
		<GEL brand={overridesWithTokens}>
			<h2>With overrides applied</h2>
			<Row>
				<AddIcon />
				<CalendarIcon />
				<DeleteIcon />
				<GridIcon />
				<HelpIcon />
				<MessageIcon />
				<StarIcon />
				<WriteIcon />
			</Row>
		</GEL>
	);
}

export default Example;
