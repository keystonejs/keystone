/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Button } from '@westpac/button';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<Button look="primary" disabled>
				Primary
			</Button>{' '}
			<Button look="hero" disabled>
				Hero
			</Button>{' '}
			<Button look="faint" disabled>
				Faint
			</Button>{' '}
			<Button look="link" disabled>
				Link
			</Button>
			<hr />
			<Button look="primary" soft disabled>
				Primary soft
			</Button>{' '}
			<Button look="hero" soft disabled>
				Hero soft
			</Button>{' '}
			<Button look="faint" soft disabled>
				Faint soft
			</Button>
		</GEL>
	);
}

export default Example;
