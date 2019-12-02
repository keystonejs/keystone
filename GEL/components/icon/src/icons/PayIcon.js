import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const PayIcon = props => (
	<Icon icon="PayIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M12,14 L4,22 L4,18 L0,18 L0,10 L4,10 L4,6 L12,14 Z M14.8269987,14.0014284 C14.8856891,14.0004762 14.9433762,14 15,14 C18.00375,14 24,15.34 24,18 L24,22 L6.82842712,22 L14.8269987,14.0014284 L14.8269987,14.0014284 Z M20,7 C20,9.7625 17.7625,12 15,12 C12.2375,12 10,9.7625 10,7 C10,4.2375 12.2375,2 15,2 C17.7625,2 20,4.2375 20,7 Z"
		/>
	</Icon>
);

PayIcon.defaultProps = {
	...defaultProps,
	label: 'Pay',
};
PayIcon.propTypes = propTypes;
