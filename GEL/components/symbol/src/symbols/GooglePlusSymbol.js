import React from 'react';
import { propTypes, defaultProps, Symbol } from '../Symbol';

export const GooglePlusSymbol = props => (
	<Symbol {...props}>
		<g fill="none" fillRule="evenodd">
			<rect fill="#DC4E41" fillRule="nonzero" width="32" height="32" rx="2" />
			<path
				d="M12 15v2.4h3.97c-.16 1.03-1.2 3.02-3.97 3.02-2.39 0-4.34-1.98-4.34-4.42s1.95-4.42 4.34-4.42c1.36 0 2.27.58 2.79 1.08l1.9-1.83C15.47 9.69 13.89 9 12 9c-3.87 0-7 3.13-7 7s3.13 7 7 7c4.04 0 6.72-2.84 6.72-6.84 0-.46-.05-.81-.11-1.16H12z"
				fill="#FFF"
			/>
			<path
				d="M12 15.12h6.61c.07.33.11.68.11 1.1v-.07c0-.46-.05-.81-.11-1.16H12v.13zm0-6c1.85 0 3.41.67 4.61 1.77l.07-.07C15.47 9.69 13.89 9 12 9c-3.87 0-7 3.13-7 7v.06c.04-3.83 3.16-6.94 7-6.94zm0 11.42c2.77 0 3.81-1.98 3.97-3.02h-.03c-.22 1.06-1.27 2.89-3.94 2.89-2.37 0-4.3-1.95-4.33-4.35 0 .02-.01.04-.01.06 0 2.44 1.95 4.42 4.34 4.42z"
				fill="#FFF"
				opacity=".4"
			/>
			<g fill="#3E2723" opacity=".1">
				<path d="M12 11.58c-2.39 0-4.34 1.98-4.34 4.42 0 .02.01.04.01.06.03-2.41 1.96-4.35 4.33-4.35 1.36 0 2.27.58 2.79 1.08l1.9-1.83c-.02-.02-.05-.04-.07-.06l-1.83 1.77c-.52-.5-1.43-1.09-2.79-1.09zm0 5.82v.12h3.94c.01-.04.02-.09.03-.12H12z" />
				<path d="M12 23c-3.84 0-6.96-3.1-7-6.94v.06c0 3.87 3.13 7 7 7 4.04 0 6.72-2.84 6.72-6.84v-.06C18.69 20.19 16.02 23 12 23z" />
			</g>
			<path fill="#FFF" d="M27 15h-2v-2h-2v2h-2v2h2v2h2v-2h2" />
			<path d="M25 15h2v.12h-2V15zm-2-2h2v.12h-2V13zm-2 2h2v.12h-2V15z" fill="#FFF" opacity=".4" />
			<path
				d="M21 17h2v.12h-2V17zm4 0h2v.12h-2V17zm-2 2h2v.12h-2V19z"
				fill="#3E2723"
				opacity=".1"
			/>
		</g>
	</Symbol>
);

GooglePlusSymbol.defaultProps = {
	...defaultProps,
	viewBoxWidth: 32,
	viewBoxHeight: 32,
	label: 'Google+',
};
GooglePlusSymbol.propTypes = propTypes;
