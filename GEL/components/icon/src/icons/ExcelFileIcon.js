import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const ExcelFileIcon = props => (
	<Icon icon="ExcelFileIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M4,0 L16,0 L22,6 L22,22 C22,23.1045695 21.1045695,24 20,24 L4,24 C2.8954305,24 2,23.1045695 2,22 L2,2 L2,2 C2,0.8954305 2.8954305,2.02906125e-16 4,0 L4,0 Z M4,2 L4,22 L20,22 L20,6 L16,6 L16,2 L4,2 Z M14.2810673,8 L17.5044473,8 L13.6414231,13.68275 L18,20 L14.6546379,20 L12,16.0955 L10.8053367,17.8535 L12.2485388,17.8535 L12.2485388,20 L6,20 L10.3593393,13.68275 L6.49555273,8 L9.71893266,8 L12,11.30525 L14.2810673,8 Z"
		/>
	</Icon>
);

ExcelFileIcon.defaultProps = {
	...defaultProps,
	label: 'Excel File',
};
ExcelFileIcon.propTypes = propTypes;
