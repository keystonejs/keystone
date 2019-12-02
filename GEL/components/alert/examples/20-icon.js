/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { HelpIcon } from '@westpac/icon';
import { Alert } from '@westpac/alert';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Custom icon</h2>
			<Alert look="info" icon={HelpIcon}>
				<strong>Heads up!</strong> This alert needs your attention, but it’s not super important. Oh
				wow look, I have a custom icon. <a href="#">Link</a>
			</Alert>

			<hr />

			<h2>No icon</h2>
			<Alert look="info" icon={null}>
				<strong>Heads up!</strong> This alert needs your attention, but it’s not super important. Oh
				wow look, I have no icon. <a href="#">Link</a>
			</Alert>
		</GEL>
	);
}

export default Example;
