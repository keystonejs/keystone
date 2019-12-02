import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ExpandLessIcon, ExpandMoreIcon } from '@westpac/icon';
import { useBrand } from '@westpac/core';

import { AccordionLabel, Panel } from './styled';

export const Tab = forwardRef(
	(
		{ appearance, children, isLast, isSelected, label, mode, panelId, onClick, tabId, ...props },
		ref
	) => {
		const { COLORS } = useBrand();
		const Icon = isSelected ? ExpandLessIcon : ExpandMoreIcon;
		const iconLabel = isSelected ? 'Show Less' : 'Show More';

		return (
			<>
				{mode === 'accordion' ? (
					<AccordionLabel
						appearance={appearance}
						onClick={onClick}
						id={tabId}
						isLast={isLast}
						isSelected={isSelected}
						aria-controls={panelId}
						aria-expanded={isSelected}
					>
						<span>{label}</span>
						<Icon color={COLORS.muted} label={iconLabel} size="small" />
					</AccordionLabel>
				) : null}
				<Panel
					hidden={!isSelected}
					appearance={appearance}
					aria-labelledby={tabId}
					id={panelId}
					aria-selected={isSelected}
					isLast={isLast}
					isSelected={isSelected}
					mode={mode}
					role="tabpanel"
					ref={ref}
					tabIndex="0"
				>
					{children}
				</Panel>
			</>
		);
	}
);

Tab.propTypes = {
	/** The panel content for this tab */
	children: PropTypes.node.isRequired,
	// Whether this tab/panel is selected/expanded
	isSelected: PropTypes.bool,
	/** Provide a label that describes the purpose of the set of tabs. */
	label: PropTypes.string.isRequired,
	// Whether or not to display the accordion label
	mode: PropTypes.oneOf(['accordion', 'tabs']),
	// The id for this tab's panel
	panelId: PropTypes.string,
	// The onClick handler for the accordion label
	onClick: PropTypes.func,
	// The id for the tab
	tabId: PropTypes.string,
};
