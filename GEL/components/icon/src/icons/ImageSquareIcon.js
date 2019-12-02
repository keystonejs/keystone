import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const ImageSquareIcon = props => (
	<Icon icon="ImageSquareIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M13.9767442,18.3255814 L16.5,14 L20,20 L14,20 L4,20 L9.5,11 L13.9767442,18.3255814 Z M24,2.4 L24,21.6 C24,22.9254834 23.1045695,24 22,24 L2,24 C0.8954305,24 -2.66453526e-15,22.9254834 -2.66453526e-15,21.6 L8.8817842e-16,2.4 C8.8817842e-16,1.0745166 0.8954305,3.6292676e-16 2,4.4408921e-16 L22,4.85281769e-15 C23.1045695,4.93398014e-15 24,1.0745166 24,2.4 Z M22,2 L2,2 L2,22 L22,22 L22,2 Z M15.5,10 C14.1192881,10 13,8.88071187 13,7.5 C13,6.11928813 14.1192881,5 15.5,5 C16.8807119,5 18,6.11928813 18,7.5 C18,8.88071187 16.8807119,10 15.5,10 Z"
		/>
	</Icon>
);

ImageSquareIcon.defaultProps = {
	...defaultProps,
	label: 'Image Square',
};
ImageSquareIcon.propTypes = propTypes;
