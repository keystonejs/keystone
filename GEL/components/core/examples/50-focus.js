/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Button } from '@westpac/button';
import { Text, Textarea, Select } from '@westpac/text-input';
import { Body } from '@westpac/body';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Focus test</h2>

			<Body>
				<h3>Expected behaviour</h3>
				<p>
					Keyboard users will see a visible outline when tabbing to focusable elements. <br />
					Mouse users will not see a visible outline when clicking on all focusable elements except
					text input elements (text input, select and textarea).
				</p>
				<p>
					Learn more about{' '}
					<a
						href="https://medium.com/@wilkowskidom/how-i-learned-to-stop-worrying-and-love-the-outline-7a35b3b49e7"
						target="_blank"
					>
						How we handle focus
					</a>
					.
				</p>
			</Body>

			<hr />

			<Body>
				<p>
					<a href="#0">This is a link</a>
				</p>
			</Body>

			<Button>Button as a &lt;button&gt;</Button>
			<br />
			<br />
			<Button href="#0">Button as an &lt;a&gt;</Button>
			<br />
			<br />
			<Body>
				<Button>Button as a &lt;button&gt; and child of Body</Button>
				<br />
				<br />
				<Button href="#0">Button as an &lt;a&gt; and child of Body</Button>
			</Body>

			<hr />

			<p>Note: All users should see our focus outline styling; not just keyboard users.</p>
			<Text />
			<br />
			<Select>
				<option>Select</option>
			</Select>
			<br />
			<Textarea />

			<hr />

			<Body>
				<p>Note: The following headings should show focus outline styling when keyboard tabbing.</p>
				<h1 tabIndex="0">This is a h1 heading</h1>
				<h2 tabIndex="0">This is a h2 heading</h2>
				<h3 tabIndex="0">This is a h3 heading</h3>
				<h4 tabIndex="0">This is a h4 heading</h4>
				<h5 tabIndex="0">This is a h5 heading</h5>
				<h6 tabIndex="0">This is a h6 heading</h6>
			</Body>
		</GEL>
	);
}

export default Example;
