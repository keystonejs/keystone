import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const WriteIcon = props => (
	<Icon icon="WriteIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M0,22 L24,22 L24,24 L0,24 L0,22 Z M2,15.0006943 L2,20 L6.99930565,20 L17.7439245,9.2553812 L12.7446188,4.25607555 L2,15.0006943 Z M21.6100542,5.38925149 C22.1299819,4.86932371 22.1299819,4.02944036 21.6100542,3.50951257 L18.4904874,0.389945841 C17.9705596,-0.129981947 17.1306763,-0.129981947 16.6107485,0.389945841 L14.1710873,2.829607 L19.170393,7.82891265 L21.6100542,5.38925149 Z"
		/>
	</Icon>
);

WriteIcon.defaultProps = {
	...defaultProps,
	label: 'Write',
};
WriteIcon.propTypes = propTypes;
