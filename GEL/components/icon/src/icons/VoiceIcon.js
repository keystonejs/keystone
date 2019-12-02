import React from 'react';
import { propTypes, defaultProps, Icon } from '../Icon';

export const VoiceIcon = props => (
	<Icon icon="VoiceIcon" {...props}>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M10,19.7769836 C6.30831435,18.9392957 3.47856125,15.8322384 3.05492878,12 L5.07088886,12 C5.55611852,15.3922941 8.47352809,18 12,18 C15.5264719,18 18.4438815,15.3922941 18.9291111,12 L20.9450712,12 C20.5214388,15.8322384 17.6916857,18.9392957 14,19.7769836 L14,24 L10,24 L10,19.7769836 Z M16,4 L16,11 C16,13.209139 14.209139,15 12,15 C9.790861,15 8,13.209139 8,11 L8,4 C8,1.790861 9.790861,0 12,0 C14.209139,0 16,1.790861 16,4 Z"
		/>
	</Icon>
);

VoiceIcon.defaultProps = {
	...defaultProps,
	label: 'Voice',
};
VoiceIcon.propTypes = propTypes;
