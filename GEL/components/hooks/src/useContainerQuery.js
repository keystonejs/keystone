import React, { useLayoutEffect, useRef, useState } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

/**
 * Observes the height and width of `ref`
 * @param { current: HTMLElement } ref
 * @returns { height: number, width: number }
 */
export function useContainerQuery(ref) {
	const [height, setHeight] = useState(0);
	const [width, setWidth] = useState(0);

	// bail early without ref
	if (!ref) {
		throw new Error('You must pass a valid ref as the first argument.');
	}

	// Updates scheduled inside useLayoutEffect will be flushed synchronously,
	// before the browser has a chance to paint.
	useLayoutEffect(() => {
		// prepare the resize handler
		let resizeObserver = new ResizeObserver(([entry]) => {
			const newHeight = entry.target.offsetHeight;
			if (height !== newHeight) setHeight(newHeight);

			const newWidth = entry.target.offsetWidth;
			if (width !== newWidth) setWidth(newWidth);
		});

		// bind the observer to the consumer DOM node
		resizeObserver.observe(ref.current);

		// cleanup after ourselves
		return () => {
			resizeObserver.disconnect(ref.current);
		};
	});

	return { height, width };
}
