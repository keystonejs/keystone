import React, { Children, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useContainerQuery } from '@westpac/hooks';

import { TabItem, TabRow } from './styled';
import { Tab } from './Tab';

let instanceId = 0;
const VALID_KEYS = ['ArrowLeft', 'ArrowRight', 'Enter', 'PageDown', 'PageUp', 'End', 'Home'];

export const Tabcordion = props => {
	// TODO: unless explicitly provided, preset the intial index
	// const initialIndex =
	// 	props.initialTabIndex !== undefined ? props.initialTabIndex : mode === 'accordion' ? null : 0;

	const [activeTabIndex, setActiveTabIndex] = useState(props.initialTabIndex);
	const [instancePrefix, setInstancePrefix] = useState(props.instanceId);

	const containerRef = useRef();
	const panelRef = useRef();
	const tablistRef = useRef();
	const { width } = useContainerQuery(containerRef);
	const mode = props.mode !== 'responsive' ? props.mode : width < 768 ? 'accordion' : 'tabs';
	const setActive = idx => () => setActiveTabIndex(idx);

	// create the prefix for internal IDs
	useEffect(() => {
		if (!instancePrefix) {
			setInstancePrefix(`gel-tabcordion-${++instanceId}`);
		}
	}, [instancePrefix]);

	// handle keys
	const keyHandler = event => {
		// bail unless a tab belonging to this tablist is focused
		if (!tablistRef.current || !tablistRef.current.contains(document.activeElement)) return;

		// bail on unknown keys
		if (VALID_KEYS.indexOf(event.key) === -1) return;

		// prevent scrolling when user navigates using keys that would influence
		// page scroll
		if (['PageDown', 'End', 'PageUp', 'Home'].indexOf(event.key) > -1) {
			event.preventDefault();
		}

		let nextIndex;
		let lastIndex = Children.count(props.children) - 1;

		switch (event.key) {
			case 'Enter':
				panelRef.current.focus(); // select the active panel
				break;
			case 'ArrowLeft':
				nextIndex = activeTabIndex === 0 ? lastIndex : activeTabIndex - 1;
				break;
			case 'ArrowRight':
				nextIndex = activeTabIndex === lastIndex ? 0 : activeTabIndex + 1;
				break;
			case 'PageDown':
			case 'End':
				nextIndex = lastIndex;
				break;
			case 'PageUp':
			case 'Home':
				nextIndex = 0;
				break;
			default:
				nextIndex = activeTabIndex;
		}

		// only update to valid index
		if (typeof nextIndex === 'number') {
			setActiveTabIndex(nextIndex);
		}
	};

	// bind key events
	useEffect(() => {
		window.document.addEventListener('keydown', keyHandler);
		return () => {
			window.document.removeEventListener('keydown', keyHandler);
		};
	});

	const getId = (type, index) => `${instancePrefix}-${type}-${index + 1}`;
	const tabCount = Children.count(props.children);

	return (
		<div ref={containerRef}>
			{mode === 'tabs' ? (
				<TabRow role="tablist" aria-label={props.ariaLabel} ref={tablistRef}>
					{Children.map(props.children, (child, idx) => {
						const isSelected = activeTabIndex === idx;
						return (
							<TabItem
								appearance={props.appearance}
								aria-controls={getId('panel', idx)}
								aria-selected={isSelected}
								id={getId('tab', idx)}
								isJustified={props.justifyTabs}
								isLast={idx + 1 === tabCount}
								isSelected={isSelected}
								key={child.props.label}
								onClick={setActive(idx)}
								role="tab"
								tabIndex={isSelected ? 0 : -1}
							>
								{child.props.label}
							</TabItem>
						);
					})}
				</TabRow>
			) : null}

			{Children.map(props.children, (child, idx) => {
				const isSelected = activeTabIndex === idx;
				return (
					<Tab
						{...child.props}
						activeTabIndex={activeTabIndex}
						appearance={props.appearance}
						isSelected={isSelected}
						isLast={idx + 1 === tabCount}
						key={child.props.label}
						mode={mode}
						onClick={setActive(idx)}
						panelId={getId('panel', idx)}
						ref={isSelected ? panelRef : null}
						tabId={getId('tab', idx)}
					/>
				);
			})}
		</div>
	);
};

Tabcordion.propTypes = {
	/** The appearance of the tabs */
	appearance: PropTypes.oneOf(['soft', 'lego']),
	/** Provide a label that describes the purpose of the set of tabs. */
	ariaLabel: PropTypes.string,
	/** An array of Tab components that can be navigated through */
	children: PropTypes.arrayOf(
		PropTypes.shape({
			type: PropTypes.oneOf([Tab]),
		})
	).isRequired,
	/** The tab index to mount this component with */
	initialTabIndex: PropTypes.number,
	/** Define an id prefix for the elements e.g. for a prefix of "sidebar-tabs" --> "sidebar-tabs-panel-1" etc. */
	instanceId: PropTypes.string,
	/** Whether or not tabs should stretch full width */
	justifyTabs: PropTypes.bool,
	/** Lock the mode to either "accordion" or "tabs". The default is responsive. */
	mode: PropTypes.oneOf(['accordion', 'responsive', 'tabs']),
};
Tabcordion.defaultProps = {
	appearance: 'soft',
	initialTabIndex: 0,
	justifyTabs: false,
	mode: 'responsive',
};
