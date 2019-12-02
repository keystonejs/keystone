import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const NewContentIcon = props => (
	<Icon icon="NewContentIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M12.0708889,4 L4,4 L4,22 L20,22 L20,11.9291111 C20.7061453,11.828105 21.3782934,11.6217094 22,11.3263688 L22,22 C22,23.1045695 21.1045695,24 20,24 L4,24 C2.8954305,24 2,23.1045695 2,22 L2,4 C2,2.8954305 2.8954305,2 4,2 L12.6736312,2 C12.3782906,2.62170659 12.171895,3.2938547 12.0708889,4 Z M19,0 C21.7614286,0 24,2.23857143 24,5 C24,7.76142857 21.7614286,10 19,10 C16.2385714,10 14,7.76142857 14,5 C14,2.23857143 16.2385714,0 19,0 Z"
		/>
	</Icon>
);

NewContentIcon.defaultProps = {
	...defaultProps,
	label: 'New Content',
};
NewContentIcon.propTypes = propTypes;
