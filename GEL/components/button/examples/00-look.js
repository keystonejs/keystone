/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Button } from '@westpac/button';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Default instance (no styling props)</h2>
			<Button>Default</Button>
			<hr />
			<h2>Standard</h2>
			<Button look="primary">Primary standard</Button> <Button look="hero">Hero standard</Button>{' '}
			<Button look="faint">Faint standard</Button> <Button look="link">Link</Button>
			<hr />
			<h2>Soft</h2>
			<Button look="primary" soft>
				Primary soft
			</Button>{' '}
			<Button look="hero" soft>
				Hero soft
			</Button>{' '}
			<Button look="faint" soft>
				Faint soft
			</Button>
			<hr />
			<h2>Text button within text</h2>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipisicing elit. In, eius temporibus consectetur
				officia cum reiciendis autem incidunt aperiam similique, pariatur, ducimus quibusdam.
				Nesciunt consequuntur, ipsum. Id aperiam deleniti dolores sunt. Lorem ipsum dolor sit amet,
				consectetur adipisicing elit. <Button look="link">Provident</Button>, dolorem ab dicta
				maiores soluta recusandae, ad quidem odio qui culpa quam esse quia cupiditate ex architecto
				enim pariatur quis porro. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eaque
				corporis soluta aliquam, ut adipisci dicta fugiat dignissimos veritatis dolor. Praesentium
				neque totam quaerat at possimus culpa laborum, ad repellendus et!
			</p>
		</GEL>
	);
}

export default Example;
