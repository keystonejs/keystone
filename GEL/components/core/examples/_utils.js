/** @jsx jsx */

import { jsx, useBrand } from '@westpac/core';
import { Cell, Grid } from '../src';

export const Code = ({ children }) => {
	const { COLORS, SPACING } = useBrand();

	return (
		<pre
			css={{
				boxSizing: 'border-box',
				width: '90%',
				overflow: 'auto',
				background: COLORS.background,
				padding: SPACING(2),
				border: `1px solid ${COLORS.border}`,
				marginTop: SPACING(4),
				tabSize: '2em',
				MozTabSize: '2em',
				OTabSize: '2em',
			}}
		>
			<code>{children}</code>
		</pre>
	);
};
