/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Button } from '@westpac/button';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<p>
				Active state styling is provided with a <code>:active</code> pseudo-class. The following
				examples have been programatically forced via use of an <code>active</code> class.
			</p>
			<h2>
				Active buttons with a <code>&lt;button&gt;</code> tag
			</h2>
			<h3>Standard</h3>
			<Button look="primary">Primary default</Button> <Button look="hero">Hero default</Button>{' '}
			<Button look="faint">Faint default</Button>
			<br />
			<br />
			<Button look="primary" className="active">
				Primary active
			</Button>{' '}
			<Button look="hero" className="active">
				Hero active
			</Button>{' '}
			<Button look="faint" className="active">
				Faint active
			</Button>
			<h3>Soft</h3>
			<Button look="primary" soft>
				Primary soft default
			</Button>{' '}
			<Button look="hero" soft>
				Hero soft default
			</Button>{' '}
			<Button look="faint" soft>
				Faint soft default
			</Button>
			<br />
			<br />
			<Button look="primary" className="active" soft>
				Primary soft active
			</Button>{' '}
			<Button look="hero" className="active" soft>
				Hero soft active
			</Button>{' '}
			<Button look="faint" className="active" soft>
				Faint soft active
			</Button>
			<hr />
			<h2>
				Active buttons with an <code>&lt;a&gt;</code> tag
			</h2>
			<h3>Standard</h3>
			<Button href="#0" look="primary">
				Primary default
			</Button>{' '}
			<Button href="#0" look="hero">
				Hero default
			</Button>{' '}
			<Button href="#0" look="faint">
				Faint default
			</Button>
			<br />
			<br />
			<Button href="#0" look="primary" className="active">
				Primary active
			</Button>{' '}
			<Button href="#0" look="hero" className="active">
				Hero active
			</Button>{' '}
			<Button href="#0" look="faint" className="active">
				Faint active
			</Button>
			<h3>Soft</h3>
			<Button href="#0" look="primary" soft>
				Primary soft default
			</Button>{' '}
			<Button href="#0" look="hero" soft>
				Hero soft default
			</Button>{' '}
			<Button href="#0" look="faint" soft>
				Faint soft default
			</Button>
			<br />
			<br />
			<Button href="#0" look="primary" className="active" soft>
				Primary soft active
			</Button>{' '}
			<Button href="#0" look="hero" className="active" soft>
				Hero soft active
			</Button>{' '}
			<Button href="#0" look="faint" className="active" soft>
				Faint soft active
			</Button>
		</GEL>
	);
}

export default Example;
