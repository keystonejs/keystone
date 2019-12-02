/** @jsx jsx */

import { jsx } from '@westpac/core';

export const Box = props => (
	<div
		css={{
			alignItems: 'center',
			display: 'flex',
		}}
		{...props}
	/>
);
