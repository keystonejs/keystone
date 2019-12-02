/** @jsx jsx */

import { jsx } from '@westpac/core';

export const Row = props => (
	<div
		css={{
			alignItems: 'start',
			display: 'flex',
			marginBottom: '1em',
		}}
		{...props}
	/>
);
