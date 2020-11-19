import { MutableRefObject, useEffect, useRef } from 'react';

type Direction = 'horizontal' | 'vertical' | 'both';

export type UseCollectionFocusProps = {
	/** A ref to the element containing the target items */
	containerRef: MutableRefObject<Element | undefined>;
	/** The direction mapping for arrow keys */
	direction?: Direction; // does this help anyone? like, left/up down/right is the same for non-sighted users...
	/** When to bind event handlers */
	listenWhen: boolean;
	/** Provide a callback for mouse/keyboard selection on each matching item */
	onSelect: (event: MouseEvent) => void;
	/** Which ARIA role(s) to target */
	targetRoles: string[];
};

const NOOP = () => {};

/**
 * Custom hook to manage focus using the "roving tab index" strategy;
 * letting the browser handle scroll on focus.
 *
 * https://www.w3.org/TR/wai-aria-practices/#kbd_roving_tabindex
 */
export function useCollectionFocus({
	                                   containerRef,
	                                   direction = 'vertical',
	                                   listenWhen,
	                                   onSelect = NOOP,
	                                   targetRoles,
                                   }: UseCollectionFocusProps) {
	let focusableElements = useRef<HTMLElement[]>();
	let currentFocusElement = useRef<HTMLElement>();

	// reset tab indexes and focus
	function focus(targetElement: HTMLElement): void {
		const elements = focusableElements.current as HTMLElement[];

		// reset all indexes first
		elements.forEach((element) => {
			element.tabIndex = -1;
		});

		targetElement.tabIndex = 0;
		targetElement.focus();
		currentFocusElement.current = targetElement;
	}

	// focus the element on mouse enter
	function handleMouseEnter(event: MouseEvent): void {
		const element = event.target as HTMLElement;
		focus(element);
	}

	// handle key down
	function handleKeyDown(event: Event): void {
		const eventKey = (event as KeyboardEvent).key;
		const els = focusableElements.current;
		const current = currentFocusElement.current;

		if (els && current) {
			const currentIndex = els.indexOf(current);
			const lastIndex = els?.length - 1;

			if (isNextKey(eventKey, direction)) {
				event.preventDefault();
				focus(els[Math.min(currentIndex + 1, lastIndex)]);
			}

			if (isPreviousKey(eventKey, direction)) {
				event.preventDefault();
				focus(els[Math.max(currentIndex - 1, 0)]);
			}

			if (eventKey === 'Home') {
				event.preventDefault();
				focus(els[0]);
			}

			if (eventKey === 'End') {
				event.preventDefault();
				focus(els[lastIndex]);
			}
		}
	}

	// initialise
	useEffect(() => {
		if (listenWhen && containerRef.current) {
			const container = containerRef.current;
			const query = targetRoles.map((r) => `[role=${r}]`).join(',');
			const nodeList = container.querySelectorAll(query);

			// set initial values
			focusableElements.current = Array.from(nodeList) as HTMLElement[];
			currentFocusElement.current = focusableElements.current[0];
			currentFocusElement.current.focus();

			container.addEventListener('keydown', handleKeyDown);

			if (focusableElements.current?.length) {
				focusableElements.current.forEach((el) => {
					el.addEventListener('mouseenter', handleMouseEnter);
					el.addEventListener('click', onSelect);
				});
			}

			return () => {
				container.removeEventListener('keydown', handleKeyDown);

				if (focusableElements.current?.length) {
					focusableElements.current.forEach((el) => {
						el.removeEventListener('mouseenter', handleMouseEnter);
						el.addEventListener('click', onSelect);
					});
				}
			};
		}
	}, [listenWhen]); // eslint-disable-line react-hooks/exhaustive-deps

	return { focusableElements };
}

// Utils
// ------------------------------

function isPreviousKey(key: KeyboardEvent['key'], direction: Direction) {
	switch (direction) {
		case 'horizontal':
			return key === 'ArrowLeft';
		case 'vertical':
			return key === 'ArrowUp';
		case 'both':
			return key === 'ArrowLeft' || key === 'ArrowUp';
		default:
			return false;
	}
}
function isNextKey(key: KeyboardEvent['key'], direction: Direction) {
	switch (direction) {
		case 'horizontal':
			return key === 'ArrowRight';
		case 'vertical':
			return key === 'ArrowDown';
		case 'both':
			return key === 'ArrowRight' || key === 'ArrowDown';
		default:
			return false;
	}
}
