/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Body } from '@westpac/body';

function Example({ brand }) {
	const overridesWithTokens = { ...brand };
	overridesWithTokens['@westpac/body'] = {
		css: {
			outline: '1px solid red',
		},
	};

	return (
		<GEL brand={overridesWithTokens}>
			<Body>
				<h2>Headings</h2>
				<h1>This is a h1 heading</h1>
				<h2>This is a h2 heading</h2>
				<h3>This is a h3 heading</h3>
				<h4>This is a h4 heading</h4>
				<h5>This is a h5 heading</h5>
				<h6>This is a h6 heading</h6>

				<hr />

				<h2>Paragraph with link, small, abbr, br, em, mark, del and ins</h2>
				<p>
					Lorem <small>ipsum dolor sit</small>, consectetur adipisicing elit. Aut id maxime amet.
					<br />
					Lorem <a href="#url">natus sapiente</a>. Sit totam omnis, asperiores modi consequuntur
					obcaecati.
					<br />
					Lorem <strong>incidunt harum</strong>, architecto similique magni ut officia, provident
					repellendus.
					<br />
					Lorem <em>Look at me I've been emphasised</em> Lorem ipsum dolor sit amet.
					<br />
					Lorem <abbr title="Explained">Abbr element</abbr> consectetur adipisicing elit. Aperiam
					reprehenderit, dolorum error perferendis. This element has been deleted and replaced with{' '}
					<del>this</del> <ins>that</ins>. But we would like to hi<mark>ghlight this state</mark>
					ment!
				</p>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias porro, laboriosam
					recusandae ex ipsum harum unde illum neque, dolorem eaque quam vero aliquam fuga commodi,
					fugit odio. Incidunt, veritatis, quod.
				</p>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsum obcaecati natus corporis
					earum ipsam maxime, temporibus possimus veritatis doloribus consectetur repudiandae
					beatae, exercitationem autem magnam qui quod provident repellat aliquam.
				</p>

				<hr />

				<h2>Blockquote</h2>
				<blockquote>
					<p>If you think good design is expensive, you should look at the cost of bad design.</p>
					<small>
						Ralf Speth <cite title="Source Title">CEO, Jaguar</cite>
					</small>
				</blockquote>

				<hr />

				<h2>Lists</h2>

				<h3>Unordered list</h3>
				<ul>
					<li>Unordered list item 1</li>
					<li>Unordered list item 2</li>
					<li>Unordered list item 3</li>
					<li>
						Unordered list item 4
						<ul>
							<li>Nested list item 1</li>
							<li>Nested list item 2</li>
							<li>Nested list item 3</li>
						</ul>
					</li>
					<li>Unordered list item 5</li>
					<li>Unordered list item 6</li>
				</ul>

				<h3>Ordered list</h3>
				<ol>
					<li>Ordered list item 1</li>
					<li>Ordered list item 2</li>
					<li>
						Ordered list item 3
						<ol>
							<li>Ordered list item 1</li>
							<li>Ordered list item 2</li>
							<li>Ordered list item 3</li>
							<li>Ordered list item 4</li>
						</ol>
					</li>
					<li>Ordered list item 4</li>
				</ol>

				<h3>Definition list</h3>
				<dl>
					<dt>Coffee</dt>
					<dd>Made from beans</dd>
					<dt>Tea</dt>
					<dd>Made from leafs</dd>
					<dt>Beer</dt>
					<dd>Made from barley, hops and yeast</dd>
					<dt>Wine</dt>
					<dd>Made from grapes</dd>
				</dl>

				<hr />

				<h2>Label</h2>
				<label>This is a default label</label>
			</Body>
		</GEL>
	);
}

export default Example;
