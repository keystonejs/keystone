/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Panel, Header, Body, Footer } from '@westpac/panel';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Default instance (no styling props)</h2>
			<Panel>
				<Header>Panel title</Header>
				<Body>
					Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempora officiis officia omnis
					aperiam voluptate suscipit, laudantium praesentium quas consequatur placeat, perferendis
					eligendi saepe in unde sequi dolores excepturi doloremque autem! Lorem ipsum dolor sit
					amet, consectetur adipisicing elit.
				</Body>
				<Footer>Panel footer</Footer>
			</Panel>

			<hr />

			<h2>Hero</h2>
			<Panel appearance="hero">
				<Header>Panel title</Header>
				<Body>
					Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempora officiis officia omnis
					aperiam voluptate suscipit, laudantium praesentium quas consequatur placeat, perferendis
					eligendi saepe in unde sequi dolores excepturi doloremque autem! Lorem ipsum dolor sit
					amet, consectetur adipisicing elit. Fuga quis perferendis, optio inventore natus nihil,
					qui laboriosam nostrum esse hic facilis cum corporis libero? Porro veritatis inventore
					dignissimos laborum minima. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
					Similique quidem nesciunt rerum sequi soluta consectetur porro rem eos ipsum debitis!
					Laboriosam aliquid, adipisci vel facere eveniet doloremque iusto ea iste. Lorem ipsum
					dolor sit amet, consectetur adipisicing elit. Hic debitis quae eum eveniet ducimus vero
					odit, officia consequatur vel repellat recusandae labore sed tempora reprehenderit minus
					incidunt deserunt voluptate ad.
				</Body>
				<Footer>Panel footer</Footer>
			</Panel>

			<hr />

			<h2>Faint</h2>
			<Panel appearance="faint">
				<Header>Panel title</Header>
				<Body>
					Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempora officiis officia omnis
					aperiam voluptate suscipit, laudantium praesentium quas consequatur placeat, perferendis
					eligendi saepe in unde sequi dolores excepturi doloremque autem! Lorem ipsum dolor sit
					amet, consectetur adipisicing elit. Fuga quis perferendis, optio inventore natus nihil,
					qui laboriosam nostrum esse hic facilis cum corporis libero? Porro veritatis inventore
					dignissimos laborum minima. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
					Similique quidem nesciunt rerum sequi soluta consectetur porro rem eos ipsum debitis!
					Laboriosam aliquid, adipisci vel facere eveniet doloremque iusto ea iste. Lorem ipsum
					dolor sit amet, consectetur adipisicing elit. Hic debitis quae eum eveniet ducimus vero
					odit, officia consequatur vel repellat recusandae labore sed tempora reprehenderit minus
					incidunt deserunt voluptate ad.
				</Body>
				<Footer>Panel footer</Footer>
			</Panel>
		</GEL>
	);
}

export default Example;
