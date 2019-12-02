/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import {
	MastercardAcceptedSymbol,
	BPayLandSymbol,
	AppleStoreSymbol,
	WBCLogo,
	STGLogo,
} from '@westpac/symbol';
import { Cell, Grid, Name } from './_utils';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<Grid>
				<Cell>
					<MastercardAcceptedSymbol />
					<Name>MastercardAcceptedSymbol</Name>
				</Cell>
				<Cell>
					<BPayLandSymbol />
					<Name>BPayLandSymbol</Name>
				</Cell>
				<Cell>
					<AppleStoreSymbol />
					<Name>AppleStoreSymbol</Name>
				</Cell>
				<Cell>
					<WBCLogo />
					<Name>WBCLogo</Name>
				</Cell>
				<Cell>
					<STGLogo />
					<Name>STGLogo</Name>
				</Cell>
			</Grid>
		</GEL>
	);
}

export default Example;
