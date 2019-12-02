import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const FutureClockIcon = props => (
	<Icon icon="FutureClockIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M24,12 L20,16.5 L16,12 L19,12 C19,7.30557963 15.1944204,3.5 10.5,3.5 C5.80557963,3.5 2,7.30557963 2,12 C2,16.6944204 5.80557963,20.5 10.5,20.5 C12.5701131,20.5 14.4673847,19.7599774 15.9417031,18.5300437 L17.2221038,20.0665245 C15.4008869,21.5858544 13.0571985,22.5 10.5,22.5 C4.70101013,22.5 0,17.7989899 0,12 C0,6.20101013 4.70101013,1.5 10.5,1.5 C16.2989899,1.5 21,6.20101013 21,12 L24,12 Z M11.0012419,12.8457833 L15.1999998,15.268433 L14.1993789,17.0004838 L9,14 L9,6 L11.0012419,6 L11.0012419,12.8457833 Z"
		/>
	</Icon>
);

FutureClockIcon.defaultProps = {
	...defaultProps,
	label: 'Future Clock',
};
FutureClockIcon.propTypes = propTypes;
