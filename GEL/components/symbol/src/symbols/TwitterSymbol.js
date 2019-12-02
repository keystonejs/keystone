import React from 'react';
import { propTypes, defaultProps, Symbol } from '../Symbol';

export const TwitterSymbol = props => (
	<Symbol {...props}>
		<g fillRule="nonzero" fill="none">
			<rect fill="#0BABE3" width="32" height="32" rx="2" />
			<path
				d="M26.7 9.5c-.8.338-1.64.573-2.5.7.916-.53 1.596-1.387 1.9-2.4-.862.528-1.81.9-2.8 1.1-.81-.914-1.98-1.425-3.2-1.4-2.42.022-4.378 1.98-4.4 4.4-.016.336.017.673.1 1-3.522-.167-6.802-1.843-9-4.6-.41.66-.618 1.424-.6 2.2.016 1.488.764 2.872 2 3.7-.696-.01-1.38-.183-2-.5v.1c.003 2.08 1.463 3.874 3.5 4.3-.39.115-.793.182-1.2.2-.27.02-.543-.013-.8-.1.598 1.764 2.238 2.964 4.1 3-1.533 1.227-3.437 1.897-5.4 1.9-.337.022-.674-.012-1-.1 2 1.287 4.322 1.98 6.7 2 3.29.024 6.457-1.26 8.802-3.57 2.344-2.312 3.674-5.46 3.698-8.75v-.78c.803-.704 1.51-1.51 2.1-2.4"
				fill="#FFF"
			/>
		</g>
	</Symbol>
);

TwitterSymbol.defaultProps = {
	...defaultProps,
	viewBoxWidth: 32,
	viewBoxHeight: 32,
	label: 'Twitter',
};
TwitterSymbol.propTypes = propTypes;
