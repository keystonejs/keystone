/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Button } from '@westpac/button';

function Example({ brand }) {
	const Link = ({ children, ...rest }) => <span {...rest}>{children}</span>;

	return (
		<GEL brand={brand}>
			<h2>
				Button with an <code>&lt;a&gt;</code> tag
			</h2>
			<Button href="#0">Link</Button>{' '}
			<Button href="#0" look="link">
				Link
			</Button>
			<hr />
			<h2>
				Button with a <code>&lt;button&gt;</code> tag
			</h2>
			<Button type="button">Button</Button> <Button type="reset">Reset</Button>{' '}
			<Button type="submit">Submit</Button>
			<hr />
			<h2>
				Button with an <code>&lt;input&gt;</code> tag
			</h2>
			<Button tag="input" type="button" value="Button" />{' '}
			<Button tag="input" type="reset" value="Reset" />{' '}
			<Button tag="input" type="submit" value="Submit" />
			<hr />
			<h2>
				Button with an <code>&lt;Link&gt;</code> tag
			</h2>
			<Button tag={Link} to="path/to/thing" value="Button">
				Nav
			</Button>
		</GEL>
	);
}

export default Example;
