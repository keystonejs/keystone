import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const InvestIcon = props => (
	<Icon icon="InvestIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M18,24 L22,24 L22,10 L18,10 L18,24 Z M10,24 L14,24 L14,16 L10,16 L10,24 Z M2,24 L6,24 L6,14 L2,14 L2,24 Z M21.7309981,3.73099809 L12.2500311,13.4994066 L5.63133825,6.8807138 L0,12.512052 L8.8817842e-16,9.68362492 L5.63133825,4.05228667 L12.2287557,10.6497041 L20.3166269,2.31662686 L18,3.99680289e-15 L24,0 L24,6 L21.7309981,3.73099809 L21.7309981,3.73099809 Z"
		/>
	</Icon>
);

InvestIcon.defaultProps = {
	...defaultProps,
	label: 'Invest',
};
InvestIcon.propTypes = propTypes;
