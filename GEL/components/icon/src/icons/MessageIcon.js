import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const MessageIcon = props => (
	<Icon icon="MessageIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M10.5,15.633 L19.725,18.97725 L24,0 L10.5,15.633 Z M0,11.99925 L7.49925,14.5845 L24,0 L0,11.99925 Z M10.5,23.25 L14.853,18.82875 L10.5,17.24925 L10.5,23.25 Z"
		/>
	</Icon>
);

MessageIcon.defaultProps = {
	...defaultProps,
	label: 'Message',
};
MessageIcon.propTypes = propTypes;
