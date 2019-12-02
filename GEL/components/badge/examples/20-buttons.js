/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Button } from '@westpac/button';
import { Badge } from '@westpac/badge';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Default button instance (no styling props)</h2>
			<p>
				<Button>
					Default <Badge value="Default" />
				</Button>
			</p>

			<hr />

			<h2>Button looks</h2>

			<h3>Primary</h3>
			<p>
				<Button look="primary">
					Primary <Badge value="Default" />
				</Button>
			</p>
			<p>
				<Button look="primary">
					Primary <Badge look="primary" value="Primary" />
				</Button>{' '}
				<Button look="primary">
					Primary <Badge look="hero" value="Hero" />
				</Button>{' '}
				<Button look="primary">
					Primary <Badge look="neutral" value="Neutral" />
				</Button>{' '}
				<Button look="primary">
					Primary <Badge look="faint" value="Faint" />
				</Button>
			</p>
			<p>
				<Button look="primary">
					Primary <Badge look="success" value="Success" />
				</Button>{' '}
				<Button look="primary">
					Primary <Badge look="info" value="Info" />
				</Button>{' '}
				<Button look="primary">
					Primary <Badge look="warning" value="Warning" />
				</Button>{' '}
				<Button look="primary">
					Primary <Badge look="danger" value="Danger" />
				</Button>
			</p>
			<p>
				<Button look="primary" soft>
					Primary soft <Badge value="Default" />
				</Button>
			</p>
			<p>
				<Button look="primary" soft>
					Primary soft <Badge look="primary" value="Primary" />
				</Button>{' '}
				<Button look="primary" soft>
					Primary soft <Badge look="hero" value="Hero" />
				</Button>{' '}
				<Button look="primary" soft>
					Primary soft <Badge look="neutral" value="Neutral" />
				</Button>{' '}
				<Button look="primary" soft>
					Primary soft <Badge look="faint" value="Faint" />
				</Button>
			</p>
			<p>
				<Button look="primary" soft>
					Primary soft <Badge look="success" value="Success" />
				</Button>{' '}
				<Button look="primary" soft>
					Primary soft <Badge look="info" value="Info" />
				</Button>{' '}
				<Button look="primary" soft>
					Primary soft <Badge look="warning" value="Warning" />
				</Button>{' '}
				<Button look="primary" soft>
					Primary soft <Badge look="danger" value="Danger" />
				</Button>
			</p>

			<h3>Hero</h3>
			<p>
				<Button look="hero">
					Hero <Badge value="Default" />
				</Button>
			</p>
			<p>
				<Button look="hero">
					Hero <Badge look="primary" value="Primary" />
				</Button>{' '}
				<Button look="hero">
					Hero <Badge look="hero" value="Hero" />
				</Button>{' '}
				<Button look="hero">
					Hero <Badge look="neutral" value="Neutral" />
				</Button>{' '}
				<Button look="hero">
					Hero <Badge look="faint" value="Faint" />
				</Button>
			</p>
			<p>
				<Button look="hero">
					Hero <Badge look="success" value="Success" />
				</Button>{' '}
				<Button look="hero">
					Hero <Badge look="info" value="Info" />
				</Button>{' '}
				<Button look="hero">
					Hero <Badge look="warning" value="Warning" />
				</Button>{' '}
				<Button look="hero">
					Hero <Badge look="danger" value="Danger" />
				</Button>
			</p>
			<p>
				<Button look="hero" soft>
					Hero soft <Badge value="Default" />
				</Button>
			</p>
			<p>
				<Button look="hero" soft>
					Hero soft <Badge look="primary" value="Primary" />
				</Button>{' '}
				<Button look="hero" soft>
					Hero soft <Badge look="hero" value="Hero" />
				</Button>{' '}
				<Button look="hero" soft>
					Hero soft <Badge look="neutral" value="Neutral" />
				</Button>{' '}
				<Button look="hero" soft>
					Hero soft <Badge look="faint" value="Faint" />
				</Button>
			</p>
			<p>
				<Button look="hero" soft>
					Hero soft <Badge look="success" value="Success" />
				</Button>{' '}
				<Button look="hero" soft>
					Hero soft <Badge look="info" value="Info" />
				</Button>{' '}
				<Button look="hero" soft>
					Hero soft <Badge look="warning" value="Warning" />
				</Button>{' '}
				<Button look="hero" soft>
					Hero soft <Badge look="danger" value="Danger" />
				</Button>
			</p>

			<h3>Faint</h3>
			<p>
				<Button look="faint">
					Faint <Badge value="Default" />
				</Button>
			</p>
			<p>
				<Button look="faint">
					Faint <Badge look="primary" value="Primary" />
				</Button>{' '}
				<Button look="faint">
					Faint <Badge look="hero" value="Hero" />
				</Button>{' '}
				<Button look="faint">
					Faint <Badge look="neutral" value="Neutral" />
				</Button>{' '}
				<Button look="faint">
					Faint <Badge look="faint" value="Faint" />
				</Button>
			</p>
			<p>
				<Button look="faint">
					Faint <Badge look="success" value="Success" />
				</Button>{' '}
				<Button look="faint">
					Faint <Badge look="info" value="Info" />
				</Button>{' '}
				<Button look="faint">
					Faint <Badge look="warning" value="Warning" />
				</Button>{' '}
				<Button look="faint">
					Faint <Badge look="danger" value="Danger" />
				</Button>
			</p>
			<p>
				<Button look="faint" soft>
					Faint soft <Badge value="Default" />
				</Button>
			</p>
			<p>
				<Button look="faint" soft>
					Faint soft <Badge look="primary" value="Primary" />
				</Button>{' '}
				<Button look="faint" soft>
					Faint soft <Badge look="hero" value="Hero" />
				</Button>{' '}
				<Button look="faint" soft>
					Faint soft <Badge look="neutral" value="Neutral" />
				</Button>{' '}
				<Button look="faint" soft>
					Faint soft <Badge look="faint" value="Faint" />
				</Button>
			</p>
			<p>
				<Button look="faint" soft>
					Faint soft <Badge look="success" value="Success" />
				</Button>{' '}
				<Button look="faint" soft>
					Faint soft <Badge look="info" value="Info" />
				</Button>{' '}
				<Button look="faint" soft>
					Faint soft <Badge look="warning" value="Warning" />
				</Button>{' '}
				<Button look="faint" soft>
					Faint soft <Badge look="danger" value="Danger" />
				</Button>
			</p>
		</GEL>
	);
}

export default Example;
