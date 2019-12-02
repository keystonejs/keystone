import React from 'react';
import { propTypes, defaultProps, Symbol } from '../Symbol';

export const YouTubeSymbol = props => (
	<Symbol {...props}>
		<defs>
			<linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="YouTubeSymbol">
				<stop stopColor="#E52D27" offset="0%" />
				<stop stopColor="#B31217" offset="100%" />
			</linearGradient>
		</defs>
		<g fill="none" fillRule="evenodd">
			<rect fill="url(#YouTubeSymbol)" width="32" height="32" rx="2" />
			<path fillOpacity=".25" fill="#000" d="M13.5 12.5l6 4.5.5-1" />
			<path
				d="M15.995 7.5h.01s5.038 0 8.397.244c.47.057 1.492.062 2.404 1.024.72.733.954 2.398.954 2.398s.24 1.956.24 3.91v1.835c0 1.956-.24 3.91-.24 3.91s-.234 1.667-.954 2.4c-.912.962-1.935.967-2.404 1.023-3.36.245-8.402.253-8.402.253s-6.24-.058-8.16-.243c-.534-.1-1.733-.07-2.646-1.033-.72-.733-.954-2.4-.954-2.4S4 18.867 4 16.91v-1.833c0-1.955.24-3.91.24-3.91s.234-1.666.954-2.4c.913-.96 1.935-.966 2.404-1.023 3.36-.244 8.397-.244 8.397-.244zm-2.495 5v7L20 16l-6.5-3.5z"
				fill="#FFF"
			/>
		</g>
	</Symbol>
);

YouTubeSymbol.defaultProps = {
	...defaultProps,
	viewBoxWidth: 32,
	viewBoxHeight: 32,
	label: 'YouTube',
};
YouTubeSymbol.propTypes = propTypes;
