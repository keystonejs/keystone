/** @jsx jsx */
import React, { Fragment } from 'react';
import { jsx } from '@westpac/core';
import { Text } from '@westpac/text-input';

import LogList from './log-list';

function Changelog({ data }) {
	const [range, updateRange] = React.useState('');

	const handleChange = event => {
		updateRange(event.target.value);
	};

	return (
		<Fragment>
			<div css={{ maxWidth: 320 }}>
				<Text
					onChange={handleChange}
					placeholder={'Semver Range: e.g. "> 1.0.6 <= 3.0.2"'}
					value={range}
				/>
			</div>
			<LogList changelog={data} range={range} />
		</Fragment>
	);
}

export default Changelog;
