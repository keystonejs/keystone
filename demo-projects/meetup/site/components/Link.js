import React from 'react';
import NextLink from 'next/link';


const Link = React.forwardRef(({ to, as, ...props }, ref) => (
	<NextLink href={to} as={as}>
		<a ref={ref} {...props} />
	</NextLink>
));

export default Link;