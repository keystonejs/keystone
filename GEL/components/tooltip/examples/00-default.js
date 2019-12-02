/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Tooltip } from '@westpac/tooltip';
import { Button } from '@westpac/button';
import { InfoIcon } from '@westpac/icon';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h3>In text</h3>
			<p>
				This is a <Tooltip text="This is a tooltip">random</Tooltip> sentence.
			</p>
			<Tooltip text="This is another tooltip">
				<p>
					Tooltip as a div block elements... Lorem ipsum dolor sit amet, consectetur adipisicing
					elit. Enim adipisci laboriosam unde dolore, maxime quae amet praesentium minus sit! Cumque
					repudiandae laboriosam sit ipsum eaque cupiditate temporibus, necessitatibus consectetur
					debitis. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam itaque sunt hic
					enim earum explicabo.
				</p>
			</Tooltip>
			<h3>On icons</h3>
			<Tooltip text="Some text to explain this icon">
				<InfoIcon />
			</Tooltip>
			<h3>On Buttons</h3>
			<Tooltip text="This is another very long tooltip to see what happens with long tooltips">
				<Button appearance="hero">Tooltip as a button</Button>
			</Tooltip>
		</GEL>
	);
}

export default Example;
