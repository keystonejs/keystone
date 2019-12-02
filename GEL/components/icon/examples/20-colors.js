/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { FavouriteIcon } from '@westpac/icon';
import { Row } from './_util';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<Row>
				<FavouriteIcon label="Colored heart" color="#DE350B" />
				<FavouriteIcon label="Colored heart" color="#FF991F" />
				<FavouriteIcon label="Colored heart" color="#00875A" />
				<FavouriteIcon label="Colored heart" color="#00A3BF" />
				<FavouriteIcon label="Colored heart" color="#0052CC" />
				<FavouriteIcon label="Colored heart" color="#5243AA" />
			</Row>
		</GEL>
	);
}

export default Example;
