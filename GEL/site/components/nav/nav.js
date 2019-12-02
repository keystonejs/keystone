/** @jsx jsx */
import { jsx } from '@westpac/core';
import Link from 'next/link';

function LinkItem({ name, path }) {
	return (
		<li>
			<Link href={path}>
				<a>{name}</a>
			</Link>
		</li>
	);
}

const Nav = ({ components = [] }) => (
	<ul>
		<LinkItem name="Welcome!" path="/" />
		{components.map(component => (
			<LinkItem name={component.name} path={`/components/${component.name}`} />
		))}
	</ul>
);

export default Nav;
